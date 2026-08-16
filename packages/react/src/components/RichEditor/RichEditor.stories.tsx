import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RichEditor, type RichEditorValue } from "./RichEditor";

const SAMPLE_HTML = `
<h2>Design review</h2>
<p>Ship the <strong>primitives</strong> first — templates follow. Use <em>italic</em>, <u>underline</u>, and <code>inline code</code> freely.</p>
<ul>
  <li>Toolbar, blocks, slash menu</li>
  <li>Word count + autosave status</li>
</ul>
<blockquote><p>Primitives first, templates second.</p></blockquote>
`.trim();

/**
 * TipTap-based rich text with toolbar, slash menu, and word count. Prefer TextArea for plain notes.
 */
const meta: Meta<typeof RichEditor> = {
  title: "Control/RichEditor",
  component: RichEditor,
  args: {
    label: "Description",
    placeholder: "Write something…",
    helperText: "Rich text · saved as HTML",
    toolbar: "full",
    color: "primary",
    error: false,
    disabled: false,
    readonly: false,
    fullWidth: true,
    autosave: 5000,
    slashMenu: true,
  },
  argTypes: {
    toolbar: { control: "inline-radio", options: ["full", "compact", "none"] },
    color: { control: "inline-radio", options: ["primary", "dante"] },
    format: { control: "inline-radio", options: ["html", "json"] },
  },
  render: (args) => <RichEditor {...args} />,
};

export default meta;
type Story = StoryObj<typeof RichEditor>;

/**
 * This example shows the default state.
 */
export const Default: Story = {};

/**
 * This example shows filled.
 */
export const Filled: Story = {
  args: {
    defaultValue: SAMPLE_HTML,
  },
};

/**
 * This example shows the error state.
 */
export const Error: Story = {
  args: {
    defaultValue: SAMPLE_HTML,
    error: true,
    helperText: "Content exceeds 5 000 characters",
  },
};

/**
 * This example shows the disabled state.
 */
export const Disabled: Story = {
  args: {
    defaultValue: SAMPLE_HTML,
    disabled: true,
  },
};

/**
 * This example shows readonly.
 */
export const Readonly: Story = {
  args: {
    defaultValue: SAMPLE_HTML,
    readonly: true,
    helperText: "Read-only document",
  },
};

/**
 * This example shows compact toolbar.
 */
export const CompactToolbar: Story = {
  args: {
    toolbar: "compact",
    defaultValue: "<p>Compact toolbar — marks and lists only.</p>",
  },
};

/**
 * This example shows controlled usage.
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<RichEditorValue>(SAMPLE_HTML);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <RichEditor
          label="Controlled"
          value={value}
          onChange={setValue}
          helperText="Parent owns the HTML string"
        />
        <button type="button" onClick={() => setValue("<p>Reset from parent.</p>")}>
          Reset
        </button>
      </div>
    );
  },
};
