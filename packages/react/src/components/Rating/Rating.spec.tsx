import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Rating } from "./Rating";

describe("Rating", () => {
  it("renders the default classes (warning color, medium size)", () => {
    const { container } = render(<Rating value={4} readOnly />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okryshto-component", "okryshto-rating", "okryshto-rating--read-only");
    expect(root.className).not.toMatch(/okryshto-rating--color-/);
    expect(root.className).not.toMatch(/okryshto-rating--(small|large)/);
  });

  it("renders max star buttons when interactive", () => {
    render(<Rating value={2} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("renders half-filled stars for fractional values", () => {
    const { container } = render(<Rating value={2.5} readOnly />);
    expect(container.querySelectorAll(".okryshto-rating__icon--half")).toHaveLength(1);
    expect(container.querySelectorAll(".okryshto-rating__icon--full")).toHaveLength(2);
  });

  it("applies size modifier only for non-medium sizes", () => {
    const { rerender, container } = render(<Rating value={4} size="small" readOnly />);
    expect(container.firstChild).toHaveClass("okryshto-rating--small");

    rerender(<Rating value={4} size="medium" readOnly />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /okryshto-rating--(small|large)/,
    );
  });

  it("applies color modifier only for non-default colors", () => {
    const { rerender, container } = render(<Rating value={4} color="primary" readOnly />);
    expect(container.firstChild).toHaveClass("okryshto-rating--color-primary");

    rerender(<Rating value={4} color="warning" readOnly />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/okryshto-rating--color-/);
  });

  it("fires onChange when a star is clicked", () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "4 Stars" }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Object), 4);
  });

  it("clears the value when the active star is clicked again", () => {
    const onChange = vi.fn();
    render(<Rating value={3} precision={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "3 Stars" }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Object), null);
  });

  it("updates in uncontrolled mode", () => {
    render(<Rating defaultValue={2} precision={1} />);
    fireEvent.click(screen.getByRole("button", { name: "4 Stars" }));
    expect(
      screen.getByRole("button", { name: "4 Stars" }).querySelector(".okryshto-rating__icon--full"),
    ).toBeTruthy();
  });

  it("renders trailing label text", () => {
    render(<Rating value={4.5} label="4.8 · 128 reviews" readOnly />);
    expect(screen.getByText("4.8 · 128 reviews")).toHaveClass("okryshto-rating__label");
  });

  it("does not render buttons when readOnly", () => {
    render(<Rating value={4} readOnly />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("disables interaction when disabled", () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={3} disabled onChange={onChange} />);
    expect(container.firstChild).toHaveClass("okryshto-rating--disabled");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Rating ref={ref} value={4} readOnly />);
    expect(ref.current).toHaveClass("okryshto-rating");
  });
});
