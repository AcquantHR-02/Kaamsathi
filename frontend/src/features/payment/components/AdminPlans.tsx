"use client";

import { useState } from "react";
import { App, Button, Drawer, Skeleton } from "antd";
import { Plus } from "lucide-react";
import styled from "styled-components";
import PageHeader from "@/components/layout/PageHeader";
import DataTable, { TableScroll } from "@/components/ui/DataTable";
import ErrorState from "@/components/ui/ErrorState";
import Pager from "@/components/ui/Pager";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCount, formatRupees } from "@/lib/format";
import { parseApiError } from "@/lib/parseApiError";
import { usePagedList } from "@/lib/usePagedList";
import { s } from "@/styles/scale";
import { useAdminPlansQuery, useSetPlanActiveMutation } from "../api/paymentApi";
import type { Plan } from "../types/payment.types";
import PlanForm from "./PlanForm";

const PAGE_SIZE = 10;

type Panel = { open: boolean; plan: Plan | null };

/** Admin plans (template 08-payment/AdminPlans): full-width table; create / edit slide in from the right
 *  (user asked for a drawer instead of the template's side card, which squeezed the table). */
export default function AdminPlans() {
  const { data, error, isLoading, refetch } = useAdminPlansQuery();
  const pager = usePagedList(data, PAGE_SIZE);
  const [panel, setPanel] = useState<Panel>({ open: false, plan: null });
  // Bumped on every open so the form always starts fresh (also when reopening the same plan).
  const [formKey, setFormKey] = useState(0);

  const openPanel = (plan: Plan | null) => {
    setFormKey((k) => k + 1);
    setPanel({ open: true, plan });
  };
  // Keep `plan` while closing so the title doesn't flip during the slide-out.
  const closePanel = () => setPanel((p) => ({ ...p, open: false }));
  const title = panel.plan ? `Edit ${panel.plan.name}` : "Create a plan";

  return (
    <Page>
      <PageHeader
        title="Plans"
        subtitle="Companies see active plans, cheapest first. Editing a plan never changes subscriptions already bought."
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => openPanel(null)}>
            New plan
          </Button>
        }
      />

      <Card>
        {error ? (
          <Pad>
            <ErrorState error={error} onRetry={refetch} />
          </Pad>
        ) : (
          <TableScroll>
            <PlansTable aria-label="Plans" aria-busy={isLoading}>
              <thead>
                <tr>
                  <th scope="col">Plan</th>
                  <th scope="col">Price</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Job slots</th>
                  <th scope="col">Recruiter seats</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={7}>
                        <Skeleton.Input active size="small" block />
                      </td>
                    </tr>
                  ))
                ) : !data?.length ? (
                  <tr>
                    <EmptyCell colSpan={7}>No plans yet — create the first one.</EmptyCell>
                  </tr>
                ) : (
                  pager.pageItems!.map((plan) => (
                    <PlanRow
                      key={plan.id}
                      plan={plan}
                      isEditing={panel.open && panel.plan?.id === plan.id}
                      onEdit={() => openPanel(plan)}
                    />
                  ))
                )}
              </tbody>
            </PlansTable>
          </TableScroll>
        )}
        {!error && pager.totalItems > 0 && (
          <Footer>
            <Pager page={pager.page} size={pager.size} totalItems={pager.totalItems} onChange={pager.setPage} />
          </Footer>
        )}
        <Note>The free tier (5 lifetime posts, 1 recruiter) is built in and isn&apos;t a plan here.</Note>
      </Card>

      <Drawer
        open={panel.open}
        onClose={closePanel}
        title={title}
        placement="right"
        size={440}
        destroyOnHidden
        rootClassName="ks-plan-drawer"
      >
        <PlanForm key={formKey} title={title} plan={panel.plan} plans={data ?? []} onDone={closePanel} />
      </Drawer>
    </Page>
  );
}

type PlanRowProps = { plan: Plan; isEditing: boolean; onEdit: () => void };

/** Hide / Show without confirm: reversible, and bought subscriptions are untouched. */
function PlanRow({ plan, isEditing, onEdit }: PlanRowProps) {
  const { message } = App.useApp();
  const [setActive, { isLoading }] = useSetPlanActiveMutation();

  const toggle = async () => {
    try {
      await setActive({ id: plan.id, active: !plan.active }).unwrap();
      message.success(plan.active ? `“${plan.name}” hidden from companies` : `“${plan.name}” visible to companies`);
    } catch (err) {
      message.error(parseApiError(err, "Couldn't change it. Try again."));
    }
  };

  return (
    <Row $editing={isEditing} $hidden={!plan.active}>
      <td>
        <Name>{plan.name}</Name>
      </td>
      <td>{formatRupees(plan.priceRupees)}</td>
      <td>{formatCount(plan.durationDays)} days</td>
      <td>{formatCount(plan.jobSlots)}</td>
      <td>{formatCount(plan.recruiterSeats)}</td>
      <td>{plan.active ? <StatusBadge tone="ok">● Visible</StatusBadge> : <StatusBadge>— Hidden</StatusBadge>}</td>
      <td>
        <Actions>
          <Button size="small" onClick={onEdit} disabled={isEditing} aria-label={`Edit ${plan.name}`}>
            Edit
          </Button>
          <Button
            size="small"
            type="text"
            loading={isLoading}
            onClick={toggle}
            aria-label={`${plan.active ? "Hide" : "Show"} ${plan.name}`}
          >
            {plan.active ? "Hide" : "Show"}
          </Button>
        </Actions>
      </td>
    </Row>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${s(16)};
`;

const Card = styled.section`
  min-width: 0;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: ${s(16)};
`;

/* 7 columns: tighter cells and 2-line headers ("Recruiter / seats") keep Actions on screen. */
const PlansTable = styled(DataTable)`
  && th,
  && td {
    padding-inline: ${s(12)};
  }

  && th {
    white-space: normal;
    vertical-align: bottom;
  }
`;

const Footer = styled.div`
  padding: ${s(6)} ${s(16)};
  border-top: 1px solid var(--line);
`;

const Pad = styled.div`
  padding: ${s(16)};
`;

const Row = styled.tr<{ $editing: boolean; $hidden: boolean }>`
  ${({ $hidden }) => $hidden && "color: var(--muted);"}
  /* The row being edited stays marked while the form is open. */
  ${({ $editing }) => $editing && "background: var(--glass2); box-shadow: inset 3px 0 0 var(--nav-active-bar);"}
  white-space: nowrap;
`;

const Name = styled.span`
  font-weight: 600;
`;

const Actions = styled.span`
  display: flex;
  justify-content: center;
  gap: ${s(6)};
`;

const EmptyCell = styled.td`
  && {
    padding: ${s(32)} ${s(16)};
    text-align: center;
    color: var(--muted);
  }
`;

const Note = styled.p`
  margin: 0;
  padding: ${s(10)} ${s(16)};
  border-top: 1px solid var(--line);
  font-size: ${s(13)};
  line-height: ${s(18)};
  color: var(--muted);
`;
