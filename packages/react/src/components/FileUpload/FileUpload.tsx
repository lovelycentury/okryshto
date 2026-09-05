"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import {
  iconAlertTriangle,
  iconArchive,
  iconCode,
  iconFile,
  iconFilm,
  iconImage,
  iconInfo,
  iconMusic,
  iconTrash,
  iconUpload,
} from "@okkly/icons";
import {
  formatFileSize,
  useFileUpload,
  type BinaryPrefixedSize,
  type FileType,
  type FileUploadIssue,
} from "@okkly/react-hooks";
import "@okkly/design-system/components/FileUpload/FileUpload.scss";
import { IconButton } from "../IconButton/IconButton";
import { Tooltip } from "../Tooltip/Tooltip";

export type FileUploadSize = "large" | "medium" | "small";
export type FileUploadListType = "list" | "maxHeight" | "button" | "hidden";
export type FileUploadStatusColor =
  "primary" | "neutral" | "danger" | "warning" | "success" | "info";

/** Status line shown under a file name, optionally with a progress bar. */
export interface FileUploadStatus {
  /**
   * Status text shown next to the file size.
   *
   * @default undefined
   * @type {ReactNode}
   */
  text?: ReactNode;
  /**
   * Status color. Also tints the progress bar.
   *
   * @default "neutral"
   * @type {FileUploadStatusColor}
   */
  color?: FileUploadStatusColor;
  /**
   * Upload progress in percent (0–100). Renders a progress bar at the bottom of the row.
   *
   * @default undefined
   * @type {number}
   */
  progress?: number;
}

/** Every user-facing string of the component, so it can be translated without an i18n layer. */
export interface FileUploadLabels {
  trigger: string;
  clickToUpload: string;
  orDragAndDrop: string;
  maxSizeHint: (size: string) => string;
  maxTotalSizeHint: (size: string, totalSize: string) => string;
  totalSizeHint: (totalSize: string) => string;
  maxCountHint: (count: number) => string;
  allowedTypesHint: (types: string) => string;
  requiredError: string;
  fileTypeError: (extension: string) => string;
  maxSizeError: (size: string) => string;
  maxTotalSizeError: (size: string) => string;
  maxCountError: (count: number) => string;
  removeFile: (filename: string) => string;
  showFiles: string;
  hideFiles: string;
}

export const defaultFileUploadLabels: FileUploadLabels = {
  trigger: "Select file",
  clickToUpload: "Click to upload",
  orDragAndDrop: "or drag and drop",
  maxSizeHint: (size) => `Max. file size: ${size}`,
  maxTotalSizeHint: (size, totalSize) => `Max. file size: ${size} (${totalSize} in total)`,
  totalSizeHint: (totalSize) => `Max. file size: ${totalSize} in total`,
  maxCountHint: (count) => `Max. ${count} files`,
  allowedTypesHint: (types) => `Allowed file types: ${types}`,
  requiredError: "Please select a file.",
  fileTypeError: (extension) => `.${extension} files are not allowed`,
  maxSizeError: (size) => `Exceeds the max. file size of ${size}`,
  maxTotalSizeError: (size) => `Exceeds the max. total size of ${size}`,
  maxCountError: (count) => `Exceeds the limit of ${count} files`,
  removeFile: (filename) => `Remove ${filename}`,
  showFiles: "Show files",
  hideFiles: "Hide files",
};

type FileUploadValue<TMultiple extends boolean> = TMultiple extends true ? File[] : File | null;

/**
 * Props follow sit-onyx's OnyxFileUpload API
 * (https://onyx.schwarz/development/components/file-upload.html) as closely as React
 * allows: `multiple`/`accept`/`maxSize`/`maxTotalSize`/`maxCount`/`replace`/`size`/
 * `listType`/`required`/`name`/`disabled` match name-for-name, and onyx's `v-model`
 * becomes MUI-style `value`/`defaultValue`/`onChange`. Onyx's default slot for
 * overriding a file row becomes `renderFile`.
 * Deliberate gaps: no `density`/`skeleton` (neither exists in this library yet), and
 * no `OnyxFileCard` — the file row is rendered inline and customized via `renderFile`.
 */
export interface FileUploadProps<TMultiple extends boolean = false> {
  /**
   * Currently selected file(s) — an array when `multiple`, a single file otherwise.
   * Makes the component controlled.
   *
   * @default undefined
   * @type {FileUploadValue<TMultiple>}
   */
  value?: FileUploadValue<TMultiple>;
  /**
   * Initially selected file(s) for uncontrolled usage.
   *
   * @default undefined
   * @type {FileUploadValue<TMultiple>}
   */
  defaultValue?: FileUploadValue<TMultiple>;
  /**
   * Called whenever the selection changes.
   *
   * @default undefined
   * @type {(value: FileUploadValue<TMultiple>) => void}
   */
  onChange?: (value: FileUploadValue<TMultiple>) => void;
  /**
   * Whether multiple files can be selected. Also switches `value` to an array.
   *
   * @default false
   * @type {TMultiple}
   */
  multiple?: TMultiple;
  /**
   * File types to allow, e.g. `[".pdf", "image/*"]`. Empty allows every type.
   *
   * @default undefined
   * @type {FileType[]}
   */
  accept?: FileType[];
  /**
   * Max. allowed size per file — bytes or a binary prefixed size (e.g. `"42MiB"`).
   * Shown to the user in decimal notation (44.1 MB).
   *
   * @default undefined
   * @type {number | BinaryPrefixedSize}
   */
  maxSize?: number | BinaryPrefixedSize;
  /**
   * Max. allowed size of all files combined when `multiple` is enabled.
   *
   * @default undefined
   * @type {number | BinaryPrefixedSize}
   */
  maxTotalSize?: number | BinaryPrefixedSize;
  /**
   * Max. number of files that can be selected when `multiple` is enabled.
   *
   * @default undefined
   * @type {number}
   */
  maxCount?: number;
  /**
   * Whether a new selection replaces the current one instead of being appended.
   *
   * @default false
   * @type {boolean}
   */
  replace?: boolean;
  /**
   * Visual size of the drop zone. `large` is the illustrated drop zone, `medium` a
   * compact one, `small` a button-like trigger whose error is shown in a tooltip.
   *
   * @default "large"
   * @type {FileUploadSize}
   */
  size?: FileUploadSize;
  /**
   * How the selected files are listed. `maxHeight` scrolls after
   * `--okkly-file-upload-max-files` rows, `button` adds a show/hide toggle and
   * `hidden` renders no list at all (for a custom one).
   *
   * @default "list"
   * @type {FileUploadListType}
   */
  listType?: FileUploadListType;
  /**
   * Whether at least one file is required.
   *
   * @default false
   * @type {boolean}
   */
  required?: boolean;
  /**
   * Forces the error state. When omitted, the error state follows the built-in
   * validation (required + per-file constraints).
   *
   * @default undefined
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Whether validation messages are shown. When omitted they appear once the user has
   * interacted with the component.
   *
   * @default undefined
   * @type {boolean}
   */
  showError?: boolean;
  /**
   * Name of the underlying file input, for native form submission.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Whether the upload is disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Label rendered above the drop zone.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Overrides for the user-facing strings.
   *
   * @default defaultFileUploadLabels
   * @type {Partial<FileUploadLabels>}
   */
  labels?: Partial<FileUploadLabels>;
  /**
   * Locale used to format file sizes.
   *
   * @default undefined
   * @type {string}
   */
  locale?: string;
  /**
   * Status shown for a file — e.g. real upload progress. Overrides the built-in
   * validation status when it returns a value.
   *
   * @default undefined
   * @type {(file: File, index: number) => FileUploadStatus | undefined}
   */
  getFileStatus?: (file: File, index: number) => FileUploadStatus | undefined;
  /**
   * Renders a file row instead of the built-in one.
   *
   * @default undefined
   * @type {(context: FileUploadRenderContext) => ReactNode}
   */
  renderFile?: (context: FileUploadRenderContext) => ReactNode;
  /**
   * Called whenever the validity of the underlying input changes.
   *
   * @default undefined
   * @type {(validity: ValidityState) => void}
   */
  onValidityChange?: (validity: ValidityState) => void;
  /**
   * If `true`, the component takes the full width of its container.
   *
   * @default false
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Ref to the underlying file input.
   *
   * @default undefined
   * @type {Ref<HTMLInputElement>}
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Id.
   *
   * @default undefined
   * @type {string}
   */
  id?: string;
}

/** What `renderFile` receives for each selected file. */
export interface FileUploadRenderContext {
  file: File;
  index: number;
  status?: FileUploadStatus;
  disabled: boolean;
  remove: () => void;
}

const ICONS_BY_TYPE: [test: RegExp, icon: string][] = [
  [/^image\//, iconImage],
  [/^video\//, iconFilm],
  [/^audio\//, iconMusic],
  [/(zip|tar|gzip|rar|7z)/, iconArchive],
  [/(json|javascript|typescript|xml|html|css)/, iconCode],
];

function getFileIcon(file: File): string {
  const type = file.type.toLowerCase();
  return ICONS_BY_TYPE.find(([test]) => test.test(type))?.[1] ?? iconFile;
}

function Icon({ svg, className }: { svg: string; className?: string }) {
  // @okkly/icons ships trusted, build-time bundled SVG strings — not user input.
  return (
    <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

/**
 * Drop zone for selecting files, with drag & drop, per-file validation and a list of
 * the current selection.
 */
export function FileUpload<TMultiple extends boolean = false>({
  value,
  defaultValue,
  onChange,
  multiple,
  accept,
  maxSize,
  maxTotalSize,
  maxCount,
  replace = false,
  size = "large",
  listType = "list",
  required = false,
  error,
  showError,
  name,
  disabled = false,
  label,
  labels,
  locale,
  getFileStatus,
  renderFile,
  onValidityChange,
  fullWidth = false,
  inputRef,
  className,
  id,
}: FileUploadProps<TMultiple>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const isMultiple = multiple === true;

  const [touched, setTouched] = useState(false);
  const [filesHidden, setFilesHidden] = useState(false);
  const localInputRef = useRef<HTMLInputElement | null>(null);

  const text = useMemo(() => ({ ...defaultFileUploadLabels, ...labels }), [labels]);
  const format = (fileSize: number | BinaryPrefixedSize) => formatFileSize(fileSize, locale);

  const toFiles = (next: FileUploadValue<TMultiple> | undefined): File[] | undefined => {
    if (next === undefined) return undefined;
    if (Array.isArray(next)) return next;
    return next ? [next] : [];
  };

  const upload = useFileUpload({
    value: toFiles(value),
    defaultValue: toFiles(defaultValue),
    onChange: (files) => {
      setTouched(true);
      onChange?.((isMultiple ? files : (files[0] ?? null)) as FileUploadValue<TMultiple>);
    },
    accept,
    multiple: isMultiple,
    replace,
    maxSize,
    maxTotalSize: isMultiple ? maxTotalSize : undefined,
    maxCount: isMultiple ? maxCount : undefined,
    disabled,
  });

  const issueMessage = (issue: FileUploadIssue): string => {
    switch (issue.type) {
      case "fileType":
        return text.fileTypeError(issue.extension);
      case "maxSize":
        return text.maxSizeError(format(issue.maxSize));
      case "maxTotalSize":
        return text.maxTotalSizeError(format(issue.maxTotalSize));
      case "maxCount":
        return text.maxCountError(issue.maxCount);
    }
  };

  const requiredMessage = required && upload.files.length === 0 ? text.requiredError : undefined;
  const firstIssue = upload.issues.find(Boolean);
  const validationMessage = requiredMessage ?? (firstIssue ? issueMessage(firstIssue) : undefined);

  const errorVisible = showError ?? touched;
  // per-file issues are reported on their own row, so the drop zone only carries the
  // required error — it would otherwise repeat every row's message
  const errorMessage = errorVisible ? requiredMessage : undefined;
  const hasError = error ?? (errorVisible && Boolean(validationMessage));

  // keep the input's FileList in sync so `name` submits with the form and so the
  // validation message is anchored to a real form control
  useEffect(() => {
    const input = localInputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    try {
      const transfer = new DataTransfer();
      upload.files.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    } catch {
      // environments without full DataTransfer support (e.g. jsdom) keep the input empty
    }
  }, [upload.files]);

  useEffect(() => {
    const input = localInputRef.current;
    if (!input) return;
    input.setCustomValidity(validationMessage ?? "");
    onValidityChange?.(input.validity);
  }, [validationMessage, onValidityChange]);

  const hasConstraints = Boolean(
    maxSize || (isMultiple && (maxTotalSize || maxCount)) || accept?.length,
  );
  const showDetails = size === "large" || (size !== "small" && hasConstraints);
  const showList =
    listType !== "hidden" && upload.files.length > 0 && !(listType === "button" && filesHidden);

  const classes = [
    "okkly-component",
    "okkly-file-upload",
    size !== "large" && `okkly-file-upload--${size}`,
    upload.isDragging && "okkly-file-upload--dragging",
    hasError && "okkly-file-upload--error",
    fullWidth && "okkly-file-upload--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rootProps = upload.getRootProps();
  const inputProps = upload.getInputProps({
    ref: (node: HTMLInputElement | null) => {
      localInputRef.current = node;
      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef && "current" in inputRef) {
        (inputRef as { current: HTMLInputElement | null }).current = node;
      }
    },
  });

  const dropzone = (
    <button
      {...rootProps}
      type="button"
      id={fieldId}
      className="okkly-file-upload__dropzone"
      disabled={disabled}
      aria-labelledby={label ? `${fieldId}-label` : undefined}
      aria-describedby={errorMessage && size !== "small" ? `${fieldId}-error` : undefined}
      aria-required={required || undefined}
      aria-invalid={hasError || undefined}
      onClick={(event) => {
        setTouched(true);
        rootProps.onClick?.(event);
      }}
    >
      {size === "large" ? (
        <Icon svg={iconUpload} className="okkly-file-upload__illustration" />
      ) : (
        <span className="okkly-file-upload__trigger">
          <Icon svg={iconUpload} />
          {text.trigger}
        </span>
      )}

      {showDetails && (
        <span className="okkly-file-upload__content">
          {size === "large" && (
            <span className="okkly-file-upload__title">
              <u>{text.clickToUpload}</u> {text.orDragAndDrop}
            </span>
          )}

          {maxSize != null && (
            <span className="okkly-file-upload__hint">
              {isMultiple && maxTotalSize != null
                ? text.maxTotalSizeHint(format(maxSize), format(maxTotalSize))
                : text.maxSizeHint(format(maxSize))}
            </span>
          )}
          {maxSize == null && isMultiple && maxTotalSize != null && (
            <span className="okkly-file-upload__hint">
              {text.totalSizeHint(format(maxTotalSize))}
            </span>
          )}
          {isMultiple && maxCount != null && (
            <span className="okkly-file-upload__hint">{text.maxCountHint(maxCount)}</span>
          )}
          {accept?.length ? (
            <span className="okkly-file-upload__hint">
              {text.allowedTypesHint(accept.join(", "))}
            </span>
          ) : null}

          {errorMessage && (
            <span className="okkly-file-upload__error" id={`${fieldId}-error`}>
              {errorMessage}
              <Icon svg={iconInfo} />
            </span>
          )}
        </span>
      )}
    </button>
  );

  return (
    <div className={classes}>
      {label && (
        <span id={`${fieldId}-label`} className="okkly-file-upload__label">
          {label}
        </span>
      )}

      {size === "small" && errorMessage ? (
        <Tooltip title={errorMessage}>{dropzone}</Tooltip>
      ) : (
        dropzone
      )}

      <input
        {...inputProps}
        className="okkly-file-upload__input"
        name={name}
        tabIndex={-1}
        aria-hidden="true"
      />

      {listType === "button" && upload.files.length > 0 && (
        <button
          type="button"
          className="okkly-file-upload__list-toggle"
          onClick={() => setFilesHidden((hidden) => !hidden)}
        >
          {filesHidden ? text.showFiles : text.hideFiles}
        </button>
      )}

      {showList && (
        <ul
          className={[
            "okkly-file-upload__list",
            listType === "maxHeight" && "okkly-file-upload__list--max-height",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {upload.files.map((file, index) => {
            const issue = upload.issues[index];
            const status: FileUploadStatus | undefined =
              getFileStatus?.(file, index) ??
              (issue ? { text: issueMessage(issue), color: "danger" } : undefined);
            const remove = () => {
              setTouched(true);
              upload.remove(index);
            };
            const key = `${file.name}-${file.lastModified}-${index}`;

            if (renderFile) {
              return <li key={key}>{renderFile({ file, index, status, disabled, remove })}</li>;
            }

            return (
              <li
                key={key}
                className={[
                  "okkly-file-upload__file",
                  status?.color === "danger" && "okkly-file-upload__file--error",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="okkly-file-upload__file-icon">
                  <Icon svg={status?.color === "danger" ? iconAlertTriangle : getFileIcon(file)} />
                </span>

                <span className="okkly-file-upload__file-body">
                  <span className="okkly-file-upload__file-name">{file.name}</span>
                  <span className="okkly-file-upload__file-details">
                    <span>{format(file.size)}</span>
                    {status?.text != null && (
                      <span
                        className={`okkly-file-upload__file-status okkly-file-upload__file-status--${status.color ?? "neutral"}`}
                      >
                        {status.text}
                      </span>
                    )}
                  </span>
                </span>

                <span className="okkly-file-upload__file-actions">
                  <IconButton
                    variant="ghost"
                    size="small"
                    aria-label={text.removeFile(file.name)}
                    disabled={disabled}
                    onClick={remove}
                    icon={<Icon svg={iconTrash} />}
                  />
                </span>

                {status?.progress != null && (
                  <span className="okkly-file-upload__progress">
                    <span
                      className={`okkly-file-upload__progress-bar okkly-file-upload__progress-bar--${status.color ?? "primary"}`}
                      style={{ width: `${Math.min(Math.max(status.progress, 0), 100)}%` }}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
