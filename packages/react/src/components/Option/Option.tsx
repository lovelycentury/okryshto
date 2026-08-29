"use client";

import {
  createContext,
  useContext,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from "react";
import { iconCheck } from "@okryshto/icons";

/**
 * BEM block the option parts namespace themselves under — `"okryshto-select"` or
 * `"okryshto-autocomplete"`. Select and Autocomplete each provide their own, so a
 * `renderOption` written for one keeps that component's listbox styling.
 *
 * Outside either popup there is no block, and the parts render as plain
 * elements with only the caller's `className`: the primitives inherit the
 * styling of the list they are rendered in rather than carrying a block of
 * their own.
 */
const OptionBlockContext = createContext<string | null>(null);

export interface OptionScopeProps {
  /**
   * BEM block the option parts inside this scope use, e.g. `"okryshto-select"`.
   *
   * @default undefined
   * @type {string}
   */
  block: string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

/**
 * Names the BEM block for every option part rendered below it. Select and
 * Autocomplete wrap their listboxes in one; apps only need it when they render
 * option parts somewhere else entirely.
 */
export function OptionScope({ block, children }: OptionScopeProps) {
  return <OptionBlockContext.Provider value={block}>{children}</OptionBlockContext.Provider>;
}

/** The block in scope, or `null` outside a Select/Autocomplete listbox. */
export function useOptionBlock(): string | null {
  return useContext(OptionBlockContext);
}

function element(block: string | null, part: string, className?: string) {
  return [block && `${block}__${part}`, className].filter(Boolean).join(" ") || undefined;
}

export interface OptionRowProps extends LiHTMLAttributes<HTMLLIElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

/**
 * The `<li>` an option row lives in. Spread `renderOption`'s `props` on it and
 * the row keeps its listbox role, its highlight/selected modifiers and the
 * pointer and keyboard wiring — none of which the row can rebuild by hand.
 *
 * ```tsx
 * renderOption={(props, option) => <OptionRow {...props}>{option.label}</OptionRow>}
 * ```
 */
export function OptionRow({ children, ...rest }: OptionRowProps) {
  return <li {...rest}>{children}</li>;
}

export interface OptionPartProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

/** The row's primary text: takes the free space and truncates with an ellipsis. */
export function OptionLabel({ className, children, ...rest }: OptionPartProps) {
  const block = useOptionBlock();
  return (
    <span className={element(block, "option-label", className)} {...rest}>
      {children}
    </span>
  );
}

/** Muted secondary text — a country code, a count, a hint. */
export function OptionDescription({ className, children, ...rest }: OptionPartProps) {
  const block = useOptionBlock();
  return (
    <span className={element(block, "option-meta", className)} {...rest}>
      {children}
    </span>
  );
}

/**
 * Stacks a label and its description vertically for two-line rows. Without it
 * the row is a single centred flex line and the description sits beside the
 * label instead of under it.
 */
export function OptionBody({ className, children, ...rest }: OptionPartProps) {
  const block = useOptionBlock();
  return (
    <span className={element(block, "option-body", className)} {...rest}>
      {children}
    </span>
  );
}

export interface OptionCheckProps extends OptionPartProps {
  /**
   * Whether the tick is drawn. `false` still reserves nothing — the element is
   * simply not rendered — so pass the row's `selected` state straight through.
   *
   * @default true
   * @type {boolean}
   */
  checked?: boolean;
}

/** The selected tick, in the accent colour the default rows use. */
export function OptionCheck({ checked = true, className, ...rest }: OptionCheckProps) {
  const block = useOptionBlock();
  if (!checked) return null;
  return (
    <span
      className={element(block, "option-check", className)}
      dangerouslySetInnerHTML={{ __html: iconCheck }}
      aria-hidden="true"
      {...rest}
    />
  );
}

export interface HighlightMatchProps {
  /**
   * The full option text.
   *
   * @default undefined
   * @type {string}
   */
  text: string;
  /**
   * What the user typed — usually Autocomplete's `inputValue`, handed to
   * `renderOption` in its `state`.
   *
   * @default undefined
   * @type {string}
   */
  query?: string;
  /**
   * Class Name. Applied to the emphasised run.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}

/**
 * Emphasises the first case-insensitive occurrence of `query` inside `text`.
 * Only the first: a second run would compete with the row's own highlight state
 * for the reader's eye.
 *
 * The match is wrapped in `<mark>`: an inline element that adds emphasis
 * semantics and no text of its own, so the row still reads as the option
 * label. Styling it with weight rather than a background keeps the row's own
 * highlighted and selected states legible underneath.
 */
export function HighlightMatch({ text, query, className }: HighlightMatchProps) {
  const block = useOptionBlock();
  const needle = query?.trim() ?? "";
  const at = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;

  if (at === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <mark className={element(block, "option-mark", className)}>
        {text.slice(at, at + needle.length)}
      </mark>
      {text.slice(at + needle.length)}
    </>
  );
}
