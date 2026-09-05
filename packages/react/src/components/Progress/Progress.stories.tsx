import { useEffect, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Progress, type ProgressColor } from "./Progress";

/**
 * Reports how far along a task is. Use `determinate` whenever you can compute a
 * percentage — a bar that fills is far more reassuring than one that loops — and
 * fall back to `indeterminate` only while the total is unknown.
 *
 * `type="linear"` fills its container, so it belongs at the top of the region it
 * describes; `type="circular"` keeps a fixed diameter and sits inline next to a
 * label. The element carries `role="progressbar"`, but no name of its own — pass
 * `aria-label` (or point `aria-labelledby` at your heading) so it announces what
 * it is measuring.
 */
const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  args: {
    value: 64,
    variant: "determinate",
    type: "linear",
    color: "primary",
    size: "medium",
    showLabel: false,
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    variant: { control: "inline-radio", options: ["determinate", "indeterminate"] },
    type: { control: "inline-radio", options: ["linear", "circular"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    color: {
      control: "select",
      options: [
        "primary",
        "dante",
        "indigo",
        "violet",
        "ember",
        "ice",
        "success",
        "warning",
        "danger",
      ],
    },
  },
  render: (args) => (
    <div style={surface}>
      <Progress {...args} aria-label="Upload progress" />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Progress>;

const surface: CSSProperties = {
  display: "grid",
  gap: "16px",
  width: "420px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

const caption: CSSProperties = {
  fontSize: "var(--okkly-font-size-sm)",
  color: "var(--okkly-text-secondary)",
};

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A file upload with a real percentage: the bar, the label, and the announced
 * value all come from the same number.
 */
export const FileUpload: Story = {
  name: "File upload",
  render: () => {
    const [value, setValue] = useState(0);
    const [running, setRunning] = useState(true);

    useEffect(() => {
      if (!running) return;
      const timer = setInterval(() => {
        setValue((current) => {
          if (current >= 100) {
            setRunning(false);
            return 100;
          }
          return current + 4;
        });
      }, 180);
      return () => clearInterval(timer);
    }, [running]);

    return (
      <div style={surface}>
        <div style={{ display: "flex", justifyContent: "space-between", ...caption }}>
          <span>night-drive-master.wav</span>
          <span>{value}%</span>
        </div>
        <Progress
          value={value}
          color={value === 100 ? "success" : "primary"}
          aria-label="Uploading night-drive-master.wav"
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="small"
            variant="soft"
            onClick={() => {
              setValue(0);
              setRunning(true);
            }}
          >
            Restart
          </Button>
          <Button size="small" variant="ghost" onClick={() => setRunning((state) => !state)}>
            {running ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * When the total is unknown, the bar loops instead of filling. It reports no
 * value to assistive tech — that is deliberate, since there is nothing truthful
 * to report.
 */
export const Indeterminate: Story = {
  render: () => (
    <div style={surface}>
      <span style={caption}>Searching the index…</span>
      <Progress variant="indeterminate" aria-label="Searching" />
      <span style={caption}>Circular, for a tighter spot</span>
      <Progress variant="indeterminate" type="circular" aria-label="Searching" />
    </div>
  ),
};

/**
 * The circular ring with `showLabel` — a compact way to show quota or storage in
 * a dashboard tile. The label is suppressed while indeterminate, since there is
 * no percentage to print.
 */
export const CircularWithLabel: Story = {
  name: "Circular with label",
  render: () => (
    <div
      style={{
        ...surface,
        gridAutoFlow: "column",
        justifyContent: "start",
        gap: "36px",
        width: "auto",
      }}
    >
      {[
        { value: 28, color: "primary" as ProgressColor, label: "Storage" },
        { value: 74, color: "warning" as ProgressColor, label: "Build minutes" },
        { value: 96, color: "danger" as ProgressColor, label: "Bandwidth" },
      ].map((item) => (
        <div key={item.label} style={{ display: "grid", justifyItems: "center", gap: "10px" }}>
          <Progress
            type="circular"
            value={item.value}
            color={item.color}
            showLabel
            aria-label={`${item.label} used`}
          />
          <span style={caption}>{item.label}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * `size` changes the bar height and the ring diameter together, so a linear and a
 * circular progress at the same size read as the same weight.
 */
export const Sizes: Story = {
  render: () => (
    <div style={surface}>
      {(["small", "medium", "large"] as const).map((size) => (
        <div key={size} style={{ display: "grid", gap: "8px" }}>
          <span style={caption}>{size}</span>
          <Progress value={62} size={size} aria-label={`Example, ${size}`} />
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {(["small", "medium", "large"] as const).map((size) => (
          <Progress
            key={size}
            type="circular"
            value={62}
            size={size}
            showLabel
            aria-label={`Example, ${size}`}
          />
        ))}
      </div>
    </div>
  ),
};

/**
 * Every tone. The feedback tones are the useful ones here — swap to `warning`
 * and `danger` as a quota fills, as in the dashboard story above.
 */
export const Colors: Story = {
  render: () => {
    const colors: ProgressColor[] = [
      "primary",
      "dante",
      "indigo",
      "violet",
      "ember",
      "ice",
      "success",
      "warning",
      "danger",
    ];
    return (
      <div style={surface}>
        {colors.map((color) => (
          <div key={color} style={{ display: "grid", gap: "6px" }}>
            <span style={caption}>{color}</span>
            <Progress value={70} color={color} aria-label={color} />
          </div>
        ))}
      </div>
    );
  },
};
