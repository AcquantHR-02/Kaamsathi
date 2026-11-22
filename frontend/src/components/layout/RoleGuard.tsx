"use client";

import { useEffect } from "react";
import { Skeleton } from "antd";
import styled from "styled-components";
import { ROLE_HOME, ROUTES } from "@/config/constants";
import { useAuth } from "@/features/auth";
import type { CurrentUser, Role } from "@/types";

// The real check behind proxy.ts: waits for /me, then renders only for the allowed roles.
// Redirects are full loads (like sign-in / sign-out), so the next area starts clean.

type RoleGuardProps = {
  roles: Role[];
  children: (user: CurrentUser) => React.ReactNode;
};

export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user, isReady } = useAuth();
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!isReady || allowed) return;
    if (!user) {
      const next = window.location.pathname + window.location.search;
      window.location.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(next)}`);
    } else {
      window.location.replace(ROLE_HOME[user.role]);
    }
  }, [isReady, allowed, user]);

  if (!allowed) {
    return (
      <Waiting aria-busy="true" aria-label="Loading">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Waiting>
    );
  }
  return children(user);
}

const Waiting = styled.div`
  min-height: 100dvh;
  padding: 40px;
  background: var(--bg);
`;
