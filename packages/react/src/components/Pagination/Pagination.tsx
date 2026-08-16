import { type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import "@okryshto/design-system/components/Pagination/Pagination.scss";

export type PaginationColor = "primary" | "dante" | "indigo" | "violet" | "ember" | "ice";
export type PaginationSize = "small" | "medium" | "large";
export type PaginationShape = "circular" | "rounded";

const ChevronLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 6-6 6 6 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const FirstPageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m11 6-6 6 6 6" />
    <path d="M18 6v12" />
  </svg>
);

const LastPageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 6 6 6-6 6" />
    <path d="M18 6v12" />
  </svg>
);

/** MUI-style page range with boundaries + sibling window + ellipses. */
export function getPaginationItems(
  page: number,
  count: number,
  siblingCount = 1,
  boundaryCount = 1,
): Array<number | "ellipsis"> {
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, index) => start + index);
  };

  const totalNumbers = siblingCount * 2 + boundaryCount * 2 + 3;

  if (count <= totalNumbers) {
    return range(1, count);
  }

  const leftSiblingIndex = Math.max(page - siblingCount, boundaryCount + 2);
  const rightSiblingIndex = Math.min(page + siblingCount, count - boundaryCount - 1);

  const items: Array<number | "ellipsis"> = [];

  items.push(...range(1, boundaryCount));

  if (leftSiblingIndex > boundaryCount + 2) {
    items.push("ellipsis");
  } else {
    items.push(...range(boundaryCount + 1, leftSiblingIndex - 1));
  }

  items.push(...range(leftSiblingIndex, rightSiblingIndex));

  if (rightSiblingIndex < count - boundaryCount - 1) {
    items.push("ellipsis");
  } else {
    items.push(...range(rightSiblingIndex + 1, count - boundaryCount));
  }

  items.push(...range(count - boundaryCount + 1, count));

  return items;
}

/**
 * Props follow MUI's Pagination API (https://mui.com/material-ui/api/pagination/)
 * closely: `count`/`page`/`onChange`/`siblingCount`/`boundaryCount`/
 * `showFirstButton`/`showLastButton`/`size`/`color`/`disabled`/`shape` match
 * name-for-name. Deliberate gaps: no `renderItem` override and no compact
 * mobile variant in v1.
 */
export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> {
  /**
   * Total number of pages.
   *
   * @default undefined
   * @type {number}
   */
  count: number;
  /**
   * Current page (1-based).
   *
   * @default 1
   * @type {number}
   */
  page?: number;
  /**
   * Fires when the page changes.
   *
   * @default undefined
   * @type {(event: MouseEvent<HTMLButtonElement>, page: number) => void}
   */
  onChange?: (event: MouseEvent<HTMLButtonElement>, page: number) => void;
  /**
   * Pages shown on each side of the current page.
   *
   * @default 1
   * @type {number}
   */
  siblingCount?: number;
  /**
   * Pages always shown at the start and end.
   *
   * @default 1
   * @type {number}
   */
  boundaryCount?: number;
  /**
   * Show First Button.
   *
   * @default false
   * @type {boolean}
   */
  showFirstButton?: boolean;
  /**
   * Show Last Button.
   *
   * @default false
   * @type {boolean}
   */
  showLastButton?: boolean;
  /**
   * Size.
   *
   * @default "medium"
   * @type {PaginationSize}
   */
  size?: PaginationSize;
  /**
   * Color.
   *
   * @default "primary"
   * @type {PaginationColor}
   */
  color?: PaginationColor;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Shape.
   *
   * @default "rounded"
   * @type {PaginationShape}
   */
  shape?: PaginationShape;
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
  active = false,
}: {
  label: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={["okryshto-pagination__button", active && "okryshto-pagination__button--active"]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Pagination({
  count,
  page = 1,
  onChange,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstButton = false,
  showLastButton = false,
  size = "medium",
  color = "primary",
  disabled = false,
  shape = "rounded",
  className,
  ...rest
}: PaginationProps) {
  const safeCount = Math.max(1, count);
  const safePage = Math.min(Math.max(1, page), safeCount);
  const items = getPaginationItems(safePage, safeCount, siblingCount, boundaryCount);

  const classes = [
    "okryshto-component",
    "okryshto-pagination",
    color !== "primary" && `okryshto-pagination--color-${color}`,
    size !== "medium" && `okryshto-pagination--size-${size}`,
    shape === "circular" && "okryshto-pagination--shape-circular",
    disabled && "okryshto-pagination--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const goToPage = (event: MouseEvent<HTMLButtonElement>, nextPage: number) => {
    if (disabled || nextPage === safePage) return;
    onChange?.(event, nextPage);
  };

  const prevDisabled = disabled || safePage <= 1;
  const nextDisabled = disabled || safePage >= safeCount;

  return (
    <nav aria-label="pagination" className={classes} {...rest}>
      <ul className="okryshto-pagination__list">
        {showFirstButton && (
          <li className="okryshto-pagination__item">
            <NavButton
              label="Go to first page"
              disabled={prevDisabled}
              onClick={(event) => goToPage(event, 1)}
            >
              <span className="okryshto-pagination__icon" aria-hidden="true">
                <FirstPageIcon />
              </span>
            </NavButton>
          </li>
        )}
        <li className="okryshto-pagination__item">
          <NavButton
            label="Go to previous page"
            disabled={prevDisabled}
            onClick={(event) => goToPage(event, safePage - 1)}
          >
            <span className="okryshto-pagination__icon" aria-hidden="true">
              <ChevronLeftIcon />
            </span>
          </NavButton>
        </li>
        {items.map((item, index) => (
          <li className="okryshto-pagination__item" key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <span className="okryshto-pagination__ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <NavButton
                label={`Go to page ${item}`}
                active={item === safePage}
                disabled={disabled}
                onClick={(event) => goToPage(event, item)}
              >
                {item}
              </NavButton>
            )}
          </li>
        ))}
        <li className="okryshto-pagination__item">
          <NavButton
            label="Go to next page"
            disabled={nextDisabled}
            onClick={(event) => goToPage(event, safePage + 1)}
          >
            <span className="okryshto-pagination__icon" aria-hidden="true">
              <ChevronRightIcon />
            </span>
          </NavButton>
        </li>
        {showLastButton && (
          <li className="okryshto-pagination__item">
            <NavButton
              label="Go to last page"
              disabled={nextDisabled}
              onClick={(event) => goToPage(event, safeCount)}
            >
              <span className="okryshto-pagination__icon" aria-hidden="true">
                <LastPageIcon />
              </span>
            </NavButton>
          </li>
        )}
      </ul>
    </nav>
  );
}
