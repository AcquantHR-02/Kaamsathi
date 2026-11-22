"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Drawer, Tooltip } from "antd";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import styled from "styled-components";
import { s } from "@/styles/scale";
import BrandMark from "@/components/ui/BrandMark";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { NavItem } from "@/config/navigation";
import AccountMenu, { Avatar, Email, initials } from "./AccountMenu";
import type { CurrentUser } from "@/types";

// Employer + admin shell (templates 03-company/EmployerDashboard, 11-admin/AdminDashboard):
// sidebar with logo, nav and the signed-in user. Below 1024px: top bar + the same sidebar in a drawer.

type SidebarShellProps = {
  /** Accessible name of the nav ("Employer", "Admin"). */
  label: string;
  items: NavItem[];
  user: CurrentUser;
  children: React.ReactNode;
};

const COLLAPSED_KEY = "kaamsathi.sidebarCollapsed";

// Safe to read during the first render: RoleGuard shows a skeleton on the server, so this shell
// only ever renders in the browser (no hydration mismatch).
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function SidebarShell({ label, items, user, children }: SidebarShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const visible = items.filter((item) => !item.roles || item.roles.includes(user.role));
  const closeDrawer = () => setDrawerOpen(false);

  const toggleCollapsed = () => {
    setCollapsed((was) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, was ? "0" : "1");
      } catch {
        // Private mode / blocked storage: the choice just isn't remembered.
      }
      return !was;
    });
  };

  return (
    <Layout>
      <Aside $collapsed={collapsed}>
        <SidebarBody
          label={label}
          items={visible}
          user={user}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          onNavigate={closeDrawer}
        />
      </Aside>

      <MobileBar>
        <Button type="text" aria-label="Open menu" icon={<Menu size={20} />} onClick={() => setDrawerOpen(true)} />
        <Link href={visible[0].href} aria-label="Dashboard">
          <BrandMark />
        </Link>
        <ThemeToggle />
      </MobileBar>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        size={280}
        closable={false}
        styles={{ body: { padding: 0, background: "var(--sunken)" } }}
      >
        <SidebarBody label={label} items={visible} user={user} collapsed={false} onNavigate={closeDrawer} />
      </Drawer>

      <Main>
        <Corner>
          <ThemeToggle />
        </Corner>
        {children}
      </Main>
    </Layout>
  );
}

type SidebarBodyProps = {
  label: string;
  items: NavItem[];
  user: CurrentUser;
  /** Icons only; names show as tooltips. */
  collapsed: boolean;
  /** Desktop only (the mobile drawer is always full width). */
  onToggleCollapsed?: () => void;
  onNavigate: () => void;
};

function SidebarBody({ label, items, user, collapsed, onToggleCollapsed, onNavigate }: SidebarBodyProps) {
  const pathname = usePathname();
  const home = items[0].href;
  // Home matches exactly; other links also stay active on their sub-pages (/employer/jobs/123).
  const isActive = (href: string) => (href === home ? pathname === href : pathname.startsWith(href));
  // Tooltips only matter when the names are hidden.
  const tip = (title: string) => (collapsed ? title : undefined);

  return (
    <SideInner $collapsed={collapsed}>
      {collapsed && onToggleCollapsed ? (
        // ChatGPT-style: the logo mark is the expand button; hovering swaps it for the panel icon.
        <Tooltip title="Expand sidebar" placement="right">
          <ExpandButton type="button" aria-label="Expand sidebar" aria-expanded={false} onClick={onToggleCollapsed}>
            <span className="mark">
              <BrandMark size="sm" showName={false} />
            </span>
            <PanelLeftOpen className="open" size={20} aria-hidden />
          </ExpandButton>
        </Tooltip>
      ) : (
        <Header>
          <Link href={home} aria-label="Dashboard" onClick={onNavigate}>
            <BrandMark size="sm" />
          </Link>
          {onToggleCollapsed && (
            <Tooltip title="Collapse sidebar" placement="right">
              <Button
                type="text"
                aria-label="Collapse sidebar"
                aria-expanded
                className="collapse"
                icon={<PanelLeftClose size={18} />}
                onClick={onToggleCollapsed}
              />
            </Tooltip>
          )}
        </Header>
      )}

      <Nav aria-label={label}>
        {items.map(({ label: text, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Tooltip key={href} title={tip(text)} placement="right">
              <NavLink
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? text : undefined}
                $active={active}
                $collapsed={collapsed}
                onClick={onNavigate}
              >
                <Icon size={18} aria-hidden />
                {!collapsed && text}
              </NavLink>
            </Tooltip>
          );
        })}
      </Nav>

      <UserBlock>
        <AccountMenu user={user} placement={collapsed ? "topLeft" : "top"}>
          <ProfileButton type="button" aria-label="Account menu" $collapsed={collapsed}>
            <Avatar aria-hidden>{initials(user)}</Avatar>
            {!collapsed && <Email>{user.email}</Email>}
          </ProfileButton>
        </AccountMenu>
      </UserBlock>
    </SideInner>
  );
}

const Layout = styled.div`
  min-height: 100dvh;
  display: flex;
  background: var(--bg);

  @media (max-width: 1023px) {
    flex-direction: column;
  }
`;

const Aside = styled.aside<{ $collapsed: boolean }>`
  /* Template says 248px; narrowed to 216px at the user's request. Collapsed = icon rail. */
  flex: 0 0 ${({ $collapsed }) => ($collapsed ? s(72) : s(216))};
  transition: flex-basis var(--motion-base) var(--motion-ease);
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow-y: auto;
  border-right: 1px solid var(--line);
  background: var(--sunken);

  @media (max-width: 1023px) {
    display: none;
  }
`;

const SideInner = styled.div<{ $collapsed: boolean }>`
  min-height: 100%;
  padding: ${s(20)} ${s(12)};
  display: flex;
  flex-direction: column;
  align-items: ${({ $collapsed }) => ($collapsed ? "center" : "stretch")};
  gap: ${s(20)};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${s(8)};
  height: ${s(44)};
  /* Logo lines up with the nav icons below. */
  padding-left: ${s(6)};
  margin-bottom: ${s(8)};

  /* Calm by default; the collapse icon shows when the sidebar is hovered or focused (like ChatGPT). */
  .collapse {
    color: var(--muted);
    opacity: 0;
    transition: opacity var(--motion-fast) var(--motion-ease);
  }

  aside:hover & .collapse,
  aside:focus-within & .collapse,
  .collapse:focus-visible {
    opacity: 1;
  }

  /* Touch screens have no hover: keep it visible. */
  @media (hover: none) {
    .collapse {
      opacity: 1;
    }
  }
`;

/** Collapsed rail: logo mark that turns into the "open sidebar" icon on hover / keyboard focus. */
const ExpandButton = styled.button`
  position: relative;
  width: ${s(44)};
  height: ${s(44)};
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: ${s(12)};
  background: transparent;
  color: var(--ink);
  cursor: pointer;

  .mark,
  .open {
    grid-area: 1 / 1;
    transition: opacity var(--motion-fast) var(--motion-ease);
  }

  .open {
    opacity: 0;
  }

  &:hover,
  &:focus-visible {
    background: var(--glass2);

    .mark {
      opacity: 0;
    }

    .open {
      opacity: 1;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${s(4)};
`;

const NavLink = styled(Link)<{ $active: boolean; $collapsed: boolean }>`
  && {
    display: flex;
    align-items: center;
    justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
    gap: ${s(12)};
    width: ${({ $collapsed }) => ($collapsed ? s(44) : "auto")};
    height: ${s(44)};
    padding: 0 ${({ $collapsed }) => ($collapsed ? 0 : s(12))};
    border-radius: ${s(12)};
    font-size: ${s(14)};
    font-weight: 600;
    text-decoration: none;
    position: relative;
    isolation: isolate;
    color: ${({ $active }) => ($active ? "var(--ink)" : "var(--muted)")};
    font-weight: ${({ $active }) => ($active ? 700 : 600)};
    transition: color var(--motion-fast) var(--motion-ease);
  }

  /* Two layers, because gradients can't transition (opacity can) and the edge bar must sit ON TOP
     of the gradient (an inset shadow on the link itself gets covered by it).
     ::before = gradient (hover 0.5 preview, selected full); ::after = pink edge bar. */
  &&::before,
  &&::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  &&::before {
    z-index: -1;
    background: var(--nav-active);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition:
      opacity var(--motion-base) var(--motion-ease),
      filter var(--motion-base) var(--motion-ease);
  }

  &&::after {
    /* 0px when idle (not "none") so the bar grows in instead of popping. */
    box-shadow: inset ${({ $active }) => ($active ? 3 : 0)}px 0 0 var(--nav-active-bar);
    transition: box-shadow var(--motion-fast) var(--motion-ease);
  }

  svg {
    flex: none;
    color: ${({ $active }) => ($active ? "var(--nav-active-bar)" : "currentColor")};
    transition:
      transform var(--motion-fast) var(--motion-ease),
      color var(--motion-fast) var(--motion-ease);
  }

  &&:hover {
    color: var(--ink);
  }

  &&:hover::before {
    opacity: ${({ $active }) => ($active ? 1 : 0.5)};
    /* Selected item is already at full strength: deepen it a little on hover. */
    filter: ${({ $active }) => ($active ? "saturate(1.4)" : "none")};
  }

  /* Hover shows a thinner bar than the selected item, so "selected" always reads stronger. */
  &&:hover::after {
    box-shadow: inset ${({ $active }) => ($active ? 4 : 2)}px 0 0 var(--nav-active-bar);
  }

  &:hover svg {
    transform: ${({ $collapsed }) => ($collapsed ? "scale(1.08)" : "translateX(2px)")};
  }

  &&:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover svg {
      transform: none;
    }
  }
`;

const UserBlock = styled.div`
  margin-top: auto;
  align-self: stretch;
  display: flex;
  justify-content: center;
  padding-top: ${s(12)};
  border-top: 1px solid var(--line);
`;

/** One button (avatar + email); its menu holds the role and Sign out. */
const ProfileButton = styled.button<{ $collapsed: boolean }>`
  flex: ${({ $collapsed }) => ($collapsed ? "none" : 1)};
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${s(10)};
  padding: ${({ $collapsed }) => ($collapsed ? s(4) : `${s(6)} ${s(8)}`)};
  border: 0;
  border-radius: ${s(12)};
  background: transparent;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background var(--motion-fast) var(--motion-ease);

  &:hover,
  &[aria-expanded="true"] {
    background: var(--glass2);
  }

  &:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
`;

const MobileBar = styled.header`
  display: none;

  @media (max-width: 1023px) {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${s(12)};
    height: ${s(60)};
    padding: 0 ${s(16)};
    border-bottom: 1px solid var(--line);
    background: var(--glass);
    backdrop-filter: blur(${s(14)});
  }
`;

const Main = styled.main`
  position: relative;
  flex: 1;
  min-width: 0;
  padding: ${s(20)} ${s(32)} ${s(24)};
  display: flex;
  flex-direction: column;
  gap: ${s(16)};

  @media (max-width: 1023px) {
    padding: ${s(16)} ${s(16)} ${s(32)};
  }
`;

const Corner = styled.div`
  position: absolute;
  top: ${s(24)};
  right: ${s(32)};

  @media (max-width: 1023px) {
    display: none;
  }
`;
