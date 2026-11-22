"use client";

import { Pagination } from "antd";
import styled from "styled-components";
import { formatCount } from "@/lib/format";
import { s } from "@/styles/scale";

// "Showing 1–20 of 12,480" + page buttons (template .pg). Backend pages are 0-based; this takes 0-based too.

type PagerProps = {
  page: number;
  size: number;
  totalItems: number;
  onChange: (page: number) => void;
};

export default function Pager({ page, size, totalItems, onChange }: PagerProps) {
  if (totalItems === 0) return null;
  const from = page * size + 1;
  const to = Math.min(totalItems, (page + 1) * size);

  return (
    <Bar aria-label="Pages">
      <Showing>
        Showing {formatCount(from)}–{formatCount(to)} of {formatCount(totalItems)}
      </Showing>
      {totalItems > size && (
        <Pagination
          current={page + 1}
          pageSize={size}
          total={totalItems}
          showSizeChanger={false}
          onChange={(p) => onChange(p - 1)}
        />
      )}
    </Bar>
  );
}

const Bar = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${s(12)};

  && .ant-pagination-item,
  && .ant-pagination-prev,
  && .ant-pagination-next {
    min-width: ${s(32)};
    height: ${s(32)};
    line-height: ${s(30)};
    border-radius: ${s(8)};
    border: 1px solid var(--line);
    font-weight: 600;
  }

  && .ant-pagination-item-active {
    background: var(--nav-active);
    border-color: var(--line);
  }

  && .ant-pagination-item-active a {
    color: var(--ink);
  }
`;

const Showing = styled.span`
  font-size: ${s(14)};
  color: var(--muted);
`;
