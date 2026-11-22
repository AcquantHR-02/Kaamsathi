"use client";

import { useState } from "react";
import { App, Button, Input, Skeleton } from "antd";
import { Search } from "lucide-react";
import styled from "styled-components";
import { FIT_ROW_HEIGHT } from "@/components/ui/DataTable";
import ErrorState from "@/components/ui/ErrorState";
import Pager from "@/components/ui/Pager";
import StatusBadge from "@/components/ui/StatusBadge";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { usePagedList } from "@/lib/usePagedList";
import { s } from "@/styles/scale";
import {
  useAllMasterItemsQuery,
  useRenameMasterItemMutation,
  useSetMasterItemActiveMutation,
} from "../api/masterdataApi";
import type { MasterItem, MasterKind } from "../types/masterdata.types";
import { type MASTER_LISTS, sameName } from "../utils/lists";

type List = (typeof MASTER_LISTS)[number];

const PAGE_SIZE = 10;

type MasterListProps = {
  list: List;
  /** Tab switcher from the page, shown on the left of the toolbar row (compact layout). */
  tabs: React.ReactNode;
};

/** Toolbar (tabs + search) and the list with inline rename and Hide/Show (no confirm: both are undoable). */
export default function MasterList({ list, tabs }: MasterListProps) {
  const { data, error, isLoading, refetch } = useAllMasterItemsQuery(list.kind);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const isCity = list.kind === "cities";

  const q = query.trim().toLowerCase();
  const items = q ? data?.filter((i) => i.name.toLowerCase().includes(q) || i.state?.toLowerCase().includes(q)) : data;
  const pager = usePagedList(items, PAGE_SIZE);

  return (
    <>
      <Toolbar>
        {tabs}
        <Input
          allowClear
          prefix={<Search size={16} aria-hidden />}
          placeholder={`Search ${list.label.toLowerCase()}`}
          aria-label={`Search ${list.label.toLowerCase()}`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            pager.setPage(0);
          }}
        />
      </Toolbar>

      <Card>
        {error ? (
          <Pad>
            <ErrorState error={error} onRetry={refetch} />
          </Pad>
        ) : (
          <div role="table" aria-label={list.label} aria-busy={isLoading}>
            <Row role="row" $city={isCity} $head>
              <span role="columnheader">Name</span>
              {isCity && <span role="columnheader">State</span>}
              <span role="columnheader">Status</span>
              <span role="columnheader">Actions</span>
            </Row>

            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <Row role="row" key={i} $city={isCity}>
                  <Skeleton.Input active size="small" block />
                </Row>
              ))
            ) : !items?.length ? (
              <Empty role="row">
                <span role="cell">
                  {q
                    ? `No ${list.label.toLowerCase()} match “${query.trim()}”.`
                    : `No ${list.label.toLowerCase()} yet.`}
                </span>
              </Empty>
            ) : (
              pager.pageItems!.map((item) =>
                item.id === editingId ? (
                  <EditRow
                    key={item.id}
                    kind={list.kind}
                    item={item}
                    others={data!}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <ItemRow key={item.id} kind={list.kind} item={item} onRename={() => setEditingId(item.id)} />
                ),
              )
            )}
          </div>
        )}
        {!error && pager.totalItems > 0 && (
          <Footer>
            <Pager page={pager.page} size={pager.size} totalItems={pager.totalItems} onChange={pager.setPage} />
          </Footer>
        )}
      </Card>
    </>
  );
}

type ItemRowProps = { kind: MasterKind; item: MasterItem; onRename: () => void };

function ItemRow({ kind, item, onRename }: ItemRowProps) {
  const { message } = App.useApp();
  const [setActive, { isLoading }] = useSetMasterItemActiveMutation();
  const isCity = kind === "cities";

  const toggle = async () => {
    try {
      await setActive({ kind, id: item.id, active: !item.active }).unwrap();
      message.success(`“${item.name}” ${item.active ? "hidden" : "shown again"}`);
    } catch (err) {
      message.error(parseApiError(err, "Couldn't change it. Try again."));
    }
  };

  return (
    <Row role="row" $city={isCity} $hidden={!item.active}>
      <Name role="cell">{item.name}</Name>
      {isCity && <Muted role="cell">{item.state}</Muted>}
      <span role="cell">
        {item.active ? <StatusBadge tone="ok">● Active</StatusBadge> : <StatusBadge>— Hidden</StatusBadge>}
      </span>
      <Actions role="cell">
        <Button size="small" type="text" onClick={onRename} aria-label={`Rename ${item.name}`}>
          Rename
        </Button>
        <Button
          size="small"
          loading={isLoading}
          onClick={toggle}
          aria-label={`${item.active ? "Hide" : "Show"} ${item.name}`}
        >
          {item.active ? "Hide" : "Show"}
        </Button>
      </Actions>
    </Row>
  );
}

type EditRowProps = { kind: MasterKind; item: MasterItem; others: MasterItem[]; onDone: () => void };

/** Inline rename: Enter saves, Esc cancels. Duplicate check mirrors the backend before sending. */
function EditRow({ kind, item, others, onDone }: EditRowProps) {
  const { message } = App.useApp();
  const [rename, { isLoading }] = useRenameMasterItemMutation();
  const [name, setName] = useState(item.name);
  const [state, setState] = useState(item.state ?? "");
  const [serverError, setServerError] = useState<string | null>(null);
  const isCity = kind === "cities";

  const taken = others.some((o) => o.id !== item.id && sameName(o.name, name));
  const changed = name.trim() !== item.name || (isCity && state.trim() !== (item.state ?? ""));
  const valid = name.trim() !== "" && (!isCity || state.trim() !== "") && !taken;
  const error = taken ? "Already in the list (capital letters don't count)." : serverError;

  const save = async () => {
    if (!valid || !changed || isLoading) return;
    try {
      await rename({ kind, id: item.id, name: name.trim(), ...(isCity && { state: state.trim() }) }).unwrap();
      message.success(`Renamed to “${name.trim()}”`);
      onDone();
    } catch (err) {
      setServerError(
        getErrorCode(err) === "MASTERDATA_NAME_EXISTS"
          ? "Already in the list (capital letters don't count)."
          : parseApiError(err, "Couldn't rename it. Try again."),
      );
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void save();
    if (e.key === "Escape") onDone();
  };

  return (
    <Row role="row" $city={isCity} $editing>
      <Field role="cell">
        <Input
          autoFocus
          size="small"
          maxLength={100}
          value={name}
          status={error ? "error" : undefined}
          aria-label={`New name for ${item.name}`}
          aria-invalid={!!error}
          aria-describedby={error ? `rename-err-${item.id}` : undefined}
          onChange={(e) => {
            setName(e.target.value);
            setServerError(null);
          }}
          onKeyDown={onKeyDown}
        />
        {error && (
          <FieldError id={`rename-err-${item.id}`} role="alert">
            {error}
          </FieldError>
        )}
      </Field>
      {isCity && (
        <Field role="cell">
          <Input
            size="small"
            maxLength={100}
            value={state}
            aria-label={`State of ${item.name}`}
            onChange={(e) => setState(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </Field>
      )}
      <span role="cell" />
      <Actions role="cell">
        <Button size="small" type="text" onClick={onDone} disabled={isLoading}>
          Cancel
        </Button>
        <Button size="small" type="primary" onClick={save} loading={isLoading} disabled={!valid || !changed}>
          Save
        </Button>
      </Actions>
    </Row>
  );
}

const Card = styled.section`
  min-width: 0;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: ${s(16)};
`;

/* Tabs left, search right; search takes the full row on narrow screens. */
const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${s(12)};

  > .ant-input-affix-wrapper {
    flex: 0 1 ${s(320)};
    min-width: ${s(220)};
  }
`;

const Footer = styled.div`
  padding: ${s(6)} ${s(16)};
  border-top: 1px solid var(--line);
`;

const Pad = styled.div`
  padding: ${s(16)};
`;

const Row = styled.div<{ $city: boolean; $head?: boolean; $hidden?: boolean; $editing?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $city }) =>
    $city
      ? "minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.4fr)"
      : "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.4fr)"};
  gap: ${s(12)};
  align-items: ${({ $editing }) => ($editing ? "start" : "center")};
  min-height: ${({ $head }) => ($head ? "auto" : FIT_ROW_HEIGHT)};
  padding: ${s(5)} ${s(16)};
  border-bottom: 1px solid var(--line);
  font-size: ${({ $head }) => ($head ? s(12) : s(14))};
  line-height: ${s(20)};
  transition: background var(--motion-fast) var(--motion-ease);

  ${({ $head }) =>
    $head
      ? `background: var(--sunken); color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .04em;`
      : `&:hover { background: var(--glass2); }`}

  ${({ $editing }) => $editing && "background: var(--glass2);"}

  /* Hidden items read quieter, but stay fully usable (Show / Rename). */
  ${({ $hidden }) => $hidden && "color: var(--muted);"}

  &:last-child {
    border-bottom: 0;
  }

  /* Same rule as DataTable: first column left, the rest centered. */
  > :not(:first-child) {
    text-align: center;
    justify-content: center;
  }

  > .ant-skeleton {
    grid-column: 1 / -1;
  }
`;

const Name = styled.span`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Muted = styled.span`
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.span`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${s(6)};
`;

const Field = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${s(4)};
`;

const FieldError = styled.span`
  font-size: ${s(12)};
  line-height: ${s(16)};
  color: var(--bad);
`;

const Empty = styled.div`
  padding: ${s(32)} ${s(16)};
  text-align: center;
  font-size: ${s(14)};
  color: var(--muted);
`;
