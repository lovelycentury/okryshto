import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination, type PaginationColor, type PaginationSize } from "./Pagination";

/**
 * Page controls with boundary pages, a sibling window around the current page,
 * and ellipses in between.
 *
 * The component is controlled: it renders exactly the `page` you pass and calls
 * `onChange` — keep the page in your own state (or in the URL) as every story
 * below does.
 */
const meta: Meta<typeof Pagination> = {
  title: "Navigation/Pagination",
  component: Pagination,
  args: {
    count: 10,
    page: 1,
    siblingCount: 1,
    boundaryCount: 1,
    showFirstButton: false,
    showLastButton: false,
    size: "medium",
    shape: "rounded",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    onChange: { control: false },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
    shape: { control: "inline-radio", options: ["circular", "rounded"] },
    color: { control: "select", options: ["primary", "dante", "indigo", "violet", "ember", "ice"] },
  },
  render: (args) => (
    <div style={surface}>
      <Pagination {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const surface: CSSProperties = {
  background: "var(--okryshto-bg-surface-raised)",
  border: "1px solid var(--okryshto-border-subtle)",
  borderRadius: "12px",
  padding: "16px",
  width: "fit-content",
  fontFamily: "var(--okryshto-font-family-sans)",
  color: "var(--okryshto-text-primary)",
};

const cell: CSSProperties = {
  padding: "10px 12px",
  fontSize: "var(--okryshto-font-size-sm)",
  textAlign: "left",
  borderBottom: "1px solid var(--okryshto-border-subtle)",
};

/**
 * Play with every prop from the controls panel. `page` is fixed here — see
 * Table below for the wired version.
 */
export const Playground: Story = {};

/**
 * The real job: a table footer that pages through rows. Note how `onChange`
 * writes back into state and the slice follows.
 */
export const Table: Story = {
  name: "Table footer (wired)",
  render: () => {
    const rows = Array.from({ length: 43 }, (_, index) => ({
      id: 1043 - index,
      title: ["Fix flaky login test", "Bump vite to 6.1", "Add empty state", "Tune ripple timing"][
        index % 4
      ],
      author: ["Maria", "Tomas", "Oleksii", "Ana"][index % 4],
    }));
    const perPage = 5;
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(rows.length / perPage);
    const visible = rows.slice((page - 1) * perPage, page * perPage);

    return (
      <div style={{ ...surface, width: "480px", padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td style={{ ...cell, color: "var(--okryshto-text-muted)", width: "72px" }}>
                  #{row.id}
                </td>
                <td style={cell}>{row.title}</td>
                <td style={{ ...cell, color: "var(--okryshto-text-secondary)", width: "96px" }}>
                  {row.author}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--okryshto-font-size-sm)",
              color: "var(--okryshto-text-secondary)",
            }}
          >
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, rows.length)} of {rows.length}
          </span>
          <Pagination count={pageCount} page={page} onChange={(_event, next) => setPage(next)} />
        </div>
      </div>
    );
  },
};

/**
 * With many pages the middle collapses: `boundaryCount` pages pinned at each
 * end, `siblingCount` on each side of the current page, ellipses for the rest.
 */
export const Windowing: Story = {
  render: () => {
    const [page, setPage] = useState(37);
    return (
      <div style={{ ...surface, display: "grid", gap: "16px" }}>
        <Pagination count={80} page={page} onChange={(_event, next) => setPage(next)} />
        <Pagination
          count={80}
          page={page}
          siblingCount={2}
          onChange={(_event, next) => setPage(next)}
        />
        <Pagination
          count={80}
          page={page}
          boundaryCount={2}
          onChange={(_event, next) => setPage(next)}
        />
        <span
          style={{
            fontSize: "var(--okryshto-font-size-sm)",
            color: "var(--okryshto-text-secondary)",
          }}
        >
          default · siblingCount=2 · boundaryCount=2 — page {page} of 80
        </span>
      </div>
    );
  },
};

/**
 * First/last buttons help when the list is long enough that dragging through
 * pages is tedious.
 */
export const WithBoundaryButtons: Story = {
  render: () => {
    const [page, setPage] = useState(6);
    return (
      <div style={surface}>
        <Pagination
          count={24}
          page={page}
          showFirstButton
          showLastButton
          onChange={(_event, next) => setPage(next)}
        />
      </div>
    );
  },
};

/**
 * Sizes and shapes. `circular` suits dense toolbars; `rounded` is the default.
 */
export const SizesAndShapes: Story = {
  render: () => {
    const sizes: PaginationSize[] = ["small", "medium", "large"];
    return (
      <div style={{ ...surface, display: "grid", gap: "16px" }}>
        {sizes.map((size) => (
          <Pagination key={size} count={8} page={3} size={size} />
        ))}
        <Pagination count={8} page={3} shape="circular" />
      </div>
    );
  },
};

/**
 * Every accent tone the active page supports.
 */
export const Colors: Story = {
  render: () => {
    const colors: PaginationColor[] = ["primary", "dante", "indigo", "violet", "ember", "ice"];
    return (
      <div style={{ ...surface, display: "grid", gap: "12px" }}>
        {colors.map((color) => (
          <Pagination key={color} count={6} page={2} color={color} />
        ))}
      </div>
    );
  },
};

/**
 * Disabled while the page data is loading — every control greys out and stops
 * emitting `onChange`.
 */
export const Disabled: Story = {
  render: () => (
    <div style={surface}>
      <Pagination count={10} page={2} disabled showFirstButton showLastButton />
    </div>
  ),
};
