import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("renders a linear progressbar with value", () => {
    render(<Progress value={60} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveClass("okkly-progress--linear");
  });

  it("applies default classes without modifiers", () => {
    render(<Progress value={40} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveClass("okkly-component", "okkly-progress");
    expect(bar.className).not.toMatch(/okkly-progress--(indeterminate|small|large|dante)/);
  });

  it("omits aria-valuenow when indeterminate", () => {
    render(<Progress variant="indeterminate" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    expect(screen.getByRole("progressbar")).toHaveClass("okkly-progress--indeterminate");
  });

  it("applies size and color modifiers", () => {
    const { rerender } = render(<Progress value={50} size="small" color="success" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveClass("okkly-progress--small", "okkly-progress--success");

    rerender(<Progress value={50} size="medium" color="primary" />);
    expect(bar.className).not.toMatch(/okkly-progress--(small|success)/);
  });

  it("renders circular progress with label", () => {
    render(<Progress type="circular" value={70} showLabel />);
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveClass("okkly-progress--circular");
  });

  it("clamps value between 0 and 100", () => {
    const { rerender } = render(<Progress value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    rerender(<Progress value={-10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={30} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
