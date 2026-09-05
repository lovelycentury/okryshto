import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Radio } from "../Radio/Radio";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup (nesting)", () => {
  it("checks exactly the option matching defaultValue", () => {
    render(
      <RadioGroup defaultValue="sms">
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Email" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "SMS" })).toBeChecked();
  });

  it("moves the checked state when a different nested Radio is clicked (uncontrolled)", () => {
    render(
      <RadioGroup defaultValue="email">
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "SMS" }));
    expect(screen.getByRole("radio", { name: "SMS" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Email" })).not.toBeChecked();
  });

  it("stays controlled by the value prop and calls onChange instead of flipping itself", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value="email" onChange={onChange}>
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "SMS" }));
    expect(onChange).toHaveBeenCalledWith("sms");
    // still "email" because the parent didn't feed the new value back in
    expect(screen.getByRole("radio", { name: "Email" })).toBeChecked();
  });

  it("gives every nested Radio the same name, so only one can be checked", () => {
    render(
      <RadioGroup defaultValue="email">
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );
    const email = screen.getByRole("radio", { name: "Email" }) as HTMLInputElement;
    const sms = screen.getByRole("radio", { name: "SMS" }) as HTMLInputElement;
    expect(email.name).toBe(sms.name);
    expect(email.name).not.toBe("");
  });

  it("propagates disabled to every nested Radio", () => {
    render(
      <RadioGroup defaultValue="email" disabled>
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Email" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "SMS" })).toBeDisabled();
  });

  it("lets a nested Radio override the group's size/color", () => {
    const { container } = render(
      <RadioGroup defaultValue="email" size="large" color="dante">
        <Radio value="email" label="Email" />
        <Radio value="sms" label="SMS" size="small" color="ice" />
      </RadioGroup>,
    );
    const radios = container.querySelectorAll(".okkly-radio");
    expect(radios[0]).toHaveClass("okkly-radio--large", "okkly-radio--color-dante");
    expect(radios[1]).toHaveClass("okkly-radio--small", "okkly-radio--color-ice");
  });

  it("exposes the radiogroup role with the group label as aria-label", () => {
    render(
      <RadioGroup defaultValue="email" label="Notification preference">
        <Radio value="email" label="Email" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Notification preference" })).toBeInTheDocument();
  });
});
