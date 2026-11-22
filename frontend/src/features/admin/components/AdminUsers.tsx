"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Drawer, Input, Skeleton } from "antd";
import { Search, UserPlus } from "lucide-react";
import styled from "styled-components";
import PageHeader from "@/components/layout/PageHeader";
import DataTable, { TableScroll } from "@/components/ui/DataTable";
import ErrorState from "@/components/ui/ErrorState";
import HoverSelect from "@/components/ui/HoverSelect";
import Pager from "@/components/ui/Pager";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuth } from "@/features/auth";
import { formatDate } from "@/lib/format";
import { s } from "@/styles/scale";
import { useAdminsQuery, useUsersQuery } from "../api/adminApi";
import type { AdminUser } from "../types/admin.types";
import { isRole, isUserStatus, USER_ROLE_LABEL, USER_STATUS } from "../utils/userLabels";
import AdminsPanel from "./AdminsPanel";
import UserDetailDrawer from "./UserDetailDrawer";
import UserActions from "./UserActions";

const PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 300;

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  ...Object.entries(USER_ROLE_LABEL).map(([value, label]) => ({ value, label })),
];
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(USER_STATUS).map(([value, { label }]) => ({ value, label })),
];

/** Admin users (template 02-users/AdminUsers). Filters + page live in the URL. */
export default function AdminUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { user: me } = useAuth();
  // Snapshot of the clicked row; the live row (after suspend etc.) wins while it's still on the page.
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const q = params.get("q") ?? "";
  const roleParam = params.get("role");
  const statusParam = params.get("status");
  const role = isRole(roleParam) ? roleParam : undefined;
  const status = isUserStatus(statusParam) ? statusParam : undefined;
  const page = Math.max(0, Number(params.get("page")) || 0);

  const { data, currentData, error, isLoading, isFetching, refetch } = useUsersQuery({
    q: q || undefined,
    role,
    status,
    page,
    size: PAGE_SIZE,
  });
  const { data: admins } = useAdminsQuery();
  // Backend flag (not list order) says who the main admin is.
  const isMainAdmin = !!me && !!admins?.some((a) => a.id === me.id && a.mainAdmin);

  /** Any filter change goes back to page 1; empty values leave the URL clean. */
  const update = (changes: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries({ page: undefined, ...changes })) {
      if (value === undefined || value === "" || value === 0) next.delete(key);
      else next.set(key, String(value));
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Typing is local; the URL (and the request) follows after a short pause.
  const [search, setSearch] = useState(q);
  useEffect(() => {
    if (search.trim() === q) return;
    const timer = setTimeout(() => update({ q: search.trim() }), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text should restart the timer
  }, [search]);

  const lockedReason = (target: AdminUser) => {
    if (target.id === me?.id) return "—"; // own row: marked ME next to the email, nothing to do here
    if (target.mainAdmin) return "Main admin";
    if (target.role === "ADMIN" && !isMainAdmin) return "Main admin only";
    return undefined;
  };

  const filtered = !!(q || role || status);
  const [adminsOpen, setAdminsOpen] = useState(false);

  const rows = data?.items;
  const totalItems = data?.totalItems ?? 0;

  const openDetail = (u: AdminUser) => {
    setSelected(u);
    setDrawerOpen(true);
  };
  const liveRow = selected ? data?.items.find((u) => u.id === selected.id) : undefined;
  const detailUser = liveRow ?? selected;
  // Deleted from the drawer → it leaves the list → close.
  const detailGone = !!selected && !!data && !isFetching && !liveRow;

  return (
    <Page>
      <PageHeader
        title="Users"
        subtitle="Search, suspend or remove accounts. Suspending signs the person out at once."
        actions={
          <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setAdminsOpen(true)}>
            Add admin
          </Button>
        }
      />

      <Filters>
        <Input
          allowClear
          prefix={<Search size={16} aria-hidden />}
          placeholder="Search by email"
          aria-label="Search by email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <HoverSelect
          aria-label="Role"
          value={role ?? ""}
          options={ROLE_OPTIONS}
          onChange={(value) => update({ role: value })}
        />
        <HoverSelect
          aria-label="Status"
          value={status ?? ""}
          options={STATUS_OPTIONS}
          onChange={(value) => update({ status: value })}
        />
      </Filters>

      <Card>
        {error ? (
          <Pad>
            <ErrorState error={error} onRetry={refetch} />
          </Pad>
        ) : (
          <TableScroll>
            {/* Old page stays visible (dimmed) while the next one loads: no jump to skeletons. */}
            <Table aria-label="Users" aria-busy={isFetching} $stale={isFetching && !currentData}>
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={5}>
                        <Skeleton.Input active size="small" block />
                      </td>
                    </tr>
                  ))
                ) : !rows?.length ? (
                  <tr>
                    <EmptyCell colSpan={5}>
                      {filtered ? "No users match these filters." : "No users yet."}
                      {filtered && (
                        <Button
                          type="link"
                          onClick={() => {
                            setSearch("");
                            update({ q: undefined, role: undefined, status: undefined });
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </EmptyCell>
                  </tr>
                ) : (
                  rows.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <EmailCell>
                          <Email type="button" onClick={() => openDetail(u)}>
                            {u.email}
                          </Email>
                          {u.id === me?.id && <Me>Me</Me>}
                        </EmailCell>
                        {u.company && <Company>{u.company.name}</Company>}
                      </td>
                      <td>
                        <StatusBadge tone={u.role === "ADMIN" ? "info" : "role"}>{USER_ROLE_LABEL[u.role]}</StatusBadge>
                      </td>
                      <td>
                        <StatusBadge tone={USER_STATUS[u.status].tone}>{USER_STATUS[u.status].label}</StatusBadge>
                      </td>
                      <Mono>{formatDate(u.createdAt)}</Mono>
                      <td>
                        <UserActions user={u} lockedReason={lockedReason(u)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableScroll>
        )}
        {!error && data && totalItems > 0 && (
          <Footer>
            <Pager page={data.page} size={data.size} totalItems={totalItems} onChange={(p) => update({ page: p })} />
          </Footer>
        )}
      </Card>

      <Drawer
        open={adminsOpen}
        onClose={() => setAdminsOpen(false)}
        title="Add an admin"
        placement="right"
        size={420}
        destroyOnHidden
      >
        <AdminsPanel admins={admins?.filter((a) => a.id !== me?.id)} isMainAdmin={isMainAdmin} />
      </Drawer>
      <UserDetailDrawer
        user={detailUser}
        open={drawerOpen && !detailGone}
        lockedReason={detailUser ? lockedReason(detailUser) : undefined}
        onClose={() => setDrawerOpen(false)}
      />
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${s(16)};
`;

const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(${s(200)}, 2fr) minmax(${s(150)}, 1fr) minmax(${s(150)}, 1fr);
  gap: ${s(12)};

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;

    > :first-child {
      grid-column: 1 / -1;
    }
  }
`;

const Card = styled.section`
  min-width: 0;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: ${s(16)};
`;

const Footer = styled.div`
  padding: ${s(6)} ${s(16)};
  border-top: 1px solid var(--line);
`;

const Pad = styled.div`
  padding: ${s(16)};
`;

const Table = styled(DataTable)<{ $stale: boolean }>`
  opacity: ${({ $stale }) => ($stale ? 0.55 : 1)};
  transition: opacity var(--motion-fast) var(--motion-ease);

  td {
    white-space: nowrap;
  }
`;

/* Email opens the detail drawer: a real button (keyboard + screen reader), styled as text. */
const Company = styled.div`
  font-size: ${s(12)};
  line-height: ${s(16)};
  color: var(--muted);
`;

const EmailCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${s(8)};
`;

/* Small tag on the signed-in admin's own row. */
const Me = styled.span`
  padding: 0 ${s(8)};
  border-radius: 999px;
  font-size: ${s(11)};
  line-height: ${s(18)};
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--nav-active);
  border: 1px solid var(--line);
`;

const Email = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
  transition: text-decoration-color var(--motion-fast) var(--motion-ease);

  &:hover {
    text-decoration-color: currentColor;
  }

  &:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Mono = styled.td`
  font-family: var(--font-mono);
`;

const EmptyCell = styled.td`
  && {
    padding: ${s(32)} ${s(16)};
    text-align: center;
    color: var(--muted);
  }
`;
