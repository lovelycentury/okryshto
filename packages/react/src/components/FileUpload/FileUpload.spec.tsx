import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileUpload } from "./FileUpload";

function sized(name: string, size: number, type = ""): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function selectFiles(container: HTMLElement, files: File[]) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files } });
}

describe("FileUpload", () => {
  it("renders the large drop zone by default, with no modifier classes", () => {
    const { container } = render(<FileUpload label="Upload" />);
    const root = container.querySelector(".okkly-file-upload")!;

    expect(screen.getByText("Click to upload")).toBeInTheDocument();
    expect(root.className).not.toMatch(/okkly-file-upload--/);
  });

  it("applies the size modifier for medium and small", () => {
    const { container, rerender } = render(<FileUpload size="medium" />);
    expect(container.querySelector(".okkly-file-upload")).toHaveClass("okkly-file-upload--medium");

    rerender(<FileUpload size="small" />);
    expect(container.querySelector(".okkly-file-upload")).toHaveClass("okkly-file-upload--small");

    rerender(<FileUpload size="large" />);
    expect(container.querySelector(".okkly-file-upload")!.className).not.toMatch(
      /--medium|--small/,
    );
  });

  it("selects a single file and reports it as a single value", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload onChange={onChange} />);
    const file = sized("cover.png", 1024, "image/png");

    selectFiles(container, [file]);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.getByText("cover.png")).toBeInTheDocument();
  });

  it("appends files when multiple is enabled and reports an array", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload multiple onChange={onChange} />);
    const first = sized("a.png", 1024, "image/png");
    const second = sized("b.png", 2048, "image/png");

    selectFiles(container, [first]);
    selectFiles(container, [second]);

    expect(onChange).toHaveBeenLastCalledWith([first, second]);
    expect(screen.getByText("a.png")).toBeInTheDocument();
    expect(screen.getByText("b.png")).toBeInTheDocument();
  });

  it("replaces the selection when replace is set", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload multiple replace onChange={onChange} />);
    const first = sized("a.png", 1024, "image/png");
    const second = sized("b.png", 2048, "image/png");

    selectFiles(container, [first]);
    selectFiles(container, [second]);

    expect(onChange).toHaveBeenLastCalledWith([second]);
  });

  it("keeps a file with a disallowed type and marks it", () => {
    const { container } = render(<FileUpload accept={[".png"]} />);

    selectFiles(container, [sized("notes.txt", 10, "text/plain")]);

    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    expect(screen.getByText(".txt files are not allowed")).toBeInTheDocument();
    expect(container.querySelector(".okkly-file-upload")).toHaveClass("okkly-file-upload--error");
    expect(container.querySelector(".okkly-file-upload__file")).toHaveClass(
      "okkly-file-upload__file--error",
    );
  });

  it("marks files exceeding maxSize, formatted in decimal notation", () => {
    const { container } = render(<FileUpload maxSize="1MiB" />);

    selectFiles(container, [sized("big.png", 4 * 1024 * 1024, "image/png")]);

    expect(screen.getByText("Exceeds the max. file size of 1 MB")).toBeInTheDocument();
  });

  it("marks files beyond maxCount and maxTotalSize", () => {
    const { container } = render(<FileUpload multiple maxCount={1} maxTotalSize={2000} />);

    selectFiles(container, [sized("a.png", 900, "image/png"), sized("b.png", 1500, "image/png")]);

    expect(screen.getByText("Exceeds the max. total size of 2 KB")).toBeInTheDocument();
  });

  it("removes a file from the list", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload multiple onChange={onChange} />);
    const file = sized("cover.png", 1024, "image/png");

    selectFiles(container, [file]);
    fireEvent.click(screen.getByRole("button", { name: "Remove cover.png" }));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByText("cover.png")).not.toBeInTheDocument();
  });

  it("shows the required error once shown and clears it when a file is selected", () => {
    const { container } = render(<FileUpload required showError />);

    expect(screen.getByText("Please select a file.")).toBeInTheDocument();

    selectFiles(container, [sized("cover.png", 1024, "image/png")]);

    expect(screen.queryByText("Please select a file.")).not.toBeInTheDocument();
  });

  it("hides validation messages until the user interacts", () => {
    render(<FileUpload required />);
    expect(screen.queryByText("Please select a file.")).not.toBeInTheDocument();
  });

  it("sets the custom validity of the underlying input", () => {
    const onValidityChange = vi.fn();
    const { container } = render(<FileUpload required onValidityChange={onValidityChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input.validationMessage).toBe("Please select a file.");
    expect(onValidityChange).toHaveBeenCalled();
  });

  it("supports controlled usage", () => {
    const file = sized("cover.png", 1024, "image/png");
    const { rerender } = render(<FileUpload multiple value={[]} onChange={() => {}} />);

    expect(screen.queryByText("cover.png")).not.toBeInTheDocument();

    rerender(<FileUpload multiple value={[file]} onChange={() => {}} />);

    expect(screen.getByText("cover.png")).toBeInTheDocument();
  });

  it("adds files dropped onto the drop zone", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload onChange={onChange} />);
    const file = sized("dropped.png", 1024, "image/png");

    fireEvent.drop(container.querySelector(".okkly-file-upload__dropzone")!, {
      dataTransfer: { files: [file] },
    });

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("honors the list type", () => {
    const file = sized("cover.png", 1024, "image/png");
    const { container, rerender } = render(
      <FileUpload multiple defaultValue={[file]} listType="hidden" />,
    );
    expect(container.querySelector(".okkly-file-upload__list")).toBeNull();

    rerender(<FileUpload multiple defaultValue={[file]} listType="maxHeight" />);
    expect(container.querySelector(".okkly-file-upload__list")).toHaveClass(
      "okkly-file-upload__list--max-height",
    );

    rerender(<FileUpload multiple defaultValue={[file]} listType="button" />);
    fireEvent.click(screen.getByRole("button", { name: "Hide files" }));
    expect(container.querySelector(".okkly-file-upload__list")).toBeNull();
  });

  it("renders a custom row via renderFile", () => {
    const file = sized("cover.png", 1024, "image/png");
    render(
      <FileUpload
        multiple
        defaultValue={[file]}
        renderFile={({ file: f }) => <span>custom {f.name}</span>}
      />,
    );

    expect(screen.getByText("custom cover.png")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove cover.png" })).not.toBeInTheDocument();
  });

  it("shows an external status with a progress bar", () => {
    const file = sized("cover.png", 1024, "image/png");
    const { container } = render(
      <FileUpload
        multiple
        defaultValue={[file]}
        getFileStatus={() => ({ text: "Uploading…", color: "primary", progress: 40 })}
      />,
    );

    expect(screen.getByText("Uploading…")).toBeInTheDocument();
    expect(container.querySelector(".okkly-file-upload__progress-bar")).toHaveStyle({
      width: "40%",
    });
  });

  it("disables the drop zone and the remove button", () => {
    const file = sized("cover.png", 1024, "image/png");
    render(<FileUpload multiple defaultValue={[file]} disabled />);

    expect(screen.getByRole("button", { name: /click to upload/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove cover.png" })).toBeDisabled();
  });
});
