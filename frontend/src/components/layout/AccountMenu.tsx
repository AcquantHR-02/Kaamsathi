"use client";

import { Dropdown, type DropdownProps } from "antd";
import { LogOut } from "lucide-react";
import styled from "styled-components";
import { ROLE_LABEL } from "@/config/navigation";
import { useAuth } from "@/features/auth";
import { s } from "@/styles/scale";
import type { CurrentUser } from "@/types";

// Click the avatar → who is signed in + Sign out. Shared by the sidebar and the seeker top bar.

type AccountMenuProps = {
  user: CurrentUser;
  placement?: DropdownProps["placement"];
  /** The trigger; must be one focusable element (a button). */
  children: React.ReactElement;
};

export default function AccountMenu({ user, placement = "bottomRight", children }: AccountMenuProps) {
  const { logout } = useAuth();
  return (
    <Dropdown
      trigger={["click"]}
      placement={placement}
      menu={{
        items: [
          {
            key: "who",
            disabled: true,
            label: (
              <Who>
                <Email title={user.email}>{user.email}</Email>
                <Role>{ROLE_LABEL[user.role]}</Role>
              </Who>
            ),
          },
          { type: "divider" },
          { key: "logout", icon: <LogOut size={16} />, label: "Sign out", onClick: logout },
        ],
      }}
    >
      {children}
    </Dropdown>
  );
}

/** Initials until photos are wired (protected image → blob URL, later). */
export const Avatar = styled.span`
  flex: none;
  width: ${s(36)};
  height: ${s(36)};
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: ${s(13)};
  font-weight: 700;
  background: var(--vt);
  color: var(--ink);
`;

export const initials = (user: CurrentUser) => user.email.slice(0, 2).toUpperCase();

export const Email = styled.span`
  display: block;
  min-width: 0;
  font-size: ${s(14)};
  font-weight: 600;
  line-height: ${s(20)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Who = styled.div`
  max-width: ${s(220)};
  color: var(--ink);
`;

const Role = styled.div`
  font-size: ${s(13)};
  line-height: ${s(18)};
  color: var(--muted);
`;
