"use client";

import styled from "styled-components";
import { s } from "@/styles/scale";

// Plain semantic table in the template look (.tbl): sunken caps header, row lines, soft row hover.
// Rule (user): first column left, the rest centered — row actions use justify-content: center.
// Wrap in <TableScroll> so wide tables scroll sideways on phones instead of the page.

/** Row height that makes a 10-row page fill the screen: (viewport − header/toolbar/pager ≈ 262 scaled px) / 10,
 *  never shorter than a small button + padding, never taller than 56px. Shared with grid "tables" (MasterList). */
export const FIT_ROW_HEIGHT = `clamp(calc(28px + 2 * ${s(5)}), calc((100dvh - ${s(262)}) / 10), ${s(56)})`;

export const TableScroll = styled.div`
  overflow-x: auto;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${s(14)};
  line-height: ${s(20)};

  th {
    text-align: left;
    padding: ${s(6)} ${s(16)};
    background: var(--sunken);
    color: var(--muted);
    font-size: ${s(12)};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
  }

  td {
    /* Acts as a minimum: rows without buttons stay as tall as rows with them (compact 48px rows). */
    height: ${FIT_ROW_HEIGHT};
    padding: ${s(5)} ${s(16)};
    border-bottom: 1px solid var(--line);
    vertical-align: middle;
  }

  /* First column (name / email) reads left; short values (badges, dates, numbers, actions) are centered. */
  th:not(:first-child),
  td:not(:first-child) {
    text-align: center;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr {
    transition: background var(--motion-fast) var(--motion-ease);
  }

  tbody tr:hover {
    background: var(--glass2);
  }
`;

export default DataTable;
