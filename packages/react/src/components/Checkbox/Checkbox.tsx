import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import "@okryshto/design-system/components/Checkbox/Checkbox.scss";
import { CheckboxGroupContext } from "../CheckboxGroup/CheckboxGroupContext";

export type CheckboxSize = "small" | "medium" | "large";
export type CheckboxColor =
  "primary" | "dante" | "indigo" | "violet" | "ember" | "ice" | "success" | "warning" | "danger";

/**
 * Props follow MUI's Checkbox API (https://mui.com/material-ui/api/checkbox/)
 * as closely as this design allows: `checked`/`indeterminate`/`size`/
 * `disabled`/`onChange` match name-for-name. Deliberate gap: no `sx`/
 * `classes`/`icon`/`checkedIcon` (no CSS-in-JS system, glyphs aren't
 * swappable in this design). `label` is built into this component (unlike
 * MUI, which pairs Checkbox with a separate FormControlLabel) — same
 * decision as TextField's built-in label.
 *
 * Nested inside a `CheckboxGroup`, it auto-wires `name`/`checked`/toggle via
 * context — `value` picks the option, the group's `value`/`onChange` own the
 * selection array.
 */
export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "type" | "onChange"
> {
  /**
   * On/off value.
   *
   * @default undefined
   * @type {boolean}
   */
  checked?: boolean;
  /**
   * This option's value — required when nested inside a CheckboxGroup.
   *
   * @default undefined
   * @type {string}
   */
  value?: string;
  /**
   * Groups checkboxes together. Auto-filled by a parent CheckboxGroup.
   *
   * @default undefined
   * @type {string}
   */
  name?: string;
  /**
   * Third, mixed state (parent).
   *
   * @default false
   * @type {boolean}
   */
  indeterminate?: boolean;
  /**
   * Box size.
   *
   * @default undefined
   * @type {CheckboxSize}
   */
  size?: CheckboxSize;
  /**
   * Fill colour (dante-ready).
   *
   * @default undefined
   * @type {CheckboxColor}
   */
  color?: CheckboxColor;
  /**
   * Non-interactive.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Text beside the box.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Fires on toggle.
   *
   * @default undefined
   * @type {(event: ChangeEvent<HTMLInputElement>, checked: boolean) => void}
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    value,
    name,
    indeterminate = false,
    size,
    color,
    disabled = false,
    label,
    className,
    id,
    onChange,
    ...rest
  },
  forwardedRef,
) {
  const group = useContext(CheckboxGroupContext);
  const localRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isGrouped = group !== null;
  const finalName = name ?? group?.name;
  const finalChecked = isGrouped ? value !== undefined && group.value.includes(value) : checked;
  const finalDisabled = disabled || (group?.disabled ?? false);
  const finalSize = size ?? group?.size ?? "medium";
  const finalColor = color ?? group?.color ?? "primary";

  useEffect(() => {
    if (localRef.current) localRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const setRef = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const classes = [
    "okryshto-component",
    "okryshto-checkbox",
    finalColor !== "primary" && `okryshto-checkbox--color-${finalColor}`,
    finalSize !== "medium" && `okryshto-checkbox--${finalSize}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label htmlFor={inputId} className={classes}>
      <span className="okryshto-checkbox__control">
        <input
          ref={setRef}
          id={inputId}
          type="checkbox"
          className="okryshto-checkbox__input"
          name={finalName}
          value={value}
          checked={finalChecked}
          disabled={finalDisabled}
          onChange={(event) => {
            if (isGrouped && value !== undefined) group.onToggle(value, event.target.checked);
            onChange?.(event, event.target.checked);
          }}
          {...rest}
        />
        <span className="okryshto-checkbox__box" aria-hidden="true">
          <svg
            className="okryshto-checkbox__check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <svg
            className="okryshto-checkbox__minus"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
          </svg>
        </span>
      </span>
      {label && <span className="okryshto-checkbox__label">{label}</span>}
    </label>
  );
});
