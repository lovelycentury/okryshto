import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Popper } from "./Popper";

describe("Popper", () => {
  it("renders children when open with an anchor", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);

    render(
      <Popper open anchorEl={anchor}>
        <div>Popper content</div>
      </Popper>,
    );

    expect(screen.getByText("Popper content")).toBeInTheDocument();
    expect(document.querySelector(".okryshto-popper")).toBeTruthy();
    document.body.removeChild(anchor);
  });

  it("does not render when closed", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);

    render(
      <Popper open={false} anchorEl={anchor}>
        <div>Hidden</div>
      </Popper>,
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    document.body.removeChild(anchor);
  });

  it("keeps children mounted when keepMounted and closed", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);

    render(
      <Popper open={false} keepMounted anchorEl={anchor}>
        <div>Kept</div>
      </Popper>,
    );

    const root = document.querySelector(".okryshto-popper") as HTMLElement;
    expect(screen.getByText("Kept")).toBeInTheDocument();
    expect(root.style.display).toBe("none");
    document.body.removeChild(anchor);
  });

  it("forwards ref to the root element", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    const ref = createRef<HTMLDivElement>();

    render(
      <Popper ref={ref} open anchorEl={anchor}>
        <div>Ref target</div>
      </Popper>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("okryshto-popper");
    document.body.removeChild(anchor);
  });

  it("passes TransitionProps when transition is enabled", () => {
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    const renderChild = vi.fn((_props: { TransitionProps?: { in: boolean } }) => (
      <div>Animated</div>
    ));

    render(
      <Popper open transition anchorEl={anchor}>
        {renderChild}
      </Popper>,
    );

    expect(renderChild).toHaveBeenCalled();
    expect(renderChild.mock.calls[0]?.[0]?.TransitionProps?.in).toBe(true);
    document.body.removeChild(anchor);
  });
});

describe("Popper stories helpers", () => {
  it("supports controlled open toggle without throwing", () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
      return (
        <>
          <button ref={setAnchor} type="button" onClick={() => setOpen((value) => !value)}>
            Toggle
          </button>
          <Popper open={open} anchorEl={anchor}>
            <div>Panel</div>
          </Popper>
        </>
      );
    }

    render(<Demo />);
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Panel")).toBeInTheDocument();
  });
});
