import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "./Stepper";

const steps = [
  { label: "Account", description: "Sign in" },
  { label: "Shipping", description: "Address" },
  { label: "Payment" },
];

describe("Stepper", () => {
  it("renders every step label", () => {
    render(<Stepper steps={steps} activeStep={1} />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
  });

  it("renders with zero modifier classes by default", () => {
    const { container } = render(<Stepper steps={steps} activeStep={0} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(
      "okryshto-component",
      "okryshto-stepper",
      "okryshto-stepper--horizontal",
      "okryshto-stepper--alternative-label",
    );
    expect(root.className).not.toMatch(/okryshto-stepper--color-/);
    expect(root.className).not.toMatch(/okryshto-stepper--vertical/);
  });

  it("marks completed, active, and pending steps", () => {
    const { container } = render(<Stepper steps={steps} activeStep={1} />);
    const stepNodes = container.querySelectorAll(".okryshto-stepper__step");
    expect(stepNodes[0]).toHaveClass("okryshto-stepper__step--done");
    expect(stepNodes[1]).toHaveClass("okryshto-stepper__step--active");
    expect(stepNodes[2].className).not.toMatch(/okryshto-stepper__step--done/);
    expect(stepNodes[2].className).not.toMatch(/okryshto-stepper__step--active/);
    expect(stepNodes[1]).toHaveAttribute("aria-current", "step");
  });

  it("applies orientation, alternativeLabel, and color modifiers", () => {
    const { rerender, container } = render(
      <Stepper steps={steps} activeStep={0} orientation="vertical" />,
    );
    expect(container.firstChild).toHaveClass("okryshto-stepper--vertical");
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /okryshto-stepper--alternative-label/,
    );

    rerender(<Stepper steps={steps} activeStep={0} alternativeLabel={false} />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /okryshto-stepper--alternative-label/,
    );

    rerender(<Stepper steps={steps} activeStep={0} color="dante" />);
    expect(container.firstChild).toHaveClass("okryshto-stepper--color-dante");
  });

  it("renders a check icon for completed steps and numbers for others", () => {
    const { container } = render(<Stepper steps={steps} activeStep={2} />);
    expect(container.querySelectorAll(".okryshto-stepper__dot--done")).toHaveLength(2);
    expect(container.querySelector(".okryshto-stepper__dot--active")).toHaveTextContent("3");
  });

  it("shows optional marker text", () => {
    render(<Stepper steps={[{ label: "Review", optional: true }]} activeStep={0} />);
    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("renders connectors between steps except after the last one", () => {
    const { container } = render(<Stepper steps={steps} activeStep={1} />);
    expect(container.querySelectorAll(".okryshto-stepper__connector")).toHaveLength(
      steps.length - 1,
    );
  });
});
