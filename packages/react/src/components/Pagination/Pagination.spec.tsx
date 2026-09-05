import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, getPaginationItems } from "./Pagination";

describe("getPaginationItems", () => {
  it("returns the full range when count is small", () => {
    expect(getPaginationItems(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("inserts ellipses for large page counts", () => {
    expect(getPaginationItems(8, 20, 1, 1)).toEqual([1, "ellipsis", 7, 8, 9, "ellipsis", 20]);
  });
});

describe("Pagination", () => {
  it("renders prev/next and page buttons inside a navigation landmark", () => {
    render(<Pagination count={10} page={2} />);
    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 2" })).toHaveClass(
      "okkly-pagination__button--active",
    );
  });

  it("renders with zero modifier classes by default", () => {
    const { container } = render(<Pagination count={5} page={1} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("okkly-component", "okkly-pagination");
    expect(root.className).not.toMatch(/okkly-pagination--color-/);
    expect(root.className).not.toMatch(/okkly-pagination--size-/);
    expect(root.className).not.toMatch(/okkly-pagination--shape-circular/);
    expect(root.className).not.toMatch(/okkly-pagination--disabled/);
  });

  it("applies size, shape, color, and disabled modifiers", () => {
    const { rerender, container } = render(<Pagination count={5} page={1} size="large" />);
    expect(container.firstChild).toHaveClass("okkly-pagination--size-large");

    rerender(<Pagination count={5} page={1} shape="circular" />);
    expect(container.firstChild).toHaveClass("okkly-pagination--shape-circular");

    rerender(<Pagination count={5} page={1} color="dante" />);
    expect(container.firstChild).toHaveClass("okkly-pagination--color-dante");

    rerender(<Pagination count={5} page={1} disabled />);
    expect(container.firstChild).toHaveClass("okkly-pagination--disabled");
  });

  it("fires onChange when a page is selected", () => {
    const onChange = vi.fn();
    render(<Pagination count={10} page={2} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to page 3" }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Object), 3);
  });

  it("disables previous on the first page and next on the last page", () => {
    const { rerender } = render(<Pagination count={5} page={1} />);
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Go to next page" })).not.toBeDisabled();

    rerender(<Pagination count={5} page={5} />);
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled();
  });

  it("renders first/last buttons when requested", () => {
    render(<Pagination count={10} page={5} showFirstButton showLastButton />);
    expect(screen.getByRole("button", { name: "Go to first page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to last page" })).toBeInTheDocument();
  });

  it("shows ellipsis for collapsed ranges", () => {
    const { container } = render(
      <Pagination count={20} page={10} siblingCount={1} boundaryCount={1} />,
    );
    expect(container.querySelectorAll(".okkly-pagination__ellipsis")).toHaveLength(2);
  });
});
