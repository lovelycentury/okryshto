import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders initials when there's no image", () => {
    render(<Avatar initials="OK" />);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("truncates initials to two characters", () => {
    render(<Avatar initials="Oleksii" />);
    expect(screen.getByText("Ol")).toBeInTheDocument();
  });

  it("applies the default classes (md size, circle shape, mint color)", () => {
    render(<Avatar initials="OK" />);
    const avatar = screen.getByText("OK").closest(".okryshto-avatar");
    expect(avatar).toHaveClass("okryshto-component", "okryshto-avatar");
    expect(avatar?.className).not.toMatch(/okryshto-avatar--(sm|lg)/);
    expect(avatar?.className).not.toMatch(/okryshto-avatar--rounded/);
    expect(avatar?.className).not.toMatch(/okryshto-avatar--color-(dante|indigo)/);
  });

  it("applies a size modifier only for non-md sizes", () => {
    const { rerender } = render(<Avatar initials="OK" size="sm" />);
    expect(screen.getByText("OK").closest(".okryshto-avatar")).toHaveClass("okryshto-avatar--sm");

    rerender(<Avatar initials="OK" size="md" />);
    expect(screen.getByText("OK").closest(".okryshto-avatar")?.className).not.toMatch(
      /okryshto-avatar--(sm|lg)/,
    );
  });

  it("applies the rounded shape modifier", () => {
    render(<Avatar initials="OK" shape="rounded" />);
    expect(screen.getByText("OK").closest(".okryshto-avatar")).toHaveClass(
      "okryshto-avatar--rounded",
    );
  });

  it("applies a color modifier only for non-mint colors", () => {
    const { rerender } = render(<Avatar initials="AB" color="dante" />);
    expect(screen.getByText("AB").closest(".okryshto-avatar")).toHaveClass(
      "okryshto-avatar--color-dante",
    );

    rerender(<Avatar initials="AB" color="mint" />);
    expect(screen.getByText("AB").closest(".okryshto-avatar")?.className).not.toMatch(
      /okryshto-avatar--color-(dante|indigo)/,
    );
  });

  it("renders an image when src is set, and hides the initials", () => {
    render(<Avatar src="https://example.com/avatar.jpg" initials="OK" alt="Oleksii" />);
    expect(
      screen.getByRole("img", { name: "Oleksii" }).querySelector(".okryshto-avatar__image"),
    ).toBeInTheDocument();
    expect(screen.queryByText("OK")).not.toBeInTheDocument();
  });

  it("falls back to initials when the image fails to load", () => {
    render(<Avatar src="https://example.com/broken.jpg" initials="OK" alt="Oleksii" />);
    const img = document.querySelector(".okryshto-avatar__image") as HTMLImageElement;
    fireEvent.error(img);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("exposes role=img and aria-label only when alt is set", () => {
    const { rerender } = render(<Avatar initials="OK" alt="Oleksii" />);
    expect(screen.getByRole("img", { name: "Oleksii" })).toBeInTheDocument();

    rerender(<Avatar initials="OK" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders no status dot by default", () => {
    const { container } = render(<Avatar initials="OK" />);
    expect(container.querySelector(".okryshto-avatar__status")).not.toBeInTheDocument();
  });

  it("renders an online status dot without a modifier class", () => {
    const { container } = render(<Avatar initials="OK" status="online" />);
    const dot = container.querySelector(".okryshto-avatar__status");
    expect(dot).toBeInTheDocument();
    expect(dot).not.toHaveClass("okryshto-avatar__status--offline");
  });

  it("renders an offline status dot with its modifier class", () => {
    const { container } = render(<Avatar initials="OK" status="offline" />);
    expect(container.querySelector(".okryshto-avatar__status--offline")).toBeInTheDocument();
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Avatar initials="OK" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
