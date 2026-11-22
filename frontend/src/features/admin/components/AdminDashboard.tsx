"use client";

import { Skeleton } from "antd";
import styled from "styled-components";
import PageHeader from "@/components/layout/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import StatTile from "@/components/ui/StatTile";
import { formatCount, formatRupees } from "@/lib/format";
import { s } from "@/styles/scale";
import { useDashboardQuery } from "../api/adminApi";
import { CompanyQueue, PaymentQueue } from "./ReviewQueues";
import RecentActions from "./RecentActions";

/** Admin home (template 11-admin/AdminDashboard): numbers, the two review queues, recent admin actions. */
export default function AdminDashboard() {
  return (
    <Page>
      <PageHeader title="Overview" subtitle="Everything that needs a human decision is on this page." />
      <Stats />
      <Queues>
        <CompanyQueue />
        <PaymentQueue />
      </Queues>
      <RecentActions />
    </Page>
  );
}

function Stats() {
  const { data, error, isLoading, refetch } = useDashboardQuery();

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !data) {
    return (
      <Tiles aria-busy="true" aria-label="Loading numbers">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton.Node key={i} active style={{ width: "100%", height: 116, borderRadius: 16 }} />
        ))}
      </Tiles>
    );
  }

  const { users, companies, jobs, applications, payments } = data;
  // Admins excluded: "Users" means people using the portal.
  const totalUsers = users.seekers + users.companyOwners + users.recruiters;

  return (
    <Tiles>
      <StatTile label="Users" value={totalUsers} hint={`${formatCount(users.suspended)} suspended`} />
      <StatTile
        label="Verified companies"
        value={companies.verified}
        hint={companies.pending ? `${formatCount(companies.pending)} waiting` : "None waiting"}
      />
      <StatTile label="Active jobs" value={jobs.live} hint="Live in search" />
      <StatTile
        label="Applications"
        value={applications.total}
        hint={`${formatCount(applications.last30Days)} in last 30 days`}
      />
      <StatTile
        label="Approved payments"
        value={payments.approved}
        hint={`${formatRupees(payments.approvedRupees)} · ${
          payments.pendingApproval ? `${formatCount(payments.pendingApproval)} waiting` : "none waiting"
        }`}
      />
    </Tiles>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${s(16)};
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${s(190)}, 1fr));
  gap: ${s(16)};

  .ant-skeleton-node,
  .ant-skeleton-node > * {
    width: 100% !important;
  }
`;

const Queues = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${s(420)}), 1fr));
  gap: ${s(16)};
`;
