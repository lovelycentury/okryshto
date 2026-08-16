import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Stepper, type StepperColor } from "./Stepper";

/**
 * Progress through an ordered flow. `activeStep` is a plain index: everything
 * before it renders as done, the step itself is current, the rest are pending.
 *
 * The component is presentational — advancing is your flow's job, as in the
 * checkout story below.
 */
const meta: Meta<typeof Stepper> = {
  title: "Navigation/Stepper",
  component: Stepper,
  args: {
    steps: [
      { label: "Cart" },
      { label: "Delivery" },
      { label: "Payment" },
      { label: "Confirmation" },
    ],
    activeStep: 1,
    orientation: "horizontal",
    alternativeLabel: true,
    color: "primary",
  },
  argTypes: {
    steps: { control: false },
    activeStep: { control: { type: "number", min: 0, max: 4 } },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render: (args) => (
    <div style={surface}>
      <Stepper {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const surface: CSSProperties = {
  background: "var(--okryshto-bg-surface-raised)",
  border: "1px solid var(--okryshto-border-subtle)",
  borderRadius: "12px",
  padding: "24px",
  width: "560px",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const checkoutSteps = [
  { label: "Cart", description: "3 items" },
  { label: "Delivery", description: "Address & courier" },
  { label: "Payment", description: "Card or invoice" },
  { label: "Confirmation" },
];

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A checkout wizard driving the stepper from real navigation buttons — the
 * usual way it appears in a product.
 */
export const CheckoutWizard: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const last = checkoutSteps.length - 1;
    return (
      <div style={{ ...surface, display: "grid", gap: "24px" }}>
        <Stepper steps={checkoutSteps} activeStep={step} />
        <div
          style={{
            fontSize: "var(--okryshto-font-size-sm)",
            color: "var(--okryshto-text-secondary)",
            textAlign: "center",
          }}
        >
          {step === last
            ? "All done — the order is on its way."
            : `Step ${step + 1} of ${last + 1}`}
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            Back
          </Button>
          <Button disabled={step === last} onClick={() => setStep((value) => value + 1)}>
            {step === last - 1 ? "Place order" : "Continue"}
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * Vertical layout fits a sidebar and gives each step room for a description.
 */
export const Vertical: Story = {
  render: () => (
    <div style={{ ...surface, width: "360px" }}>
      <Stepper
        orientation="vertical"
        activeStep={2}
        steps={[
          { label: "Repository connected", description: "github.com/lovelycentury/orbit" },
          { label: "Pipeline configured", description: "Build, test, and lint stages" },
          { label: "Environment variables", description: "3 of 5 secrets provided" },
          {
            label: "First deploy",
            description: "Runs once the steps above are green",
            optional: true,
          },
        ]}
      />
    </div>
  ),
};

/**
 * `alternativeLabel={false}` puts the label beside the dot instead of under it
 * — a compact header strip for narrow layouts.
 */
export const InlineLabels: Story = {
  render: () => (
    <div style={surface}>
      <Stepper
        alternativeLabel={false}
        activeStep={1}
        steps={[{ label: "Draft" }, { label: "In review" }, { label: "Published" }]}
      />
    </div>
  ),
};

/**
 * How the three step states read: everything before `activeStep` is checked
 * off, the active one is highlighted, the rest stay muted.
 */
export const States: Story = {
  render: () => (
    <div style={{ ...surface, display: "grid", gap: "28px" }}>
      {[0, 2, 4].map((activeStep) => (
        <Stepper key={activeStep} steps={checkoutSteps} activeStep={activeStep} />
      ))}
      <span
        style={{
          fontSize: "var(--okryshto-font-size-sm)",
          color: "var(--okryshto-text-secondary)",
          textAlign: "center",
        }}
      >
        start · mid-flow · finished (activeStep past the last index)
      </span>
    </div>
  ),
};

/**
 * Optional steps are marked in the label so users know they can skip them.
 */
export const OptionalSteps: Story = {
  render: () => (
    <div style={surface}>
      <Stepper
        activeStep={1}
        steps={[{ label: "Account" }, { label: "Company", optional: true }, { label: "Billing" }]}
      />
    </div>
  ),
};

/**
 * Every accent tone the dots and connectors support.
 */
export const Colors: Story = {
  render: () => {
    const colors: StepperColor[] = ["primary", "dante", "indigo", "violet", "ember", "ice"];
    return (
      <div style={{ ...surface, display: "grid", gap: "28px" }}>
        {colors.map((color) => (
          <Stepper
            key={color}
            color={color}
            activeStep={2}
            steps={[{ label: color }, { label: "Second" }, { label: "Third" }, { label: "Fourth" }]}
          />
        ))}
      </div>
    );
  },
};
