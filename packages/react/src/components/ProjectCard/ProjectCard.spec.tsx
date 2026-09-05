import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "./ProjectCard";

describe("ProjectCard", () => {
  it("renders the title and description", () => {
    render(<ProjectCard title="Finance App" description="Buy, earn and grow crypto." />);
    expect(screen.getByRole("heading", { name: "Finance App" })).toBeInTheDocument();
    expect(screen.getByText("Buy, earn and grow crypto.")).toBeInTheDocument();
  });

  it("renders tags when provided", () => {
    render(<ProjectCard title="Finance App" tags={["Fintech", "Mobile"]} />);
    expect(screen.getByText("Fintech")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("omits the tags container when tags is empty", () => {
    const { container } = render(<ProjectCard title="Finance App" tags={[]} />);
    expect(container.querySelector(".okkly-project-card__tags")).not.toBeInTheDocument();
  });

  it("renders the device mockup only when device is true", () => {
    const { container, rerender } = render(<ProjectCard title="Finance App" device />);
    expect(container.querySelector(".okkly-project-card__device")).toBeInTheDocument();

    rerender(<ProjectCard title="Finance App" device={false} />);
    expect(container.querySelector(".okkly-project-card__device")).not.toBeInTheDocument();
  });

  it("renders the background image only when image is provided", () => {
    const { container, rerender } = render(<ProjectCard title="Finance App" image="/photo.jpg" />);
    expect(container.querySelector(".okkly-project-card__background")).toHaveAttribute(
      "src",
      "/photo.jpg",
    );

    rerender(<ProjectCard title="Finance App" />);
    expect(container.querySelector(".okkly-project-card__background")).not.toBeInTheDocument();
  });

  it("renders as an <a> when href is provided", () => {
    render(<ProjectCard title="Finance App" href="https://okryshto.dev/work/finance-app" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://okryshto.dev/work/finance-app",
    );
  });

  it("renders as a plain <div> (no link role) when href is omitted", () => {
    render(<ProjectCard title="Finance App" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the logo slot when provided", () => {
    render(<ProjectCard title="Finance App" logo={<span data-testid="logo-mark" />} />);
    expect(screen.getByTestId("logo-mark")).toBeInTheDocument();
  });
});
