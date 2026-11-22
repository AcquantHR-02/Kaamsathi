"use client";

import { App, Button, Form, Input, InputNumber } from "antd";
import styled from "styled-components";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { s } from "@/styles/scale";
import { useAddPlanMutation, useUpdatePlanMutation } from "../api/paymentApi";
import type { Plan, PlanInput } from "../types/payment.types";

// Create / edit card. Limits mirror backend PlanRequest so mistakes show before sending.

type PlanFormProps = {
  /** null = create a new plan. */
  plan: Plan | null;
  plans: Plan[];
  /** Drawer title; also names the form for screen readers. */
  title: string;
  onDone: () => void;
};

const DUPLICATE = "A plan with this name already exists (capital letters don't count).";

const NUMBERS: { name: keyof PlanInput; label: string; max: number; placeholder: string; prefix?: string }[] = [
  { name: "priceRupees", label: "Price (₹)", max: 10_000_000, placeholder: "e.g. 2999", prefix: "₹" },
  { name: "durationDays", label: "Duration (days)", max: 3650, placeholder: "e.g. 30" },
  { name: "jobSlots", label: "Active job slots", max: 1000, placeholder: "e.g. 5" },
  { name: "recruiterSeats", label: "Recruiter seats", max: 1000, placeholder: "e.g. 3" },
];

export default function PlanForm({ title, plan, plans, onDone }: PlanFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<PlanInput>();
  const [addPlan, adding] = useAddPlanMutation();
  const [updatePlan, updating] = useUpdatePlanMutation();
  const isEdit = plan !== null;
  const saving = adding.isLoading || updating.isLoading;

  const values = Form.useWatch([], form) as Partial<PlanInput> | undefined;
  const filled = !!values?.name?.trim() && NUMBERS.every((f) => typeof values?.[f.name] === "number");
  const changed =
    !isEdit || values?.name?.trim() !== plan.name || NUMBERS.some((f) => values?.[f.name] !== plan[f.name]);

  const submit = async (input: PlanInput) => {
    const body = { ...input, name: input.name.trim() };
    try {
      if (isEdit) {
        await updatePlan({ id: plan.id, ...body }).unwrap();
        message.success(`“${body.name}” saved`);
      } else {
        await addPlan(body).unwrap();
        message.success(`“${body.name}” created — companies can see it now`);
      }
      onDone();
    } catch (err) {
      form.setFields([
        {
          name: "name",
          errors: [
            getErrorCode(err) === "PLAN_NAME_EXISTS"
              ? DUPLICATE
              : parseApiError(err, "Couldn't save the plan. Try again."),
          ],
        },
      ]);
    }
  };

  return (
    <Card
      form={form}
      name="plan"
      layout="vertical"
      requiredMark={false}
      initialValues={plan ?? undefined}
      onFinish={submit}
      aria-label={title}
    >
      <Form.Item
        name="name"
        label="Plan name"
        rules={[
          { required: true, whitespace: true, message: "Enter a plan name." },
          { max: 100, message: "Keep it under 100 characters." },
          {
            validator: (_, value?: string) =>
              value &&
              plans.some((p) => p.id !== plan?.id && p.name.trim().toLowerCase() === value.trim().toLowerCase())
                ? Promise.reject(DUPLICATE)
                : Promise.resolve(),
          },
        ]}
      >
        <Input autoFocus placeholder="e.g. Pro" maxLength={100} />
      </Form.Item>

      <Grid>
        {NUMBERS.map((f) => (
          <Form.Item
            key={f.name}
            name={f.name}
            label={f.label}
            rules={[
              { required: true, message: "Required." },
              { type: "number", min: 1, max: f.max, message: `1 to ${f.max.toLocaleString("en-IN")}.` },
            ]}
          >
            <InputNumber min={1} max={f.max} precision={0} placeholder={f.placeholder} style={{ width: "100%" }} />
          </Form.Item>
        ))}
      </Grid>

      <Buttons>
        <Button onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit" loading={saving} disabled={!filled || !changed}>
          {isEdit ? "Save changes" : "Create plan"}
        </Button>
      </Buttons>
      <Hint>
        {!filled
          ? "Fill in all five fields to continue."
          : isEdit
            ? "Companies that already bought this plan keep what they paid for."
            : "New plans are visible to companies straight away."}
      </Hint>
    </Card>
  );
}

const Card = styled(Form<PlanInput>)`
  && {
    display: flex;
    flex-direction: column;
    gap: ${s(16)};
  }

  && .ant-form-item {
    margin-bottom: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${s(14)} ${s(12)};
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${s(10)};
`;

const Hint = styled.p`
  margin: 0;
  font-size: ${s(13)};
  line-height: ${s(18)};
  color: var(--muted);
`;
