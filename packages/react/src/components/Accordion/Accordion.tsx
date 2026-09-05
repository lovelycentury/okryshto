"use client";

import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { Collapse } from "../Collapse/Collapse";
import "@okkly/design-system/components/Accordion/Accordion.scss";

interface AccordionContextValue {
  expanded: boolean;
  disabled?: boolean;
  toggle: (event: SyntheticEvent) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(component: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`${component} must be used within Accordion`);
  }
  return context;
}

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/**
 * Props follow MUI's Accordion API (https://mui.com/material-ui/api/accordion/)
 * closely: `expanded`/`defaultExpanded`/`onChange`/`disabled` match
 * name-for-name. Deliberate gaps: composition uses `AccordionSummary` /
 * `AccordionDetails` subcomponents (no `items` array), and there's no
 * `AccordionActions` slot in v1.
 */
export interface AccordionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> {
  /**
   * Controlled expanded state.
   *
   * @default undefined
   * @type {boolean}
   */
  expanded?: boolean;
  /**
   * Initial expanded state (uncontrolled).
   *
   * @default false
   * @type {boolean}
   */
  defaultExpanded?: boolean;
  /**
   * Fires when expanded state changes.
   *
   * @default undefined
   * @type {(event: SyntheticEvent, expanded: boolean) => void}
   */
  onChange?: (event: SyntheticEvent, expanded: boolean) => void;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function Accordion({
  expanded,
  defaultExpanded = false,
  onChange,
  disabled = false,
  children,
  className,
  ...rest
}: AccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;

  const toggle = (event: SyntheticEvent) => {
    if (disabled) return;
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onChange?.(event, next);
  };

  const classes = [
    "okkly-component",
    "okkly-accordion",
    isExpanded && "okkly-accordion--expanded",
    disabled && "okkly-accordion--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AccordionContext.Provider value={{ expanded: isExpanded, disabled, toggle }}>
      <div className={classes} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionSummaryProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /**
   * Summary title/content.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Custom expand icon; defaults to a chevron.
   *
   * @default undefined
   * @type {ReactNode}
   */
  expandIcon?: ReactNode;
}

export function AccordionSummary({
  children,
  expandIcon,
  className,
  onClick,
  ...rest
}: AccordionSummaryProps) {
  const { expanded, disabled, toggle } = useAccordionContext("AccordionSummary");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    toggle(event);
    onClick?.(event);
  };

  const classes = ["okkly-accordion__summary", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      <span className="okkly-accordion__title">{children}</span>
      <span
        className={["okkly-accordion__chevron", expanded && "okkly-accordion__chevron--expanded"]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        {expandIcon ?? <ChevronDownIcon />}
      </span>
    </button>
  );
}

export interface AccordionDetailsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function AccordionDetails({ children, className, ...rest }: AccordionDetailsProps) {
  const { expanded } = useAccordionContext("AccordionDetails");

  const classes = ["okkly-accordion__details", className].filter(Boolean).join(" ");

  // `Collapse` animates both directions and keeps the panel out of the DOM while
  // closed (`mountOnEnter`/`unmountOnExit`), so collapsed content stays
  // unreachable for search and assistive tech. `appear={false}` keeps an
  // already-expanded panel static on first paint.
  return (
    <Collapse in={expanded} timeout="auto" appear={false} mountOnEnter unmountOnExit>
      <div className={classes} role="region" {...rest}>
        {children}
      </div>
    </Collapse>
  );
}
