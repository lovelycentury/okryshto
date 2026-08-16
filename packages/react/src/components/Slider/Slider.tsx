import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import {
  useSlider,
  valueToPercent,
  type SliderMark,
  type SliderOrientation,
} from "@okryshto/react-hooks";
import "@okryshto/design-system/components/Slider/Slider.scss";

export type { SliderMark, SliderOrientation };
export type SliderSize = "small" | "medium" | "large";
export type SliderColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type SliderValueLabelDisplay = "auto" | "on" | "off";
export type SliderTrack = "normal" | "inverted" | "none";

function isRangeValue(value: number | number[] | undefined): value is number[] {
  return Array.isArray(value);
}

function resolveInitialValue(
  isRange: boolean,
  min: number,
  max: number,
  defaultValue?: number | number[],
): number | number[] {
  if (defaultValue !== undefined) return defaultValue;
  return isRange ? [min + (max - min) * 0.25, min + (max - min) * 0.75] : min;
}

function formatValueLabel(value: number): string {
  return String(value);
}

/**
 * Props follow MUI's Slider API (https://mui.com/material-ui/api/slider/) as closely
 * as this design allows: `value`/`defaultValue`/`min`/`max`/`step`/`marks`/
 * `orientation`/`disabled`/`size`/`valueLabelDisplay`/`shiftStep`/`getAriaLabel`/
 * `getAriaValueText`/`track`/`onChange`/`onChangeCommitted` match name-for-name.
 * Deliberate gaps: no `sx`/`classes`/`components`/`component`/`slots`/`slotProps`
 * (no CSS-in-JS system). `color` uses okryshto tone names. `discrete` snaps to marks
 * (MUI uses `step={null}` for the same behavior) and auto-generates step marks
 * when `marks` is omitted.
 */
export interface SliderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  /**
   * Value.
   *
   * @default undefined
   * @type {number | number[]}
   */
  value?: number | number[];
  /**
   * Default Value.
   *
   * @default undefined
   * @type {number | number[]}
   */
  defaultValue?: number | number[];
  /**
   * On Change.
   *
   * @default undefined
   * @type {(event: Event | SyntheticEvent, value: number | number[], activeThumb?: number) => void}
   */
  onChange?: (
    event: Event | SyntheticEvent,
    value: number | number[],
    activeThumb?: number,
  ) => void;
  /**
   * On Change Committed.
   *
   * @default undefined
   * @type {(event: Event | SyntheticEvent, value: number | number[]) => void}
   */
  onChangeCommitted?: (event: Event | SyntheticEvent, value: number | number[]) => void;
  /**
   * Min.
   *
   * @default 0
   * @type {number}
   */
  min?: number;
  /**
   * Max.
   *
   * @default 100
   * @type {number}
   */
  max?: number;
  /**
   * Step.
   *
   * @default 1
   * @type {number}
   */
  step?: number;
  /**
   * Marks.
   *
   * @default false
   * @type {boolean | SliderMark[]}
   */
  marks?: boolean | SliderMark[];
  /**
   * Orientation.
   *
   * @default "horizontal"
   * @type {SliderOrientation}
   */
  orientation?: SliderOrientation;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Color.
   *
   * @default "primary"
   * @type {SliderColor}
   */
  color?: SliderColor;
  /**
   * Size.
   *
   * @default "medium"
   * @type {SliderSize}
   */
  size?: SliderSize;
  /**
   * Value Label Display.
   *
   * @default "off"
   * @type {SliderValueLabelDisplay}
   */
  valueLabelDisplay?: SliderValueLabelDisplay;
  /**
   * Discrete.
   *
   * @default false
   * @type {boolean}
   */
  discrete?: boolean;
  /**
   * Shift Step.
   *
   * @default undefined
   * @type {number}
   */
  shiftStep?: number;
  /**
   * Get Aria Label.
   *
   * @default undefined
   * @type {(index: number) => string}
   */
  getAriaLabel?: (index: number) => string;
  /**
   * Get Aria Value Text.
   *
   * @default undefined
   * @type {(value: number, index: number) => string}
   */
  getAriaValueText?: (value: number, index: number) => string;
  /**
   * Track.
   *
   * @default "normal"
   * @type {SliderTrack}
   */
  track?: SliderTrack;
  /**
   * Value Label Format.
   *
   * @default formatValueLabel
   * @type {(value: number, index: number) => ReactNode}
   */
  valueLabelFormat?: (value: number, index: number) => ReactNode;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onChange,
    onChangeCommitted,
    min = 0,
    max = 100,
    step = 1,
    marks = false,
    orientation = "horizontal",
    disabled = false,
    color = "primary",
    size = "medium",
    valueLabelDisplay = "off",
    discrete = false,
    shiftStep,
    getAriaLabel,
    getAriaValueText,
    track = "normal",
    valueLabelFormat = formatValueLabel,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  forwardedRef,
) {
  const isRange = isRangeValue(value) || isRangeValue(defaultValue);
  const [internalValue, setInternalValue] = useState<number | number[]>(() =>
    resolveInitialValue(isRange, min, max, defaultValue),
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (next: number | number[]) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(new Event("change") as Event, next);
  };

  const handleCommit = (next: number | number[]) => {
    onChangeCommitted?.(new Event("change") as Event, next);
  };

  const slider = useSlider({
    value: currentValue ?? (isRange ? [min, max] : min),
    min,
    max,
    step,
    discrete,
    shiftStep,
    disabled,
    marks,
    orientation,
    label: ariaLabel,
    getAriaLabel,
    getAriaValueText,
    onChange: handleChange,
    onCommit: handleCommit,
  });

  const {
    values,
    isDragging,
    activeThumbIndex,
    focusedThumbIndex,
    marksList,
    isMarkActive,
    valueToPercent: toPercent,
    getRootProps,
    getRailProps,
    getTrackProps,
    getThumbContainerProps,
    getThumbInputProps,
    getMarkProps,
    getMarkLabelProps,
  } = slider;

  const rootProps = getRootProps();
  const trackProps = getTrackProps();

  const invertedTracks = useMemo(() => {
    if (track !== "inverted") return null;

    if (!slider.isRange) {
      const start = toPercent(values[0] ?? min);
      return [{ offset: start, length: 100 - start }];
    }

    const lo = Math.min(...values);
    const hi = Math.max(...values);
    return [
      { offset: 0, length: toPercent(lo) },
      { offset: toPercent(hi), length: 100 - toPercent(hi) },
    ];
  }, [max, min, slider.isRange, toPercent, track, values]);

  const showValueLabel = (index: number) => {
    if (valueLabelDisplay === "off") return false;
    if (valueLabelDisplay === "on") return true;
    return isDragging || activeThumbIndex === index || focusedThumbIndex === index;
  };

  const classes = [
    "okryshto-component",
    "okryshto-slider",
    size !== "medium" && `okryshto-slider--${size}`,
    color !== "primary" && `okryshto-slider--color-${color}`,
    orientation === "vertical" && "okryshto-slider--vertical",
    disabled && "okryshto-slider--disabled",
    track === "inverted" && "okryshto-slider--track-inverted",
    track === "none" && "okryshto-slider--track-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const axis = orientation === "vertical" ? "bottom" : "left";
  const axisSize = orientation === "vertical" ? "height" : "width";

  const setRootRef = (node: HTMLDivElement | null) => {
    rootProps.ref.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <div
      {...rest}
      {...rootProps}
      ref={setRootRef}
      className={classes}
      aria-disabled={disabled || undefined}
    >
      <div className="okryshto-slider__rail" {...getRailProps()} />

      {track === "normal" && <div className="okryshto-slider__track" {...trackProps} />}

      {invertedTracks?.map((segment, index) => (
        <div
          key={`inverted-${index}`}
          className="okryshto-slider__track-inverted"
          role="presentation"
          aria-hidden
          style={{
            [axis]: `${segment.offset}%`,
            [axisSize]: `${segment.length}%`,
          }}
        />
      ))}

      {marksList.length > 0 && (
        <div className="okryshto-slider__marks">
          {marksList.map((mark) => (
            <div key={mark.value}>
              <div
                className={[
                  "okryshto-slider__mark",
                  isMarkActive(mark.value) && "okryshto-slider__mark--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                {...getMarkProps(mark)}
              />
              {mark.label && (
                <span className="okryshto-slider__mark-label" {...getMarkLabelProps(mark)}>
                  {mark.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {values.map((thumbValue, index) => {
        const thumbContainerProps = getThumbContainerProps(index, thumbValue);
        const inputProps = getThumbInputProps(index, thumbValue);

        return (
          <div
            key={index}
            className={[
              "okryshto-slider__thumb",
              (activeThumbIndex === index || focusedThumbIndex === index) &&
                "okryshto-slider__thumb--active",
            ]
              .filter(Boolean)
              .join(" ")}
            {...thumbContainerProps}
          >
            {showValueLabel(index) && (
              <span className="okryshto-slider__value-label">
                {valueLabelFormat(thumbValue, index)}
              </span>
            )}
            <span className="okryshto-slider__handle" aria-hidden="true" />
            <input className="okryshto-slider__input" {...inputProps} />
          </div>
        );
      })}
    </div>
  );
});

export { valueToPercent };
