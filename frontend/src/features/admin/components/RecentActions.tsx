"use client";

import { Button, Skeleton } from "antd";
import styled from "styled-components";
import Panel, { PanelRow } from "@/components/ui/Panel";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { s } from "@/styles/scale";
import { useAuditLogQuery } from "../api/adminApi";
import { describeAudit } from "../utils/auditAction";

const RECENT = 5;

/** Last few admin writes (template "Recent admin actions"). */
export default function RecentActions() {
  const { data, isLoading, isError, refetch } = useAuditLogQuery({ page: 0, size: RECENT });

  return (
    <Panel title="Recent admin actions" link={{ href: "/admin/audit-log", label: "Full audit log" }}>
      {isLoading ? (
        <PanelRow aria-busy="true">
          <Skeleton active title={false} paragraph={{ rows: 3 }} />
        </PanelRow>
      ) : isError ? (
        <PanelRow role="alert">
          <Muted>Couldn&apos;t load recent actions.</Muted>
          <Button size="small" onClick={refetch}>
            Try again
          </Button>
        </PanelRow>
      ) : !data?.items.length ? (
        <PanelRow>
          <Muted>No admin actions yet.</Muted>
        </PanelRow>
      ) : (
        <Scroll>
          <DataTable>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Admin</th>
                <th scope="col">Action</th>
                {/* Backend stores only the target's id (no name) — gap. */}
                <th scope="col">Target</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((entry) => {
                const { label, tone } = describeAudit(entry);
                return (
                  <tr key={entry.id}>
                    <Mono as="td">{formatDateTime(entry.createdAt)}</Mono>
                    <td>{entry.adminEmail ?? <Muted as="span">Deleted admin</Muted>}</td>
                    <td>
                      <StatusBadge tone={tone}>{label}</StatusBadge>
                    </td>
                    <Mono as="td" title={entry.targetId ?? undefined}>
                      {entry.targetId ? `#${entry.targetId.slice(0, 8)}` : "—"}
                    </Mono>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </Scroll>
      )}
    </Panel>
  );
}

const Scroll = styled.div`
  overflow-x: auto;
  border-top: 1px solid var(--line);
`;

const Mono = styled.span`
  font-family: var(--font-mono);
  white-space: nowrap;
`;

const Muted = styled.p`
  flex: 1;
  margin: 0;
  font-size: ${s(14)};
  color: var(--muted);
`;
