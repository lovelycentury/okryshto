import { useMemo, useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar/Avatar";
import { Badge } from "../Badge/Badge";
import { Checkbox } from "../Checkbox/Checkbox";
import { EmptyState } from "../EmptyState/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "./Table";

/**
 * Semantic table wrappers, and nothing more. There is no `columns`/`rows` prop, no
 * built-in sorting, no pagination — you write the `thead` and `tbody` yourself and
 * these components supply the styling and the right elements. That is a deliberate
 * floor, not an unfinished feature: sorting and selection are three lines of state
 * in the page that owns the data, and every attempt to own them here ends up
 * fighting the caller's data layer.
 *
 * The stories below show those patterns implemented the intended way, on local
 * state. Two things the wrappers *do* handle for you: `head` emits a `<th>` with
 * `scope="col"`, and `numeric` right-aligns with tabular figures so digits line up
 * across rows.
 */
const meta: Meta<typeof Table> = {
  title: "Data/Table",
  component: Table,
  args: {
    density: "default",
  },
  argTypes: {
    density: { control: "inline-radio", options: ["default", "dense"] },
    children: { control: false },
  },
  render: (args) => (
    <div style={surface}>
      <TableContainer>
        <Table {...args}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Invoice</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell numeric>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {INVOICES.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>
                  <Badge variant="dot" color={STATUS_TONE[invoice.status]} /> {invoice.status}
                </TableCell>
                <TableCell numeric>{format(invoice.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Table>;

const surface: CSSProperties = {
  width: "720px",
  fontFamily: "var(--okkly-font-family-sans)",
  color: "var(--okkly-text-primary)",
};

type Status = "paid" | "pending" | "overdue";

const STATUS_TONE: Record<Status, "primary" | "indigo" | "dante"> = {
  paid: "primary",
  pending: "indigo",
  overdue: "dante",
};

const INVOICES: Array<{
  id: string;
  client: string;
  status: Status;
  amount: number;
  initials: string;
}> = [
  { id: "INV-2043", client: "Northwind Records", status: "paid", amount: 4820, initials: "NR" },
  { id: "INV-2044", client: "Berg Studio", status: "pending", amount: 1240, initials: "BS" },
  { id: "INV-2045", client: "Kovac & Co", status: "overdue", amount: 9600, initials: "KC" },
  { id: "INV-2046", client: "Ford Audio", status: "paid", amount: 380, initials: "FA" },
  { id: "INV-2047", client: "Shah Mastering", status: "pending", amount: 15750, initials: "SM" },
];

const format = (amount: number) => `€${amount.toLocaleString("en-GB")}`;

/**
 * Play with every prop from the controls panel.
 */
export const Playground: Story = {};

/**
 * A cell takes nodes, not just text. Avatars, badges, and buttons all belong in
 * one — the wrapper only handles padding and alignment.
 */
export const RichCells: Story = {
  name: "Rich cells",
  render: () => (
    <div style={surface}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Invoice</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell numeric>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {INVOICES.map((invoice, index) => (
              <TableRow key={invoice.id} hover>
                <TableCell>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                    <Avatar
                      initials={invoice.initials}
                      size="sm"
                      color={(["mint", "dante", "indigo"] as const)[index % 3]}
                    />
                    {invoice.client}
                  </span>
                </TableCell>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant="dot" color={STATUS_TONE[invoice.status]} />
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell numeric>{format(invoice.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ),
};

/**
 * Sorting, done in the page. The header cell becomes a button, `aria-sort` on the
 * `<th>` tells assistive tech which column is ordered and which way, and the data
 * is sorted with `useMemo` — none of which needs a prop on `Table`.
 */
export const Sortable: Story = {
  render: () => {
    const [sort, setSort] = useState<{ key: "client" | "amount"; direction: "asc" | "desc" }>({
      key: "amount",
      direction: "desc",
    });

    const rows = useMemo(() => {
      const sorted = [...INVOICES].sort((a, b) =>
        sort.key === "amount" ? a.amount - b.amount : a.client.localeCompare(b.client),
      );
      return sort.direction === "asc" ? sorted : sorted.reverse();
    }, [sort]);

    const toggle = (key: "client" | "amount") =>
      setSort((current) =>
        current.key === key
          ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
          : { key, direction: "asc" },
      );

    const sortButton: CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: 0,
      border: "none",
      background: "none",
      font: "inherit",
      color: "inherit",
      cursor: "pointer",
    };

    return (
      <div style={surface}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell
                  aria-sort={
                    sort.key === "client"
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button type="button" style={sortButton} onClick={() => toggle("client")}>
                    Client
                    <span aria-hidden="true">
                      {sort.key === "client" ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell
                  numeric
                  aria-sort={
                    sort.key === "amount"
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button type="button" style={sortButton} onClick={() => toggle("amount")}>
                    Amount
                    <span aria-hidden="true">
                      {sort.key === "amount" ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell numeric>{format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  },
};

/**
 * Row selection, also in the page. The header checkbox is `indeterminate` while
 * the selection is partial, and each row carries `aria-selected` so the state is
 * not conveyed by the highlight alone.
 */
export const SelectableRows: Story = {
  name: "Selectable rows",
  render: () => {
    const [selected, setSelected] = useState<string[]>(["INV-2044"]);
    const allSelected = selected.length === INVOICES.length;
    const someSelected = selected.length > 0 && !allSelected;

    const toggleRow = (id: string) =>
      setSelected((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );

    return (
      <div style={{ display: "grid", gap: "12px", ...surface }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell style={{ width: "1%" }}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    aria-label="Select all invoices"
                    onChange={() =>
                      setSelected(allSelected ? [] : INVOICES.map((invoice) => invoice.id))
                    }
                  />
                </TableHeaderCell>
                <TableHeaderCell>Invoice</TableHeaderCell>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell numeric>Amount</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.map((invoice) => (
                <TableRow key={invoice.id} hover aria-selected={selected.includes(invoice.id)}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(invoice.id)}
                      aria-label={`Select ${invoice.id}`}
                      onChange={() => toggleRow(invoice.id)}
                    />
                  </TableCell>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell numeric>{format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <p
          style={{
            margin: 0,
            fontSize: "var(--okkly-font-size-sm)",
            color: "var(--okkly-text-muted)",
          }}
        >
          {selected.length} of {INVOICES.length} selected
        </p>
      </div>
    );
  },
};

/**
 * `stickyHeader` pins the header and caps the container's height, so the table
 * scrolls inside its own box instead of taking the page with it. Override
 * `--okkly-table-container-max-height` for a taller pane.
 */
export const StickyHeader: Story = {
  name: "Sticky header",
  render: () => (
    <div style={surface}>
      <TableContainer stickyHeader>
        <Table density="dense">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Invoice</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell numeric>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 24 }, (_, index) => {
              const invoice = INVOICES[index % INVOICES.length];
              return (
                <TableRow key={index} hover>
                  <TableCell>INV-{2100 + index}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell numeric>{format(invoice.amount + index * 37)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ),
};

/**
 * `density="dense"` tightens the cell padding. Worth it once a table is long
 * enough that scrolling costs more than breathing room buys.
 */
export const Density: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "18px", ...surface }}>
      {(["default", "dense"] as const).map((density) => (
        <TableContainer key={density}>
          <Table density={density}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>{density}</TableHeaderCell>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell numeric>Amount</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {INVOICES.slice(0, 3).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell numeric>{format(invoice.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}
    </div>
  ),
};

/**
 * `numeric` is not only alignment — it also switches on tabular figures, so digits
 * occupy the same width in every row and the column reads as a column. Compare the
 * two amount columns below.
 */
export const NumericColumns: Story = {
  name: "Numeric columns",
  render: () => (
    <div style={surface}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Invoice</TableHeaderCell>
              <TableHeaderCell>Amount, plain cell</TableHeaderCell>
              <TableHeaderCell numeric>Amount, numeric</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {INVOICES.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{format(invoice.amount)}</TableCell>
                <TableCell numeric>{format(invoice.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ),
};

/**
 * Nothing to show. Keep the header — it tells the user what would have been here —
 * and hand the empty body to `EmptyState` via a full-width cell.
 */
export const Empty: Story = {
  render: () => (
    <div style={surface}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Invoice</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell numeric>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} style={{ padding: "12px" }}>
                <EmptyState
                  size="small"
                  color="indigo"
                  title="No invoices in this period"
                  description="Change the date range, or clear the status filter."
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  ),
};
