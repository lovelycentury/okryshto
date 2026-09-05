"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  type TouchEvent,
} from "react";
import {
  adjustValueByIndex,
  areArraysEqual,
  clamp,
  findClosestIndex,
  isFocusVisible,
  isTouchEvent,
  normalizeValues,
  percentToValue,
  roundToStep,
  valueToArray,
  valueToPercent,
} from "./Slider.utils";

export type SliderMark = { value: number; label?: string } | number;
export type SliderOrientation = "horizontal" | "vertical";

export interface UseSliderOptions {
  value: number | number[];
  min?: number;
  max?: number;
  step?: number;
  discrete?: boolean;
  shiftStep?: number;
  disabled?: boolean;
  marks?: SliderMark[] | boolean | false;
  orientation?: SliderOrientation;
  label?: string;
  getAriaLabel?: (index: number) => string;
  getAriaValueText?: (value: number, index: number) => string;
  onChange?: (value: number | number[]) => void;
  onCommit?: (value: number | number[]) => void;
}

export interface UseSliderReturn {
  sliderRef: RefObject<HTMLDivElement | null>;
  values: number[];
  isRange: boolean;
  isDragging: boolean;
  activeThumbIndex: number;
  focusedThumbIndex: number;
  marksList: { value: number; label?: string }[];
  trackOffset: number;
  trackLength: number;
  axis: { position: "left" | "bottom"; size: "width" | "height"; cross: "height" | "width" };
  valueToPercent: (value: number) => number;
  isMarkActive: (markValue: number) => boolean;
  getRootProps: () => {
    ref: RefObject<HTMLDivElement | null>;
    style: { touchAction: "pan-x" | "pan-y" };
    onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
    onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  };
  getRailProps: () => {
    role: "presentation";
    "aria-hidden": true;
  };
  getTrackProps: () => {
    role: "presentation";
    "aria-hidden": true;
    style: Record<string, string>;
  };
  getThumbContainerProps: (
    index: number,
    thumbValue: number,
  ) => {
    "data-index": number;
    style: Record<string, string>;
  };
  getThumbInputProps: (
    index: number,
    thumbValue: number,
  ) => {
    min: number;
    max: number;
    value: number;
    role: "slider";
    type: "range";
    "aria-label"?: string;
    "aria-valuemin": number;
    "aria-valuemax": number;
    "aria-valuenow": number;
    "aria-valuetext"?: string;
    "aria-orientation": SliderOrientation;
    "data-index": number;
    tabIndex: number;
    step: number | "any";
    disabled: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: (event: FocusEvent<HTMLInputElement>) => void;
    onBlur: (event: FocusEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  };
  getMarkProps: (mark: { value: number; label?: string }) => {
    "data-value": number;
    "aria-hidden": true;
    style: Record<string, string>;
  };
  getMarkLabelProps: (mark: { value: number }) => {
    "data-value": number;
    "aria-hidden": true;
    style: Record<string, string>;
  };
}

const DRAG_MOVE_THRESHOLD = 2;

const KEY = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Left: "ArrowLeft",
  Right: "ArrowRight",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Home: "Home",
  End: "End",
} as const;

const NAVIGATION_KEYS = new Set<string>([
  KEY.Up,
  KEY.Down,
  KEY.Left,
  KEY.Right,
  KEY.PageUp,
  KEY.PageDown,
  KEY.Home,
  KEY.End,
]);

const INCREMENT_KEYS = new Set<string>([KEY.Right, KEY.Up, KEY.PageUp]);
const DECREMENT_KEYS = new Set<string>([KEY.Left, KEY.Down, KEY.PageDown]);

const TRACK_CALCULATION_STRATEGIES = {
  horizontal: (rect: DOMRect, coords: { x: number; y: number }) =>
    clamp((coords.x - rect.left) / rect.width, 0, 1),
  vertical: (rect: DOMRect, coords: { x: number; y: number }) =>
    clamp((rect.bottom - coords.y) / rect.height, 0, 1),
};

const readThumbIndex = (event: Event | { currentTarget: EventTarget | null }) =>
  Number((event.currentTarget as HTMLElement | null)?.dataset.index ?? -1);

/**
 * Headless slider behavior ported from the okkly Vue reference (ARIA slider pattern).
 */
export function useSlider(options: UseSliderOptions): UseSliderReturn {
  const {
    value: rawValue,
    min: minOption = 0,
    max: maxOption = 100,
    step: stepOption = 1,
    discrete = false,
    shiftStep: shiftStepOption,
    disabled = false,
    marks: marksOption = false,
    orientation = "horizontal",
    label,
    getAriaLabel,
    getAriaValueText,
    onChange,
    onCommit,
  } = options;

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const touchIdRef = useRef<number | null>(null);
  const movesSinceStartRef = useRef(0);
  const lastChangedValueRef = useRef<number[] | null>(null);
  const previousActiveIndexRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [activeThumbIndex, setActiveThumbIndex] = useState(-1);
  const [focusedThumbIndex, setFocusedThumbIndex] = useState(-1);

  const isRange = Array.isArray(rawValue) && rawValue.length > 1;

  const values = useMemo(() => {
    if (Array.isArray(rawValue)) {
      if (!rawValue.length) return [minOption];
      return normalizeValues(rawValue, minOption, maxOption, stepOption);
    }

    if (typeof rawValue !== "number") return [minOption];
    return normalizeValues([rawValue], minOption, maxOption, stepOption);
  }, [rawValue, minOption, maxOption, stepOption]);

  const shiftStep = useMemo(() => {
    if (typeof shiftStepOption !== "undefined") return shiftStepOption;
    const stepMultiple = Math.max(1, Math.round(((maxOption - minOption) * 0.1) / stepOption));
    return stepMultiple * stepOption;
  }, [shiftStepOption, maxOption, minOption, stepOption]);

  const marksList = useMemo(() => {
    // Discrete snaps to marks (MUI `step={null}`). When marks aren't provided,
    // generate them from step so `<Slider discrete step={10} />` works alone.
    if (marksOption === false && !discrete) return [];

    if (Array.isArray(marksOption)) {
      return marksOption
        .map((mark) => (typeof mark === "number" ? { value: mark } : mark))
        .filter((mark) => mark.value >= minOption && mark.value <= maxOption)
        .sort((a, b) => a.value - b.value);
    }

    if (stepOption > 0) {
      return [...Array(Math.floor((maxOption - minOption) / stepOption + 1))].map((_, index) => ({
        value: minOption + stepOption * index,
      }));
    }

    return [];
  }, [discrete, marksOption, minOption, maxOption, stepOption]);

  const marksValues = useMemo(() => marksList.map((mark) => mark.value), [marksList]);

  const axis = useMemo(
    () =>
      orientation === "vertical"
        ? ({ position: "bottom", size: "height", cross: "width" } as const)
        : ({ position: "left", size: "width", cross: "height" } as const),
    [orientation],
  );

  const trackOffset = useMemo(
    () =>
      valueToPercent(
        isRange && values[0] !== undefined ? values[0] : minOption,
        minOption,
        maxOption,
      ),
    [isRange, values, minOption, maxOption],
  );

  const trackLength = useMemo(
    () => valueToPercent(values.at(-1) ?? minOption, minOption, maxOption) - trackOffset,
    [values, minOption, maxOption, trackOffset],
  );

  const emitChange = useCallback(
    (next: number[]) => {
      if (!areArraysEqual(values, next)) {
        const nextValue = isRange ? next : next[0];
        if (typeof nextValue !== "undefined") onChange?.(nextValue as number | number[]);
      }
      lastChangedValueRef.current = next;
    },
    [isRange, onChange, values],
  );

  const emitCommit = useCallback(
    (fallback: number[]) => {
      const valueWithFallback = lastChangedValueRef.current ?? fallback;
      const nextValue = isRange ? valueWithFallback : valueWithFallback[0];
      if (typeof nextValue !== "undefined") onCommit?.(nextValue as number | number[]);
    },
    [isRange, onCommit],
  );

  const handlePointerMoveRef = useRef<
    (event: globalThis.MouseEvent | globalThis.TouchEvent) => void
  >(() => {});
  const handlePointerEndRef = useRef<
    (event: globalThis.MouseEvent | globalThis.TouchEvent) => void
  >(() => {});

  const stopPointerListening = useCallback(() => {
    document.removeEventListener("mousemove", handlePointerMoveRef.current);
    document.removeEventListener("mouseup", handlePointerEndRef.current);
    document.removeEventListener("touchmove", handlePointerMoveRef.current);
    document.removeEventListener("touchend", handlePointerEndRef.current);
  }, []);

  const eventToCoords = useCallback(
    (
      event:
        | globalThis.MouseEvent
        | globalThis.TouchEvent
        | MouseEvent<HTMLDivElement>
        | TouchEvent<HTMLDivElement>,
      touchId?: number | null,
    ) => {
      const nativeEvent =
        "nativeEvent" in event
          ? (event.nativeEvent as globalThis.MouseEvent | globalThis.TouchEvent)
          : event;

      if (touchId !== undefined && isTouchEvent(nativeEvent)) {
        for (let i = 0; i < nativeEvent.changedTouches.length; i += 1) {
          const touch = nativeEvent.changedTouches[i];
          if (touch && touch.identifier === touchId) {
            return { x: touch.clientX, y: touch.clientY };
          }
        }
        return false;
      }

      if ("clientX" in nativeEvent) {
        return { x: nativeEvent.clientX, y: nativeEvent.clientY };
      }

      return false;
    },
    [],
  );

  const ensureFocusOnThumb = useCallback((opts: { index: number; shouldSetActive: boolean }) => {
    const { index, shouldSetActive } = opts;
    const slider = sliderRef.current;
    if (!slider) return;

    if (
      slider.contains(document.activeElement) &&
      Number(document.activeElement?.getAttribute("data-index")) !== index
    ) {
      slider.querySelector<HTMLElement>(`[type="range"][data-index="${index}"]`)?.focus();
    }

    if (shouldSetActive) setActiveThumbIndex(index);
  }, []);

  const getNextFromCoords = useCallback(
    (opts: { coords: { x: number; y: number }; isMoving?: boolean }) => {
      const { coords, isMoving = false } = opts;
      const slider = sliderRef.current;
      if (!slider) return null;

      const rect = slider.getBoundingClientRect();
      const mainSize = orientation === "vertical" ? rect.height : rect.width;
      if (mainSize <= 0) return null;

      const percent = TRACK_CALCULATION_STRATEGIES[orientation](rect, coords);
      const raw = percentToValue(percent, minOption, maxOption);
      const snapped =
        discrete && marksValues.length > 0
          ? marksValues[findClosestIndex(marksValues, raw)]
          : roundToStep(raw, stepOption, minOption);

      if (typeof snapped !== "number") return null;

      const candidate = clamp(snapped, minOption, maxOption);

      if (!isRange) {
        return { newValue: candidate, activeIndex: 0 };
      }

      const closestIndex = findClosestIndex(values, candidate);
      const index =
        isMoving && previousActiveIndexRef.current != null
          ? previousActiveIndexRef.current
          : closestIndex;

      const adjustedValues = adjustValueByIndex({
        values,
        newValue: candidate,
        index,
      });

      const adjustedIndex = findClosestIndex(adjustedValues, candidate);
      previousActiveIndexRef.current = adjustedIndex;

      return { newValue: adjustedValues, activeIndex: adjustedIndex };
    },
    [discrete, isRange, marksValues, maxOption, minOption, orientation, stepOption, values],
  );

  const commitValueFromEvent = useCallback(
    (event: KeyboardEvent | Event, input: number) => {
      const index = readThumbIndex(event);
      const current = values[index];
      if (typeof current !== "number") return;

      const useMarks = discrete && marksList.length > 0;

      const snapByMarks = (candidate: number) => {
        const list = marksList;
        const first = list[0];
        const last = list.at(-1);
        if (!first || !last) return current;
        if (candidate <= first.value) return first.value;
        if (candidate >= last.value) return last.value;

        const pos = marksValues.indexOf(current);
        const neighbor = candidate < current ? list[pos - 1] : list[pos + 1];
        return neighbor?.value ?? current;
      };

      const scalar = clamp(useMarks ? snapByMarks(input) : input, minOption, maxOption);
      const nextValues = isRange
        ? adjustValueByIndex({ values, newValue: scalar, index })
        : [scalar];

      if (isRange) {
        const nextActiveIndex = nextValues.indexOf(scalar);
        ensureFocusOnThumb({ index: nextActiveIndex, shouldSetActive: true });
      }

      setFocusedThumbIndex(index);

      if (!areArraysEqual(values, nextValues)) emitChange(nextValues);
      emitCommit(nextValues);
    },
    [
      discrete,
      emitChange,
      emitCommit,
      ensureFocusOnThumb,
      isRange,
      marksList,
      marksValues,
      maxOption,
      minOption,
      values,
    ],
  );

  const handlePointerEnd = useCallback(
    (event: globalThis.MouseEvent | globalThis.TouchEvent) => {
      const coords = eventToCoords(event, touchIdRef.current);
      setIsDragging(false);

      if (!coords) return;

      const next = getNextFromCoords({ coords, isMoving: true });
      if (!next) return;

      const { newValue } = next;
      setActiveThumbIndex(-1);
      emitCommit(valueToArray(newValue));

      movesSinceStartRef.current = 0;
      touchIdRef.current = null;
      stopPointerListening();
    },
    [emitCommit, eventToCoords, getNextFromCoords, stopPointerListening],
  );

  const handlePointerMove = useCallback(
    (event: globalThis.MouseEvent | globalThis.TouchEvent) => {
      const coords = eventToCoords(event, touchIdRef.current);
      if (!coords) return;

      movesSinceStartRef.current += 1;

      if (event.type === "mousemove" && "buttons" in event && event.buttons === 0) {
        handlePointerEnd(event);
        return;
      }

      const nextState = getNextFromCoords({ coords, isMoving: true });
      if (!nextState) {
        handlePointerEnd(event);
        return;
      }

      const { newValue, activeIndex } = nextState;

      if (movesSinceStartRef.current > DRAG_MOVE_THRESHOLD) {
        setIsDragging(true);
      }

      ensureFocusOnThumb({ index: activeIndex, shouldSetActive: true });
      emitChange(valueToArray(newValue));
      setIsDragging(true);
    },
    [emitChange, ensureFocusOnThumb, eventToCoords, getNextFromCoords, handlePointerEnd],
  );

  handlePointerMoveRef.current = handlePointerMove;
  handlePointerEndRef.current = handlePointerEnd;

  const handlePointerStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (disabled) return;

      const touch = event.changedTouches[0];
      if (touch !== null && touch !== undefined) touchIdRef.current = touch.identifier;

      const coords = eventToCoords(event, touchIdRef.current);
      if (coords) {
        const nextState = getNextFromCoords({ coords, isMoving: false });
        if (nextState) {
          const { newValue, activeIndex } = nextState;
          ensureFocusOnThumb({ index: activeIndex, shouldSetActive: true });
          emitChange(valueToArray(newValue));
        }
      }

      movesSinceStartRef.current = 0;
      document.addEventListener("touchmove", handlePointerMoveRef.current, { passive: true });
      document.addEventListener("touchend", handlePointerEndRef.current);
    },
    [disabled, emitChange, ensureFocusOnThumb, eventToCoords, getNextFromCoords],
  );

  const handleRootMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.button !== 0) return;
      if (event.defaultPrevented) return;

      event.preventDefault();
      const coords = eventToCoords(event, touchIdRef.current);
      if (coords) {
        const nextState = getNextFromCoords({ coords });
        if (nextState) {
          const { newValue, activeIndex } = nextState;
          ensureFocusOnThumb({ index: activeIndex, shouldSetActive: true });
          emitChange(valueToArray(newValue));
        }
      }

      movesSinceStartRef.current = 0;
      document.addEventListener("mousemove", handlePointerMoveRef.current, { passive: true });
      document.addEventListener("mouseup", handlePointerEndRef.current);
    },
    [disabled, emitChange, ensureFocusOnThumb, eventToCoords, getNextFromCoords],
  );

  const handleHiddenInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      commitValueFromEvent(event.nativeEvent, event.currentTarget.valueAsNumber);
    },
    [commitValueFromEvent, disabled],
  );

  const handleHiddenInputFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
    const index = readThumbIndex(event);
    if (isFocusVisible(event.target)) {
      setFocusedThumbIndex(index);
      setActiveThumbIndex(index);
    }
  }, []);

  const handleHiddenInputBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
    if (!isFocusVisible(event.target)) {
      setFocusedThumbIndex(-1);
      setActiveThumbIndex(-1);
    }
  }, []);

  const handleHiddenInputKeydown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (!NAVIGATION_KEYS.has(event.key)) return;
      event.preventDefault();

      const index = readThumbIndex(event);
      const current = values[index];
      if (typeof current !== "number") return;

      if (!discrete) {
        const stepSize = event.shiftKey ? shiftStep : stepOption;

        if (event.key === KEY.Home) return commitValueFromEvent(event, minOption);
        if (event.key === KEY.End) return commitValueFromEvent(event, maxOption);

        if (INCREMENT_KEYS.has(event.key)) {
          const next = clamp(current + stepSize, minOption, maxOption);
          if (next !== current) commitValueFromEvent(event, next);
          return;
        }

        if (DECREMENT_KEYS.has(event.key)) {
          const next = clamp(current - stepSize, minOption, maxOption);
          if (next !== current) commitValueFromEvent(event, next);
          return;
        }

        return;
      }

      const lastIndex = marksValues.length - 1;
      const currentIndex = marksValues.indexOf(current);
      const first = marksValues[0];
      const last = marksValues[lastIndex];

      if (event.key === KEY.Home && typeof first === "number")
        return commitValueFromEvent(event, first);
      if (event.key === KEY.End && typeof last === "number")
        return commitValueFromEvent(event, last);

      if (INCREMENT_KEYS.has(event.key)) {
        const nextIdx = currentIndex < 0 ? 0 : Math.min(lastIndex, currentIndex + 1);
        const next = marksValues[nextIdx];
        if (next !== current && typeof next === "number") commitValueFromEvent(event, next);
        return;
      }

      if (DECREMENT_KEYS.has(event.key)) {
        const nextIdx = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1);
        const next = marksValues[nextIdx];
        if (next !== current && typeof next === "number") commitValueFromEvent(event, next);
      }
    },
    [
      commitValueFromEvent,
      disabled,
      discrete,
      marksValues,
      maxOption,
      minOption,
      shiftStep,
      stepOption,
      values,
    ],
  );

  useEffect(() => {
    if (disabled) {
      setIsDragging(false);
      setActiveThumbIndex(-1);
      setFocusedThumbIndex(-1);
      stopPointerListening();
    }
  }, [disabled, stopPointerListening]);

  useEffect(() => () => stopPointerListening(), [stopPointerListening]);

  const valueToPercentFn = useCallback(
    (value: number) => valueToPercent(value, minOption, maxOption),
    [maxOption, minOption],
  );

  const isMarkActive = useCallback(
    (markValue: number) => {
      if (isRange) {
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        return markValue >= minValue && markValue <= maxValue;
      }
      return markValue <= (values[0] ?? minOption);
    },
    [isRange, minOption, values],
  );

  const trackStyle = useMemo(
    () => ({
      [axis.position]: `${trackOffset}%`,
      [axis.size]: `${trackLength}%`,
    }),
    [axis.position, axis.size, trackLength, trackOffset],
  );

  return {
    sliderRef,
    values,
    isRange,
    isDragging,
    activeThumbIndex,
    focusedThumbIndex,
    marksList,
    trackOffset,
    trackLength,
    axis,
    valueToPercent: valueToPercentFn,
    isMarkActive,
    getRootProps: () => ({
      ref: sliderRef,
      style: { touchAction: orientation === "vertical" ? "pan-x" : "pan-y" },
      onMouseDown: handleRootMouseDown,
      onTouchStart: handlePointerStart,
    }),
    getRailProps: () => ({ role: "presentation", "aria-hidden": true as const }),
    getTrackProps: () => ({
      role: "presentation",
      "aria-hidden": true as const,
      style: trackStyle,
    }),
    getThumbContainerProps: (index, thumbValue) => ({
      "data-index": index,
      style: { [axis.position]: `${valueToPercentFn(thumbValue)}%` },
    }),
    getThumbInputProps: (index, thumbValue) => ({
      min: minOption,
      max: maxOption,
      value: thumbValue,
      role: "slider",
      type: "range",
      "aria-label": getAriaLabel?.(index) ?? label,
      "aria-valuemin": minOption,
      "aria-valuemax": maxOption,
      "aria-valuenow": thumbValue,
      "aria-valuetext": getAriaValueText?.(thumbValue, index),
      "aria-orientation": orientation,
      "data-index": index,
      tabIndex: disabled ? -1 : 0,
      step: discrete && marksList.length > 0 ? "any" : stepOption,
      disabled,
      onChange: handleHiddenInputChange,
      onFocus: handleHiddenInputFocus,
      onBlur: handleHiddenInputBlur,
      onKeyDown: handleHiddenInputKeydown,
    }),
    getMarkProps: (mark) => ({
      "data-value": mark.value,
      "aria-hidden": true as const,
      style: {
        [axis.position]: `${clamp(valueToPercentFn(mark.value), 0, 100)}%`,
      },
    }),
    getMarkLabelProps: (mark) => ({
      "data-value": mark.value,
      "aria-hidden": true as const,
      style: { [axis.position]: `${valueToPercentFn(mark.value)}%` },
    }),
  };
}
