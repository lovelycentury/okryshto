import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion, AccordionDetails, AccordionSummary } from "./Accordion";

describe("Accordion", () => {
  it("renders summary and hides details by default", () => {
    render(
      <Accordion>
        <AccordionSummary>Section title</AccordionSummary>
        <AccordionDetails>Hidden content</AccordionDetails>
      </Accordion>,
    );
    expect(screen.getByRole("button", { name: "Section title" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders with zero modifier classes by default", () => {
    const { container } = render(
      <Accordion>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okryshto-component", "okryshto-accordion");
    expect(root.className).not.toMatch(/okryshto-accordion--expanded/);
    expect(root.className).not.toMatch(/okryshto-accordion--disabled/);
  });

  it("shows details when defaultExpanded is true", () => {
    render(
      <Accordion defaultExpanded>
        <AccordionSummary>Section title</AccordionSummary>
        <AccordionDetails>Visible content</AccordionDetails>
      </Accordion>,
    );
    expect(screen.getByText("Visible content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Section title" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  it("toggles expanded state in uncontrolled mode", async () => {
    render(
      <Accordion>
        <AccordionSummary>Section title</AccordionSummary>
        <AccordionDetails>Toggle me</AccordionDetails>
      </Accordion>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Section title" }));
    expect(screen.getByText("Toggle me")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Section title" }));
    // The panel collapses through a transition, so it leaves the DOM once the
    // exit finishes rather than on the click itself.
    await waitForElementToBeRemoved(() => screen.queryByText("Toggle me"));
  });

  it("fires onChange in controlled mode", () => {
    const onChange = vi.fn();
    render(
      <Accordion expanded={false} onChange={onChange}>
        <AccordionSummary>Section title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Section title" }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Object), true);
  });

  it("applies expanded and disabled modifiers", () => {
    const { rerender, container } = render(
      <Accordion defaultExpanded>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    expect(container.firstChild).toHaveClass("okryshto-accordion--expanded");
    expect(container.querySelector(".okryshto-accordion__chevron--expanded")).toBeInTheDocument();

    rerender(
      <Accordion disabled>
        <AccordionSummary>Title</AccordionSummary>
        <AccordionDetails>Body</AccordionDetails>
      </Accordion>,
    );
    expect(container.firstChild).toHaveClass("okryshto-accordion--disabled");
    expect(screen.getByRole("button", { name: "Title" })).toBeDisabled();
  });

  it("throws when summary or details are used outside Accordion", () => {
    expect(() => render(<AccordionSummary>Orphan</AccordionSummary>)).toThrow(
      /AccordionSummary must be used within Accordion/,
    );
  });
});
