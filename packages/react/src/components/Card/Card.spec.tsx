import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardActions, CardContent, CardHeader, CardMedia } from "./Card";

describe("Card", () => {
  it("renders without modifier classes by default", () => {
    const { container } = render(
      <Card>
        <CardContent>Body</CardContent>
      </Card>,
    );
    const root = container.querySelector(".okkly-card") as HTMLElement;
    expect(root).toHaveClass("okkly-component", "okkly-card");
    expect(root.className).not.toMatch(/okkly-card--(raised|glass|outline|aura|padding-)/);
  });

  it("applies variant and padding modifiers", () => {
    const { container, rerender } = render(
      <Card raised padding="lg">
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(container.firstChild).toHaveClass("okkly-card--raised", "okkly-card--padding-lg");

    rerender(
      <Card variant="glass" padding="none">
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(container.firstChild).toHaveClass("okkly-card--glass", "okkly-card--padding-none");
  });

  it("renders compound subcomponents", () => {
    render(
      <Card>
        <CardHeader title="Title" subheader="Sub" action={<button type="button">Go</button>} />
        <CardMedia src="/photo.jpg" alt="Cover" />
        <CardContent>Content</CardContent>
        <CardActions>
          <button type="button">Save</button>
        </CardActions>
      </Card>,
    );
    expect(screen.getByText("Title")).toHaveClass("okkly-card__title");
    expect(screen.getByText("Sub")).toHaveClass("okkly-card__subheader");
    expect(screen.getByRole("img", { name: "Cover" })).toHaveClass("okkly-card__media");
    expect(screen.getByText("Content").closest(".okkly-card__content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save" }).closest(".okkly-card__actions"),
    ).toBeInTheDocument();
  });
});
