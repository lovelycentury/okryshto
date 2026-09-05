import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Photo } from "./Photo";

describe("Photo", () => {
  it("renders plain style by default without radius modifier", () => {
    const { container } = render(<Photo image="/test.jpg" alt="Test" />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(
      "okkly-component",
      "okkly-photo",
      "okkly-photo--plain",
      "okkly-photo--size-md",
    );
    expect(root.className).not.toMatch(/okkly-photo--radius-/);
  });

  it("applies radius modifier", () => {
    const { container } = render(<Photo alt="Test" radius="lg" />);
    expect(container.firstChild).toHaveClass("okkly-photo--radius-lg");
  });

  it("applies size modifier", () => {
    const { container } = render(<Photo alt="Test" size="sm" />);
    expect(container.firstChild).toHaveClass("okkly-photo--size-sm");
  });

  it("shows a silhouette placeholder when image is missing", () => {
    render(<Photo alt="Placeholder" />);
    expect(screen.getByRole("img", { name: "Placeholder" })).toHaveClass(
      "okkly-photo__placeholder",
    );
  });

  it("shows placeholder after image load error", () => {
    render(<Photo image="/broken.jpg" alt="Broken" />);
    fireEvent.error(screen.getByAltText("Broken"));
    expect(screen.getByRole("img", { name: "Broken" })).toHaveClass("okkly-photo__placeholder");
  });

  it("renders caption for scrim variant", () => {
    render(<Photo alt="Test" variant="scrim" caption="Oleksii K." />);
    expect(screen.getByText("Oleksii K.")).toHaveClass("okkly-photo__caption");
  });

  // A caption is light text laid straight onto the photo, so it brings the scrim
  // with it rather than being silently dropped on the variants that lack one.
  it("brings its own scrim when a caption is set on the plain variant", () => {
    const { container } = render(<Photo alt="Test" variant="plain" caption="Oleksii K." />);
    expect(screen.getByText("Oleksii K.")).toHaveClass("okkly-photo__caption");
    expect(container.firstChild).toHaveClass("okkly-photo--scrim");
  });

  it("applies noir and scrim modifiers for noir variant", () => {
    const { container } = render(<Photo alt="Test" variant="noir" caption="Oleksii K." />);
    expect(container.firstChild).toHaveClass("okkly-photo--noir", "okkly-photo--scrim");
  });

  it("applies transparent modifier for cutout variant", () => {
    const { container } = render(<Photo alt="Test" variant="cutout" />);
    expect(container.firstChild).toHaveClass("okkly-photo--transparent");
  });

  it("ignores scrim/noir overlays when transparent", () => {
    const { container } = render(<Photo alt="Test" variant="noir" transparent />);
    expect(container.firstChild).not.toHaveClass("okkly-photo--scrim", "okkly-photo--noir");
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
      "okkly-photo__placeholder",
    );
    expect(container.querySelector(".okkly-photo__skeleton")).toBeNull();
  });
});
