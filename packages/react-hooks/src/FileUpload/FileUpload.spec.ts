import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFileUpload } from "./FileUpload";
import { formatFileSize, parseFileSize } from "./fileSize";

function sized(name: string, size: number, type = ""): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function select(result: { current: ReturnType<typeof useFileUpload> }, files: File[]) {
  act(() =>
    result.current.getInputProps().onChange?.({
      defaultPrevented: false,
      currentTarget: { files, value: "" },
    } as never),
  );
}

describe("useFileUpload", () => {
  it("accepts files and reports them", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useFileUpload({ accept: [".png"], onChange }));
    const file = sized("photo.png", 10, "image/png");

    select(result, [file]);

    expect(onChange).toHaveBeenCalledWith([file]);
    expect(result.current.files).toEqual([file]);
  });

  it("keeps files with a disallowed type and reports the issue", () => {
    const { result } = renderHook(() => useFileUpload({ accept: [".png"] }));

    select(result, [sized("notes.txt", 10, "text/plain")]);

    expect(result.current.files).toHaveLength(1);
    expect(result.current.issues[0]).toMatchObject({ type: "fileType", extension: "txt" });
    expect(result.current.hasIssues).toBe(true);
  });

  it("reports maxSize and maxTotalSize issues, cumulatively", () => {
    const { result } = renderHook(() =>
      useFileUpload({ multiple: true, maxSize: "1KiB", maxTotalSize: 3000 }),
    );

    select(result, [sized("a", 2048), sized("b", 900), sized("c", 900)]);

    expect(result.current.issues[0]).toMatchObject({ type: "maxSize", maxSize: 1024 });
    expect(result.current.issues[1]).toBeUndefined();
    expect(result.current.issues[2]).toMatchObject({ type: "maxTotalSize", maxTotalSize: 3000 });
  });

  it("reports files beyond maxCount", () => {
    const { result } = renderHook(() => useFileUpload({ multiple: true, maxCount: 2 }));

    select(result, [sized("a", 10), sized("b", 10), sized("c", 10)]);

    expect(result.current.issues[1]).toBeUndefined();
    expect(result.current.issues[2]).toMatchObject({ type: "maxCount", maxCount: 2 });
  });

  it("keeps only the last file when multiple is disabled", () => {
    const { result } = renderHook(() => useFileUpload());

    select(result, [sized("a.png", 10), sized("b.png", 10)]);

    expect(result.current.files.map((file) => file.name)).toEqual(["a.png"]);
  });

  it("appends by default and replaces when replace is set", () => {
    const { result, rerender } = renderHook(
      ({ replace }) => useFileUpload({ multiple: true, replace }),
      {
        initialProps: { replace: false },
      },
    );

    select(result, [sized("a.png", 10)]);
    select(result, [sized("b.png", 10)]);
    expect(result.current.files).toHaveLength(2);

    rerender({ replace: true });
    select(result, [sized("c.png", 10)]);
    expect(result.current.files.map((file) => file.name)).toEqual(["c.png"]);
  });

  it("supports controlled usage", () => {
    const onChange = vi.fn();
    const file = sized("a.png", 10);
    const { result } = renderHook(() => useFileUpload({ multiple: true, value: [file], onChange }));

    select(result, [sized("b.png", 10)]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(result.current.files).toEqual([file]);
  });

  it("removes files by index and by reference, and clears them", () => {
    const first = sized("a.png", 10);
    const second = sized("b.png", 10);
    const { result } = renderHook(() => useFileUpload({ multiple: true }));

    select(result, [first, second]);
    act(() => result.current.remove(0));
    expect(result.current.files).toEqual([second]);

    act(() => result.current.remove(second));
    expect(result.current.files).toEqual([]);

    select(result, [first]);
    act(() => result.current.clear());
    expect(result.current.files).toEqual([]);
  });

  it("ignores selections while disabled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useFileUpload({ disabled: true, onChange }));

    select(result, [sized("a.png", 10)]);

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.files).toEqual([]);
  });

  it("tracks dragging state across nested drag targets", () => {
    const { result } = renderHook(() => useFileUpload());
    const root = () => result.current.getRootProps();

    act(() => root().onDragEnter?.({ preventDefault: () => {} } as never));
    act(() => root().onDragEnter?.({ preventDefault: () => {} } as never));
    expect(result.current.isDragging).toBe(true);

    act(() => root().onDragLeave?.({ preventDefault: () => {} } as never));
    expect(result.current.isDragging).toBe(true);

    act(() => root().onDragLeave?.({ preventDefault: () => {} } as never));
    expect(result.current.isDragging).toBe(false);
  });

  it("adds dropped files", () => {
    const file = sized("dropped.png", 10, "image/png");
    const { result } = renderHook(() => useFileUpload());

    act(() =>
      result.current.getRootProps().onDrop?.({
        preventDefault: () => {},
        dataTransfer: { files: [file] },
      } as never),
    );

    expect(result.current.files).toEqual([file]);
  });
});

describe("file size utils", () => {
  it("parses binary prefixed sizes", () => {
    expect(parseFileSize(42)).toBe(42);
    expect(parseFileSize("1KiB")).toBe(1024);
    expect(parseFileSize("42MiB")).toBe(42 * 1024 * 1024);
    expect(parseFileSize("512B")).toBe(512);
  });

  it("formats sizes in decimal notation", () => {
    expect(formatFileSize(512, "en-US")).toBe("512 B");
    expect(formatFileSize(1500, "en-US")).toBe("1.5 KB");
    expect(formatFileSize("42MiB", "en-US")).toBe("44 MB");
  });
});
