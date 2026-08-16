import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Photo } from "./Photo";

describe("Photo", () => {
  it("renders plain style by default without radius modifier", () => {
    const { container } = render(<Photo image="/test.jpg" alt="Test" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(
      "okryshto-component",
      "okryshto-photo",
      "okryshto-photo--plain",
      "okryshto-photo--size-md",
    );
    expect(root.className).not.toMatch(/okryshto-photo--radius-/);
  });

  it("applies radius modifier", () => {
    const { container } = render(<Photo alt="Test" radius="lg" />);
    expect(container.firstChild).toHaveClass("okryshto-photo--radius-lg");
  });

  it("applies size modifier", () => {
    const { container } = render(<Photo alt="Test" size="sm" />);
    expect(container.firstChild).toHaveClass("okryshto-photo--size-sm");
  });

  it("shows a silhouette placeholder when image is missing", () => {
    render(<Photo alt="Placeholder" />);
    expect(screen.getByRole("img", { name: "Placeholder" })).toHaveClass(
      "okryshto-photo__placeholder",
    );
  });

  it("shows placeholder after image load error", () => {
    render(<Photo image="/broken.jpg" alt="Broken" />);
    fireEvent.error(screen.getByAltText("Broken"));
    expect(screen.getByRole("img", { name: "Broken" })).toHaveClass("okryshto-photo__placeholder");
  });

  it("renders caption for scrim variant", () => {
    render(<Photo alt="Test" variant="scrim" caption="Oleksii K." />);
    expect(screen.getByText("Oleksii K.")).toHaveClass("okryshto-photo__caption");
  });

  // A caption is light text laid straight onto the photo, so it brings the scrim
  // with it rather than being silently dropped on the variants that lack one.
  it("brings its own scrim when a caption is set on the plain variant", () => {
    const { container } = render(<Photo alt="Test" variant="plain" caption="Oleksii K." />);
    expect(screen.getByText("Oleksii K.")).toHaveClass("okryshto-photo__caption");
    expect(container.firstChild).toHaveClass("okryshto-photo--scrim");
  });

  it("applies noir and scrim modifiers for noir variant", () => {
    const { container } = render(<Photo alt="Test" variant="noir" caption="Oleksii K." />);
    expect(container.firstChild).toHaveClass("okryshto-photo--noir", "okryshto-photo--scrim");
  });

  it("applies transparent modifier for cutout variant", () => {
    const { container } = render(<Photo alt="Test" variant="cutout" />);
    expect(container.firstChild).toHaveClass("okryshto-photo--transparent");
  });

  it("ignores scrim/noir overlays when transparent", () => {
    const { container } = render(<Photo alt="Test" variant="noir" transparent />);
    expect(container.firstChild).not.toHaveClass("okryshto-photo--scrim", "okryshto-photo--noir");
  });

  // The skeleton is opt-in, and the image used to be held invisible waiting for
  // an `onLoad` that the caller had never asked to wait for.
  it("shows the image immediately when loading is not requested", () => {
    render(<Photo image="/test.jpg" alt="Test" />);
    expect(screen.getByAltText("Test")).not.toHaveStyle({ opacity: "0" });
  });

  it("keeps the silhouette rather than a skeleton when loading with no image", () => {
    const { container } = render(<Photo alt="Placeholder" loading />);
    expect(screen.getByRole("img", { name: "Placeholder" })).toHaveClass(
      "okryshto-photo__placeholder",
    );
    expect(container.querySelector(".okryshto-photo__skeleton")).toBeNull();
  });
});
