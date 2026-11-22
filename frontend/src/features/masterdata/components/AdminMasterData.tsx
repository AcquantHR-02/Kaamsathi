"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Drawer } from "antd";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import styled from "styled-components";
import PageHeader from "@/components/layout/PageHeader";
import { formatCount } from "@/lib/format";
import { s } from "@/styles/scale";
import { useAllMasterItemsQuery } from "../api/masterdataApi";
import type { MasterKind } from "../types/masterdata.types";
import { isMasterKind, MASTER_LISTS } from "../utils/lists";
import AddItemForm from "./AddItemForm";
import MasterList from "./MasterList";

/** Admin master data (template 06-masterdata/AdminMasterData--*): one tab per list; add opens a right drawer (compact layout). */
export default function AdminMasterData() {
  const router = useRouter();
  const pathname = usePathname();
  const listParam = useSearchParams().get("list");
  // Tab lives in the URL (?list=cities) so reload / back / shared links keep it.
  const kind: MasterKind = isMasterKind(listParam) ? listParam : "skills";
  const list = MASTER_LISTS.find((l) => l.kind === kind)!;

  const [adding, setAdding] = useState(false);

  const select = (next: MasterKind) =>
    router.replace(next === "skills" ? pathname : `${pathname}?list=${next}`, { scroll: false });

  return (
    <Page>
      <PageHeader
        title="Master data"
        subtitle="Lists that seekers and employers pick from. Hide an item instead of deleting it — old jobs and profiles keep it."
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setAdding(true)}>
            Add {list.singular}
          </Button>
        }
      />

      <MasterList
        key={kind}
        list={list}
        tabs={
          <Tabs role="group" aria-label="List">
            {MASTER_LISTS.map((l) => (
              <Tab key={l.kind} kind={l.kind} label={l.label} selected={l.kind === kind} onSelect={select} />
            ))}
          </Tabs>
        }
      />
      <Drawer
        open={adding}
        onClose={() => setAdding(false)}
        title={`Add a ${list.singular}`}
        placement="right"
        size={400}
        destroyOnHidden
        rootClassName="ks-md-drawer"
      >
        <AddItemForm key={kind} list={list} onDone={() => setAdding(false)} />
      </Drawer>
    </Page>
  );
}

type TabProps = { kind: MasterKind; label: string; selected: boolean; onSelect: (kind: MasterKind) => void };

/** Each tab loads its own list for the count; RTK Query shares the request with MasterList. */
function Tab({ kind, label, selected, onSelect }: TabProps) {
  const { data } = useAllMasterItemsQuery(kind);
  return (
    <TabButton type="button" aria-pressed={selected} $selected={selected} onClick={() => onSelect(kind)}>
      {selected && <Indicator layoutId="masterdata-tab" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
      <span>{label}</span>
      {data && <Count>{formatCount(data.length)}</Count>}
    </TabButton>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${s(16)};
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${s(4)};
  padding: ${s(4)};
  border-radius: ${s(12)};
  background: var(--sunken);
  border: 1px solid var(--line);
`;

const TabButton = styled.button<{ $selected: boolean }>`
  position: relative;
  isolation: isolate;
  height: ${s(36)};
  padding: 0 ${s(16)};
  display: inline-flex;
  align-items: center;
  gap: ${s(8)};
  border: 0;
  border-radius: ${s(8)};
  background: none;
  font: inherit;
  font-size: ${s(13)};
  font-weight: 600;
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? "var(--ink)" : "var(--muted)")};
  transition: color var(--motion-fast) var(--motion-ease);

  &:hover {
    color: var(--ink);
  }

  &:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
`;

const Indicator = styled(motion.span)`
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
`;

const Count = styled.span`
  min-width: ${s(22)};
  padding: 0 ${s(6)};
  border-radius: 999px;
  font-size: ${s(12)};
  line-height: ${s(20)};
  text-align: center;
  color: var(--muted);
  background: var(--neut);
  font-variant-numeric: tabular-nums;
`;
