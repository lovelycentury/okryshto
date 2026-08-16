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
    const root = container.querySelector(".okryshto-card") as HTMLElement;
    expect(root).toHaveClass("okryshto-component", "okryshto-card");
    expect(root.className).not.toMatch(/okryshto-card--(raised|glass|outline|aura|padding-)/);
  });

  it("applies variant and padding modifiers", () => {
    const { container, rerender } = render(
      <Card raised padding="lg">
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(container.firstChild).toHaveClass("okryshto-card--raised", "okryshto-card--padding-lg");

    rerender(
      <Card variant="glass" padding="none">
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(container.firstChild).toHaveClass("okryshto-card--glass", "okryshto-card--padding-none");
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
    expect(screen.getByText("Title")).toHaveClass("okryshto-card__title");
    expect(screen.getByText("Sub")).toHaveClass("okryshto-card__subheader");
    expect(screen.getByRole("img", { name: "Cover" })).toHaveClass("okryshto-card__media");
    expect(screen.getByText("Content").closest(".okryshto-card__content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save" }).closest(".okryshto-card__actions"),
    ).toBeInTheDocument();
  });
});
