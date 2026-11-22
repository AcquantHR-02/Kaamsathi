"use client";

import { Button, Skeleton } from "antd";
import { CircleCheck, Wallet } from "lucide-react";
import styled from "styled-components";
import Panel, { PanelRow } from "@/components/ui/Panel";
import { usePendingCompaniesQuery } from "@/features/company";
import { usePendingPaymentsQuery } from "@/features/payment";
import { daysLabel, formatRupees } from "@/lib/format";
import { s } from "@/styles/scale";

// The two queues on the admin home: oldest first, top 3; full lists live on their own pages.

const PREVIEW = 3;
const COMPANIES = "/admin/companies";
const PAYMENTS = "/admin/payments";

export function CompanyQueue() {
  const { data, isLoading, isError, refetch } = usePendingCompaniesQuery();

  return (
    <Panel title="Companies to verify" link={{ href: COMPANIES, label: "Open queue" }}>
      <QueueBody isLoading={isLoading} isError={isError} onRetry={refetch} empty={data?.length === 0}>
        {data?.slice(0, PREVIEW).map((company) => (
          <PanelRow key={company.id}>
            <Logo aria-hidden>{initials(company.name)}</Logo>
            <Text>
              <Name>{company.name}</Name>
              <Meta>
                {[company.industry, company.location, `waiting ${daysLabel(company.createdAt)}`]
                  .filter(Boolean)
                  .join(" · ")}
              </Meta>
            </Text>
            <Button size="small" href={COMPANIES} aria-label={`Review ${company.name}`}>
              Review
            </Button>
          </PanelRow>
        ))}
      </QueueBody>
    </Panel>
  );
}

export function PaymentQueue() {
  const { data, isLoading, isError, refetch } = usePendingPaymentsQuery();

  return (
    <Panel title="Payments to approve" link={{ href: PAYMENTS, label: "Open queue" }}>
      <QueueBody isLoading={isLoading} isError={isError} onRetry={refetch} empty={data?.length === 0}>
        {data?.slice(0, PREVIEW).map((payment) => (
          <PanelRow key={payment.id}>
            {/* No company name in the payment DTO (backend gap) → plan icon instead of company initials. */}
            <Logo aria-hidden>
              <Wallet size={18} />
            </Logo>
            <Text>
              <Name>{payment.plan.name} plan</Name>
              <Meta>
                {formatRupees(payment.amountRupees)} · <Mono>UPI {payment.transactionId}</Mono> · waiting{" "}
                {daysLabel(payment.createdAt)}
              </Meta>
            </Text>
            <Button size="small" href={PAYMENTS} aria-label={`Review ${payment.plan.name} payment`}>
              Review
            </Button>
          </PanelRow>
        ))}
      </QueueBody>
    </Panel>
  );
}

type QueueBodyProps = {
  isLoading: boolean;
  isError: boolean;
  empty: boolean;
  onRetry: () => void;
  children: React.ReactNode;
};

function QueueBody({ isLoading, isError, empty, onRetry, children }: QueueBodyProps) {
  if (isLoading) {
    return (
      <PanelRow aria-busy="true">
        <Skeleton active avatar={{ shape: "square" }} title={false} paragraph={{ rows: 2 }} />
      </PanelRow>
    );
  }
  if (isError) {
    return (
      <PanelRow role="alert">
        <Meta>Couldn&apos;t load this list.</Meta>
        <Button size="small" onClick={onRetry}>
          Try again
        </Button>
      </PanelRow>
    );
  }
  if (empty) {
    return (
      <PanelRow>
        <Done aria-hidden>
          <CircleCheck size={18} />
        </Done>
        <Meta>All clear — nothing waiting.</Meta>
      </PanelRow>
    );
  }
  return children;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const Logo = styled.span`
  flex: none;
  width: ${s(40)};
  height: ${s(40)};
  border-radius: ${s(8)};
  display: grid;
  place-items: center;
  font-size: ${s(13)};
  font-weight: 700;
  color: var(--ink);
  background: var(--brand-icon-bg);
  border: 1px solid var(--line);
`;

const Done = styled.span`
  display: grid;
  color: var(--ok);
`;

const Text = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.div`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  flex: 1;
  font-size: ${s(14)};
  line-height: ${s(20)};
  color: var(--muted);
`;

const Mono = styled.span`
  font-family: var(--font-mono);
`;
