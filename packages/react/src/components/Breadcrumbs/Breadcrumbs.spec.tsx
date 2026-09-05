import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";

const items = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Button" },
];

describe("Breadcrumbs", () => {
  it("renders every crumb", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  it("renders every non-last crumb with an href as a link", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components");
  });

  it("renders the last crumb as plain text with aria-current, ignoring href", () => {
    render(<Breadcrumbs items={[...items.slice(0, 2), { label: "Button", href: "/button" }]} />);
    expect(screen.queryByRole("link", { name: "Button" })).not.toBeInTheDocument();
    const current = screen.getByText("Button");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("renders a crumb without href as plain text even when not last", () => {
    render(
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "No link" }, { label: "Button" }]}
      />,
    );
    expect(screen.queryByRole("link", { name: "No link" })).not.toBeInTheDocument();
  });

  it("renders a chevron separator by default", () => {
    const { container } = render(<Breadcrumbs items={items} />);
    expect(container.querySelectorAll(".okkly-breadcrumbs__separator")).toHaveLength(
      items.length - 1,
    );
  });

  it("renders a custom separator", () => {
    render(<Breadcrumbs items={items} separator="/" />);
    expect(screen.getAllByText("/")).toHaveLength(items.length - 1);
  });

  it("renders a leading icon per crumb when provided", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/", icon: <span data-testid="home-icon" /> },
          { label: "Button" },
        ]}
      />,
    );
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
  });

  it("wraps everything in a nav with an accessible breadcrumb label", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
  });

  describe("collapsing", () => {
    const longPath = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Okryshto", href: "/projects/okkly" },
      { label: "Packages", href: "/projects/okkly/packages" },
      { label: "react", href: "/projects/okkly/packages/react" },
      { label: "Button" },
    ];

    it("collapses the middle crumbs behind an ellipsis once past maxItems", () => {
      render(<Breadcrumbs items={longPath} maxItems={4} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Button")).toBeInTheDocument();
      expect(screen.queryByText("Okryshto")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Show all crumbs" })).toBeInTheDocument();
    });

    it("expands to show every crumb when the ellipsis is activated", () => {
      render(<Breadcrumbs items={longPath} maxItems={4} />);
      fireEvent.click(screen.getByRole("button", { name: "Show all crumbs" }));
      expect(screen.getByText("Okryshto")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Show all crumbs" })).not.toBeInTheDocument();
    });

    it("does not collapse when items.length is within maxItems", () => {
      render(<Breadcrumbs items={items} maxItems={8} />);
      expect(screen.queryByRole("button", { name: "Show all crumbs" })).not.toBeInTheDocument();
    });

    it("respects itemsBeforeCollapse and itemsAfterCollapse", () => {
      render(
        <Breadcrumbs
          items={longPath}
          maxItems={4}
          itemsBeforeCollapse={2}
          itemsAfterCollapse={2}
        />,
      );
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Projects")).toBeInTheDocument();
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("Button")).toBeInTheDocument();
      expect(screen.queryByText("Okryshto")).not.toBeInTheDocument();
      expect(screen.queryByText("Packages")).not.toBeInTheDocument();
    });
  });
});
