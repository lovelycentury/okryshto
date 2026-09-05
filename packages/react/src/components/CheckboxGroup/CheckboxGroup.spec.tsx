import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../Checkbox/Checkbox";
import { CheckboxGroup } from "./CheckboxGroup";

describe("CheckboxGroup (nesting)", () => {
  it("checks options matching defaultValue", () => {
    render(
      <CheckboxGroup defaultValue={["sms", "push"]}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="SMS" />
        <Checkbox value="push" label="Push" />
      </CheckboxGroup>,
    );
    expect(screen.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "SMS" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Push" })).toBeChecked();
  });

  it("toggles nested checkboxes independently (uncontrolled)", () => {
    render(
      <CheckboxGroup defaultValue={["email"]}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="SMS" />
      </CheckboxGroup>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "SMS" }));
    expect(screen.getByRole("checkbox", { name: "SMS" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeChecked();

    fireEvent.click(screen.getByRole("checkbox", { name: "Email" }));
    expect(screen.getByRole("checkbox", { name: "Email" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "SMS" })).toBeChecked();
  });

  it("stays controlled by the value prop and calls onChange instead of flipping itself", () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup value={["email"]} onChange={onChange}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="SMS" />
      </CheckboxGroup>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "SMS" }));
    expect(onChange).toHaveBeenCalledWith(["email", "sms"]);
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "SMS" })).not.toBeChecked();
  });

  it("gives every nested Checkbox the same name", () => {
    render(
      <CheckboxGroup defaultValue={["email"]}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="SMS" />
      </CheckboxGroup>,
    );
    const email = screen.getByRole("checkbox", { name: "Email" }) as HTMLInputElement;
    const sms = screen.getByRole("checkbox", { name: "SMS" }) as HTMLInputElement;
    expect(email.name).toBe(sms.name);
    expect(email.name).not.toBe("");
  });

  it("propagates disabled to every nested Checkbox", () => {
    render(
      <CheckboxGroup defaultValue={["email"]} disabled>
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="SMS" />
      </CheckboxGroup>,
    );
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "SMS" })).toBeDisabled();
  });

  it("lets a nested Checkbox override the group's size/color", () => {
    const { container } = render(
      <CheckboxGroup defaultValue={["email"]} size="large" color="dante">
        <Checkbox value="email" label="Email" />
        <Checkbox value="sms" label="SMS" size="small" color="ice" />
      </CheckboxGroup>,
    );
    const boxes = container.querySelectorAll(".okkly-checkbox");
    expect(boxes[0]).toHaveClass("okkly-checkbox--large", "okkly-checkbox--color-dante");
    expect(boxes[1]).toHaveClass("okkly-checkbox--small", "okkly-checkbox--color-ice");
  });

  it("exposes the group role with the group label as aria-label", () => {
    render(
      <CheckboxGroup defaultValue={["email"]} label="Notification channels">
        <Checkbox value="email" label="Email" />
      </CheckboxGroup>,
    );
    expect(screen.getByRole("group", { name: "Notification channels" })).toBeInTheDocument();
  });
});
