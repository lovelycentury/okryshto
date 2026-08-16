import { forwardRef, type HTMLAttributes, type ReactNode, type TdHTMLAttributes } from "react";
import "@okryshto/design-system/components/Table/Table.scss";

export type TableDensity = "default" | "dense";

/**
 * Props follow MUI's Table API (https://mui.com/material-ui/api/table/) for
 * `size`/`stickyHeader` concepts via `density` and `TableContainer stickyHeader`.
 * Deliberate gaps: no sort/pagination/data-grid — semantic wrappers only.
 */
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /**
   * Row padding preset.
   *
   * @default "default"
   * @type {TableDensity}
   */
  density?: TableDensity;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = "default", children, className, ...rest },
  ref,
) {
  // `okryshto-component` here too, not just on the container: the reset that carries
  // `box-sizing: border-box` is scoped to that class, and a `Table` is perfectly
  // legal without a `TableContainer` around it.
  const classes = [
    "okryshto-component",
    "okryshto-table",
    density === "dense" && "okryshto-table--dense",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <table ref={ref} className={classes} {...rest}>
      {children}
    </table>
  );
});

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keeps the header visible while scrolling.
   *
   * @default false
   * @type {boolean}
   */
  stickyHeader?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function TableContainer({
  stickyHeader = false,
  children,
  className,
  ...rest
}: TableContainerProps) {
  const classes = [
    "okryshto-component",
    "okryshto-table-container",
    stickyHeader && "okryshto-table-container--sticky",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function TableHead({ children, className, ...rest }: TableHeadProps) {
  const classes = ["okryshto-table__head", className].filter(Boolean).join(" ");

  return (
    <thead className={classes} {...rest}>
      {children}
    </thead>
  );
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function TableBody({ children, className, ...rest }: TableBodyProps) {
  const classes = ["okryshto-table__body", className].filter(Boolean).join(" ");

  return (
    <tbody className={classes} {...rest}>
      {children}
    </tbody>
  );
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /**
   * Hover.
   *
   * @default false
   * @type {boolean}
   */
  hover?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export function TableRow({ hover = false, children, className, ...rest }: TableRowProps) {
  const classes = ["okryshto-table__row", hover && "okryshto-table__row--hover", className]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={classes} {...rest}>
      {children}
    </tr>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Renders `<th>` instead of `<td>`.
   *
   * @default false
   * @type {boolean}
   */
  head?: boolean;
  /**
   * Right-align numeric values.
   *
   * @default false
   * @type {boolean}
   */
  numeric?: boolean;
}

export function TableCell({
  head = false,
  numeric = false,
  children,
  className,
  ...rest
}: TableCellProps) {
  const Tag = head ? "th" : "td";
  const classes = [
    "okryshto-table__cell",
    head && "okryshto-table__cell--head",
    numeric && "okryshto-table__cell--numeric",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} scope={head ? "col" : undefined} {...rest}>
      {children}
    </Tag>
  );
}

export type TableHeaderCellProps = TableCellProps;

export function TableHeaderCell(props: TableHeaderCellProps) {
  return <TableCell head {...props} />;
}
