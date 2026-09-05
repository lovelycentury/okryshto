import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "../Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup";

describe("AvatarGroup", () => {
  it("renders every child when the count is under max", () => {
    render(
      <AvatarGroup>
        <Avatar initials="OK" />
        <Avatar initials="AB" />
        <Avatar initials="MK" />
      </AvatarGroup>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("AB")).toBeInTheDocument();
    expect(screen.getByText("MK")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("applies the default classes (sm size, default spacing, ring on)", () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar initials="OK" />
      </AvatarGroup>,
    );
    const group = container.querySelector(".okkly-avatar-group");
    expect(group).toHaveClass("okkly-component", "okkly-avatar-group");
    expect(group?.className).not.toMatch(/okkly-avatar-group--(md|lg|dense|loose|no-ring)/);
  });

  it("collapses extra members into a +N chip", () => {
    render(
      <AvatarGroup max={3}>
        <Avatar initials="OK" />
        <Avatar initials="AB" />
        <Avatar initials="MK" />
        <Avatar initials="LN" />
        <Avatar initials="TS" />
      </AvatarGroup>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("AB")).toBeInTheDocument();
    expect(screen.queryByText("MK")).not.toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("uses total to show a +N chip even when children fit under max", () => {
    render(
      <AvatarGroup total={12}>
        <Avatar initials="OK" />
        <Avatar initials="AB" />
        <Avatar initials="MK" />
      </AvatarGroup>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("AB")).toBeInTheDocument();
    expect(screen.getByText("MK")).toBeInTheDocument();
    expect(screen.getByText("+9")).toBeInTheDocument();
  });

  it("overrides every member's size", () => {
    render(
      <AvatarGroup size="lg">
        <Avatar initials="OK" size="sm" />
        <Avatar initials="AB" />
      </AvatarGroup>,
    );
    expect(screen.getByText("OK").closest(".okkly-avatar")).toHaveClass("okkly-avatar--lg");
    expect(screen.getByText("AB").closest(".okkly-avatar")).toHaveClass("okkly-avatar--lg");
  });

  it("cycles hues across members", () => {
    render(
      <AvatarGroup hues={["mint", "dante", "indigo"]}>
        <Avatar initials="OK" />
        <Avatar initials="AB" />
        <Avatar initials="MK" />
        <Avatar initials="LN" />
      </AvatarGroup>,
    );
    expect(screen.getByText("OK").closest(".okkly-avatar")?.className).not.toMatch(
      /okkly-avatar--color/,
    );
    expect(screen.getByText("AB").closest(".okkly-avatar")).toHaveClass(
      "okkly-avatar--color-dante",
    );
    expect(screen.getByText("MK").closest(".okkly-avatar")).toHaveClass(
      "okkly-avatar--color-indigo",
    );
    expect(screen.getByText("LN").closest(".okkly-avatar")?.className).not.toMatch(
      /okkly-avatar--color/,
    );
  });

  it("applies the size, spacing and no-ring modifiers", () => {
    const { container, rerender } = render(
      <AvatarGroup size="md" spacing="loose" ring={false}>
        <Avatar initials="OK" />
      </AvatarGroup>,
    );
    const group = container.querySelector(".okkly-avatar-group");
    expect(group).toHaveClass(
      "okkly-avatar-group--md",
      "okkly-avatar-group--loose",
      "okkly-avatar-group--no-ring",
    );

    rerender(
      <AvatarGroup size="sm" spacing="default" ring>
        <Avatar initials="OK" />
      </AvatarGroup>,
    );
    expect(container.querySelector(".okkly-avatar-group")?.className).not.toMatch(
      /okkly-avatar-group--(md|lg|dense|loose|no-ring)/,
    );
  });
});
