import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { FileUpload } from "./FileUpload";

/**
 * Drop zone for selecting files — click or drag & drop, with per-file validation and a
 * list of the current selection.
 *
 * Files that violate a constraint are kept and marked in red instead of being dropped
 * silently, so the user can see what went wrong and remove them deliberately.
 */
const meta: Meta<typeof FileUpload> = {
  title: "Control/FileUpload",
  component: FileUpload,
  args: {
    label: "Attachments",
    accept: [".png", ".jpg", ".pdf"],
    multiple: true,
    maxSize: "10MiB",
    maxCount: 5,
    size: "large",
    listType: "list",
    fullWidth: false,
    disabled: false,
    required: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["large", "medium", "small"] },
    listType: { control: "inline-radio", options: ["list", "maxHeight", "button", "hidden"] },
  },
  render: (args) => (
    <div style={{ width: "26rem", maxWidth: "100%" }}>
      <FileUpload {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

/**
 * Creates a stand-in file so stories can show a populated state without a file picker.
 * The `File` constructor derives `size` from its content, so it is overridden here.
 */
function sized(name: string, sizeInBytes: number, type = ""): File {
  const file = new File([new Uint8Array(1)], name, { type, lastModified: 0 });
  Object.defineProperty(file, "size", { value: sizeInBytes });
  return file;
}

/**
 * This example shows the default state: the large, illustrated drop zone.
 */
export const Default: Story = {};

/**
 * This example shows all three sizes. `small` is a button-like trigger and shows its
 * validation message in a tooltip instead of below the icon.
 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "26rem" }}>
      <FileUpload {...args} size="large" label="Large" />
      <FileUpload {...args} size="medium" label="Medium" />
      <FileUpload {...args} size="small" label="Small" />
    </div>
  ),
};

/**
 * This example shows a single-file upload. `value` is a single `File` (or `null`)
 * instead of an array.
 */
export const SingleFile: Story = {
  args: { multiple: false, maxCount: undefined, accept: [".png", ".jpg"] },
};

/**
 * This example shows files that violate a constraint. They stay in the list, marked in
 * red, so the user can remove them.
 */
export const InvalidFiles: Story = {
  args: {
    defaultValue: [
      sized("quarterly-report.pdf", 2 * 1024 * 1024, "application/pdf"),
      sized("raw-scan.tiff", 4 * 1024 * 1024, "image/tiff"),
      sized("backup.zip", 64 * 1024 * 1024, "application/zip"),
    ],
    showError: true,
  },
};

/**
 * This example shows a required upload. The message appears once the user has
 * interacted with the control, and the underlying input reports it to the form.
 */
export const Required: Story = {
  args: { required: true, showError: true, defaultValue: [] },
};

/**
 * This example shows the four list types. `maxHeight` scrolls after
 * `--okryshto-file-upload-max-files` rows, `button` toggles the list and `hidden` leaves
 * the rendering to you.
 */
export const ListTypes: Story = {
  args: {
    listType: "maxHeight",
    defaultValue: [
      sized("contract.pdf", 240 * 1024, "application/pdf"),
      sized("photo-01.png", 1.4 * 1024 * 1024, "image/png"),
      sized("photo-02.png", 980 * 1024, "image/png"),
      sized("notes.txt", 12 * 1024, "text/plain"),
      sized("demo.mp4", 6 * 1024 * 1024, "video/mp4"),
    ],
    maxCount: 10,
  },
};

/**
 * This example shows a live upload: `getFileStatus` drives the status text and the
 * progress bar of each row.
 */
export const UploadProgress: Story = {
  render: (args) => {
    const [progress, setProgress] = useState(0);
    const [files] = useState<File[]>([
      sized("keynote.pdf", 3.2 * 1024 * 1024, "application/pdf"),
      sized("cover.png", 820 * 1024, "image/png"),
    ]);

    useEffect(() => {
      const timer = setInterval(
        () => setProgress((current) => (current >= 100 ? 0 : current + 5)),
        200,
      );
      return () => clearInterval(timer);
    }, []);

    return (
      <div style={{ width: "26rem" }}>
        <FileUpload
          {...args}
          label="Uploading"
          defaultValue={files}
          getFileStatus={() =>
            progress >= 100
              ? { text: "Uploaded", color: "success" }
              : { text: `Uploading… ${progress}%`, color: "primary", progress }
          }
        />
      </div>
    );
  },
};

/**
 * This example shows a custom file row via `renderFile`, with `listType="list"` still
 * handling the layout around it.
 */
export const CustomFileRow: Story = {
  args: {
    defaultValue: [
      sized("invoice.pdf", 320 * 1024, "application/pdf"),
      sized("logo.svg", 18 * 1024, "image/svg+xml"),
    ],
  },
  render: (args) => (
    <div style={{ width: "26rem" }}>
      <FileUpload
        {...args}
        renderFile={({ file, remove }) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              padding: "0.5rem 0.75rem",
              border: "0.0625rem dashed var(--okryshto-border-default)",
              borderRadius: "0.625rem",
              fontFamily: "var(--okryshto-font-family-mono)",
              fontSize: "var(--okryshto-font-size-sm)",
              color: "var(--okryshto-text-secondary)",
            }}
          >
            <span>{file.name}</span>
            <button
              type="button"
              onClick={remove}
              style={{ background: "none", border: 0, color: "inherit", cursor: "pointer" }}
            >
              remove
            </button>
          </div>
        )}
      />
    </div>
  ),
};

/**
 * This example shows controlled usage — the selection lives in the parent and is
 * rendered next to the control.
 */
export const Controlled: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "26rem" }}>
        <FileUpload label="Upload" multiple value={files} onChange={setFiles} maxSize="5MiB" />
        <span
          style={{ color: "var(--okryshto-text-muted)", fontSize: "var(--okryshto-font-size-sm)" }}
        >
          {files.length} file{files.length === 1 ? "" : "s"} selected
        </span>
      </div>
    );
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = { args: { disabled: true } };
