import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "./Table";

describe("Table", () => {
  it("renders semantic table structure", () => {
    render(
      <TableContainer stickyHeader>
        <Table density="dense">
          <TableHead>
            <TableRow>
              <TableCell head>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover>
              <TableCell numeric>42</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>,
    );
    expect(screen.getByRole("table")).toHaveClass("okkly-table", "okkly-table--dense");
    expect(document.querySelector(".okkly-table-container")).toHaveClass(
      "okkly-table-container--sticky",
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveClass(
      "okkly-table__cell--head",
    );
    expect(screen.getByRole("cell", { name: "42" })).toHaveClass("okkly-table__cell--numeric");
    expect(document.querySelector(".okkly-table__row--hover")).toBeInTheDocument();
  });

  it("forwards ref on Table", () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });

  it("renders default table without density modifier", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector(".okkly-table")?.className).not.toMatch(/okkly-table--dense/);
  });
});
