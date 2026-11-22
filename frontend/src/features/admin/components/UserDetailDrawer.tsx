"use client";

import { Avatar, Button, Drawer, Skeleton, Typography } from "antd";
import styled from "styled-components";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDateTime, formatDateTimeYear } from "@/lib/format";
import { s } from "@/styles/scale";
import { useAuditLogQuery } from "../api/adminApi";
import type { AdminUser } from "../types/admin.types";
import { describeAudit } from "../utils/auditAction";
import { USER_ROLE_LABEL, USER_STATUS } from "../utils/userLabels";
import UserActions from "./UserActions";

// Slim user detail (template 02-users/AdminUserDetail). No GET /admin/users/{id} exists yet, so it shows
// the list row + photo + admin actions on this account (audit log by targetId). Security / activity
// sections wait for the backend (BACKEND_REQUESTS.md #1).

type UserDetailDrawerProps = {
  /** null = closed. Kept by the parent while closing so content doesn't vanish mid-slide. */
  user: AdminUser | null;
  open: boolean;
  lockedReason?: string;
  onClose: () => void;
};

const HISTORY_SIZE = 10;

export default function UserDetailDrawer({ user, open, lockedReason, onClose }: UserDetailDrawerProps) {
  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title="User details"
        placement="right"
        size={480}
        destroyOnHidden
        rootClassName="ks-user-drawer"
      >
        {user && <Details user={user} lockedReason={lockedReason} />}
      </Drawer>
    </>
  );
}

function Details({ user, lockedReason }: { user: AdminUser; lockedReason?: string }) {
  const status = USER_STATUS[user.status];

  return (
    <Body>
      <Hero>
        <Avatar
          size={56}
          // Same-origin BFF route streams the image with the session cookie: no blob URL needed.
          src={user.photoFileId ? `/api/users/${user.id}/photo` : undefined}
          alt=""
        >
          {user.email.slice(0, 2).toUpperCase()}
        </Avatar>
        <div>
          <Email>{user.email}</Email>
          <Badges>
            <StatusBadge tone={user.role === "ADMIN" ? "info" : "role"}>{USER_ROLE_LABEL[user.role]}</StatusBadge>
            <StatusBadge tone={status.tone}>● {status.label}</StatusBadge>
            {user.status !== "UNVERIFIED" && <StatusBadge tone="ok">✓ Email verified</StatusBadge>}
          </Badges>
        </div>
      </Hero>

      <UserActions user={user} lockedReason={lockedReason} />

      <Section aria-labelledby="ud-account">
        <H3 id="ud-account">Account</H3>
        <Kv>
          <dt>User ID</dt>
          <dd>
            <Typography.Text copyable={{ text: user.id, tooltips: ["Copy ID", "Copied"] }} className="mono">
              {user.id}
            </Typography.Text>
          </dd>
          <dt>Role</dt>
          <dd>{USER_ROLE_LABEL[user.role]}</dd>
          <dt>Joined</dt>
          <dd>{formatDateTimeYear(user.createdAt)}</dd>
          <dt>Email</dt>
          <dd>{user.status === "UNVERIFIED" ? "Not verified yet (OTP not entered)" : "Verified"}</dd>
          <dt>Profile photo</dt>
          <dd>{user.photoFileId ? "Uploaded" : "None"}</dd>
        </Kv>
      </Section>

      <History userId={user.id} />
    </Body>
  );
}

/** Admin actions taken on this account, newest first. */
function History({ userId }: { userId: string }) {
  const { data, isLoading, isError, refetch } = useAuditLogQuery({ targetId: userId, page: 0, size: HISTORY_SIZE });

  return (
    <Section aria-labelledby="ud-history">
      <H3 id="ud-history">Admin actions on this account</H3>
      {isLoading ? (
        <Skeleton active title={false} paragraph={{ rows: 3 }} />
      ) : isError ? (
        <Muted role="alert">
          Couldn&apos;t load the history.{" "}
          <Button size="small" type="link" onClick={refetch}>
            Try again
          </Button>
        </Muted>
      ) : !data?.items.length ? (
        <Muted>No admin actions on this account yet.</Muted>
      ) : (
        <Events>
          {data.items.map((entry) => {
            const { label, tone } = describeAudit(entry);
            return (
              <li key={entry.id}>
                <Time>{formatDateTime(entry.createdAt)}</Time>
                <StatusBadge tone={tone}>{label}</StatusBadge>
                <Muted as="span">by {entry.adminEmail ?? "a deleted admin"}</Muted>
              </li>
            );
          })}
        </Events>
      )}
    </Section>
  );
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${s(24)};
`;

const Hero = styled.div`
  display: flex;
  align-items: center;
  gap: ${s(16)};
  min-width: 0;

  .ant-avatar {
    flex: none;
    font-weight: 700;
    color: var(--ink);
    background: var(--brand-icon-bg);
    border: 1px solid var(--line);
  }

  > div {
    min-width: 0;
  }
`;

const Email = styled.h2`
  margin: 0 0 ${s(8)};
  font-size: ${s(18)};
  line-height: ${s(26)};
  font-weight: 700;
  overflow-wrap: anywhere;
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${s(6)};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${s(12)};
  padding-top: ${s(20)};
  border-top: 1px solid var(--line);
`;

const H3 = styled.h3`
  margin: 0;
  font-size: ${s(15)};
  line-height: ${s(22)};
  font-weight: 700;
`;

const Kv = styled.dl`
  display: grid;
  grid-template-columns: ${s(120)} minmax(0, 1fr);
  gap: ${s(10)} ${s(12)};
  margin: 0;
  font-size: ${s(14)};
  line-height: ${s(20)};

  dt {
    color: var(--muted);
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .mono {
    font-family: var(--font-mono);
    font-size: ${s(12)};
  }
`;

const Events = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${s(10)};

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${s(8)};
  }
`;

const Time = styled.span`
  font-family: var(--font-mono);
  font-size: ${s(13)};
  color: var(--muted);
  min-width: ${s(96)};
`;

const Muted = styled.p`
  margin: 0;
  font-size: ${s(14)};
  color: var(--muted);
`;
