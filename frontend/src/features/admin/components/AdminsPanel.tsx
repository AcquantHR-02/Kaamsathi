"use client";

import { App, Button, Form, Input, Skeleton } from "antd";
import styled from "styled-components";
import { formatDate } from "@/lib/format";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { s } from "@/styles/scale";
import { useCreateAdminMutation } from "../api/adminApi";
import type { AdminUser } from "../types/admin.types";

type AdminsPanelProps = {
  /** Other admins (the signed-in admin is left out by the parent). */
  admins: AdminUser[] | undefined;
  isMainAdmin: boolean;
};

/** "Add admin" drawer content: the add form (main admin only) + the other admins. */
export default function AdminsPanel({ admins, isMainAdmin }: AdminsPanelProps) {
  return (
    <Body>
      <AddAdmin enabled={isMainAdmin} />

      <List aria-labelledby="admins-title">
        <Cap id="admins-title">Other admins{admins ? ` · ${admins.length}` : ""}</Cap>
        {!admins ? (
          <Skeleton active avatar title={false} paragraph={{ rows: 2 }} />
        ) : !admins.length ? (
          <Small>No other admins yet.</Small>
        ) : (
          admins.map((admin) => (
            <AdminRow key={admin.id}>
              <Initials aria-hidden>{admin.email.slice(0, 2).toUpperCase()}</Initials>
              <div>
                <Email>{admin.email}</Email>
                <Small>
                  {admin.mainAdmin ? "Main admin · can't be changed" : `Admin · added ${formatDate(admin.createdAt)}`}
                </Small>
              </div>
            </AdminRow>
          ))
        )}
      </List>
    </Body>
  );
}

function AddAdmin({ enabled }: { enabled: boolean }) {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ email: string }>();
  const [createAdmin, { isLoading }] = useCreateAdminMutation();
  const email = Form.useWatch("email", form) ?? "";

  const submit = async ({ email }: { email: string }) => {
    const clean = email.trim().toLowerCase();
    try {
      await createAdmin({ email: clean }).unwrap();
      form.resetFields();
      message.success(`Set-password link sent to ${clean}`);
    } catch (err) {
      form.setFields([
        {
          name: "email",
          errors: [
            getErrorCode(err) === "EMAIL_ALREADY_EXISTS"
              ? "This email already has a Kaamsathi account."
              : parseApiError(err, "Couldn't add the admin. Try again."),
          ],
        },
      ]);
    }
  };

  return (
    <AddForm
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={submit}
      disabled={!enabled}
      aria-label="Add an admin"
    >
      <Form.Item
        name="email"
        label="Email"
        normalize={(v: string) => v.trimStart()}
        rules={[
          { required: true, message: "Enter their email." },
          { type: "email", message: "Enter a valid email." },
          { max: 254, message: "Too long." },
        ]}
      >
        <Input type="email" autoFocus={enabled} autoComplete="off" placeholder="name@kaamsathi.in" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isLoading} disabled={!enabled || !email.trim()} block>
        Send set-password link
      </Button>
      <Small>
        {enabled
          ? "They get a link valid for 24 hours to set their password, then sign in on the normal login page."
          : "Only the main admin can add admins."}
      </Small>
    </AddForm>
  );
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${s(24)};
`;

const AddForm = styled(Form<{ email: string }>)`
  && {
    display: flex;
    flex-direction: column;
    gap: ${s(14)};
  }

  && .ant-form-item {
    margin-bottom: 0;
  }
`;

const List = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${s(14)};
  padding-top: ${s(20)};
  border-top: 1px solid var(--line);
`;

const Cap = styled.h3`
  margin: 0;
  font-size: ${s(12)};
  line-height: ${s(16)};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--faint);
`;

const AdminRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${s(12)};
  min-width: 0;

  > div {
    min-width: 0;
  }
`;

const Initials = styled.span`
  flex: none;
  width: ${s(36)};
  height: ${s(36)};
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: ${s(12)};
  font-weight: 700;
  background: var(--brand-icon-bg);
  border: 1px solid var(--line);
`;

const Email = styled.div`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Small = styled.p`
  margin: 0;
  font-size: ${s(13)};
  line-height: ${s(18)};
  color: var(--muted);
`;
