"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type MouseEvent,
  type Ref,
  type RefObject,
} from "react";
import { useControllableState } from "../ControllableState";
import { parseFileSize, type BinaryPrefixedSize } from "./fileSize";

/**
 * For a full list of media types, see the
 * [official docs](https://www.iana.org/assignments/media-types/media-types.xhtml).
 */
export type MediaType =
  `${"application" | "audio" | "font" | "image" | "model" | "text" | "video"}/${string}`;

/**
 * Unique file type specifier — a file extension (`".pdf"`), a wildcard media type
 * (`"image/*"`) or an exact media type (`"application/pdf"`).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file#unique_file_type_specifiers
 */
export type FileType = `.${string}` | `${"audio" | "video" | "image"}/*` | MediaType;

/**
 * Why a selected file is not accepted. Files carrying an issue stay in the selection —
 * the UI marks them so the user can remove them deliberately.
 */
export type FileUploadIssue =
  | { type: "fileType"; file: File; extension: string }
  | { type: "maxSize"; file: File; maxSize: number }
  | { type: "maxTotalSize"; file: File; maxTotalSize: number }
  | { type: "maxCount"; file: File; maxCount: number };

export interface UseFileUploadOptions {
  /** Currently selected files (controlled). */
  value?: File[];
  /** Initially selected files (uncontrolled). */
  defaultValue?: File[];
  /** Called whenever the selection changes. */
  onChange?: (files: File[]) => void;
  /** File types to allow. Empty/undefined allows everything. */
  accept?: FileType[];
  /** Whether more than one file can be selected. */
  multiple?: boolean;
  /** Whether a new selection replaces the current one instead of appending to it. */
  replace?: boolean;
  /** Max. allowed size per file, in bytes or as a binary prefixed size (e.g. `"42MiB"`). */
  maxSize?: number | BinaryPrefixedSize;
  /** Max. allowed size of all files combined, in bytes or as a binary prefixed size. */
  maxTotalSize?: number | BinaryPrefixedSize;
  /** Max. number of files that can be selected when `multiple` is enabled. */
  maxCount?: number;
  /** Whether selecting files is disabled. */
  disabled?: boolean;
}

/** Props for the drop zone element — `data-drag-active` is set while files hover it. */
export type FileUploadRootProps = HTMLAttributes<HTMLElement> & { "data-drag-active"?: true };

export interface UseFileUploadReturn {
  /** Currently selected files. */
  files: File[];
  /** Issue per selected file, aligned by index. `undefined` means the file is fine. */
  issues: (FileUploadIssue | undefined)[];
  /** Whether at least one selected file has an issue. */
  hasIssues: boolean;
  /** Whether files are currently being dragged over the drop zone. */
  isDragging: boolean;
  /** The file input rendered by the consumer. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Opens the native file picker. */
  open: () => void;
  /** Adds files, honoring `multiple`/`replace`. */
  add: (files: File[]) => void;
  /** Removes a file, either by reference or by index. */
  remove: (file: File | number) => void;
  /** Clears the selection. */
  clear: () => void;
  getRootProps: (props?: HTMLAttributes<HTMLElement>) => FileUploadRootProps;
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> },
  ) => InputHTMLAttributes<HTMLInputElement> & { ref: Ref<HTMLInputElement> };
}

const EMPTY_FILES: File[] = [];

/** Whether the file matches at least one of the accepted file type specifiers. */
export function matchesFileType(file: File, accept?: FileType[]): boolean {
  if (!accept?.length) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accept.some((specifier) => {
    const token = specifier.trim().toLowerCase();
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/** File extension without the leading dot, or an empty string if there is none. */
function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "") : "";
}

/**
 * Headless file upload — drag & drop, selection management and per-file validation.
 *
 * Validation never drops a file: every selected file is kept and, when it violates a
 * constraint, reported through `issues` so the UI can mark it and let the user remove it.
 */
export function useFileUpload({
  value,
  defaultValue,
  onChange,
  accept,
  multiple = false,
  replace = false,
  maxSize,
  maxTotalSize,
  maxCount,
  disabled = false,
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const [files, setFiles] = useControllableState<File[]>({
    value,
    defaultValue: defaultValue ?? EMPTY_FILES,
    onChange,
  });

  const maxSizeBytes = maxSize == null ? undefined : parseFileSize(maxSize);
  const maxTotalSizeBytes = maxTotalSize == null ? undefined : parseFileSize(maxTotalSize);

  const issues = useMemo<(FileUploadIssue | undefined)[]>(() => {
    let runningTotal = 0;

    return files.map((file, index) => {
      runningTotal += file.size;

      if (!matchesFileType(file, accept)) {
        return { type: "fileType", file, extension: getExtension(file.name) };
      }
      if (maxSizeBytes != null && file.size > maxSizeBytes) {
        return { type: "maxSize", file, maxSize: maxSizeBytes };
      }
      if (maxTotalSizeBytes != null && runningTotal > maxTotalSizeBytes) {
        return { type: "maxTotalSize", file, maxTotalSize: maxTotalSizeBytes };
      }
      if (multiple && maxCount != null && index >= maxCount) {
        return { type: "maxCount", file, maxCount };
      }
      return undefined;
    });
  }, [accept, files, maxCount, maxSizeBytes, maxTotalSizeBytes, multiple]);

  const hasIssues = issues.some(Boolean);

  const add = useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;

      if (!multiple) setFiles(incoming.slice(0, 1));
      else if (replace) setFiles([...incoming]);
      else setFiles([...files, ...incoming]);
    },
    [disabled, files, multiple, replace, setFiles],
  );

  const remove = useCallback(
    (file: File | number) => {
      const next =
        typeof file === "number"
          ? files.filter((_, index) => index !== file)
          : files.filter((current) => current !== file);
      setFiles(next);
    },
    [files, setFiles],
  );

  const clear = useCallback(() => setFiles([]), [setFiles]);

  const open = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const getRootProps = useCallback(
    (props: HTMLAttributes<HTMLElement> = {}) => {
      const { onClick, onDragEnter, onDragLeave, onDragOver, onDrop, ...rest } = props;

      return {
        ...rest,
        "data-drag-active": isDragging || undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          open();
        },
        onDragEnter: (event: DragEvent<HTMLElement>) => {
          onDragEnter?.(event);
          if (disabled) return;
          event.preventDefault();
          dragDepthRef.current += 1;
          setIsDragging(true);
        },
        onDragLeave: (event: DragEvent<HTMLElement>) => {
          onDragLeave?.(event);
          if (disabled) return;
          event.preventDefault();
          dragDepthRef.current -= 1;
          if (dragDepthRef.current <= 0) {
            dragDepthRef.current = 0;
            setIsDragging(false);
          }
        },
        onDragOver: (event: DragEvent<HTMLElement>) => {
          onDragOver?.(event);
          if (disabled) return;
          event.preventDefault();
        },
        onDrop: (event: DragEvent<HTMLElement>) => {
          onDrop?.(event);
          if (disabled) return;
          event.preventDefault();
          dragDepthRef.current = 0;
          setIsDragging(false);
          add(Array.from(event.dataTransfer?.files ?? []));
        },
      };
    },
    [add, disabled, isDragging, open],
  );

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> } = {}) => {
      const { onChange: onInputChange, ref: externalRef, ...rest } = props;

      return {
        ...rest,
        type: "file" as const,
        accept: accept?.length ? accept.join(",") : undefined,
        multiple,
        disabled,
        ref: (node: HTMLInputElement | null) => {
          inputRef.current = node;
          if (typeof externalRef === "function") externalRef(node);
          else if (externalRef && "current" in externalRef) {
            (externalRef as { current: HTMLInputElement | null }).current = node;
          }
        },
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          onInputChange?.(event);
          if (event.defaultPrevented || disabled) return;
          add(Array.from(event.currentTarget.files ?? []));
        },
      };
    },
    [accept, add, disabled, multiple],
  );

  return {
    files,
    issues,
    hasIssues,
    isDragging,
    inputRef,
    open,
    add,
    remove,
    clear,
    getRootProps,
    getInputProps,
  };
}
