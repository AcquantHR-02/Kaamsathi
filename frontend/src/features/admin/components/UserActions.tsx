"use client";

import { useState } from "react";
import { App, Button, Tooltip } from "antd";
import { Trash2, UserX } from "lucide-react";
import styled from "styled-components";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { parseApiError } from "@/lib/parseApiError";
import { s } from "@/styles/scale";
import { useDeleteUserMutation, useSetUserSuspendedMutation } from "../api/adminApi";
import type { AdminUser } from "../types/admin.types";
import { USER_ROLE_LABEL } from "../utils/userLabels";

type UserActionsProps = {
  user: AdminUser;
  /** Why actions are off for this row ("You", "Main admin"…); undefined = allowed. */
  lockedReason?: string;
};

/** Suspend (confirm) · Unsuspend (direct, it only gives access back) · Delete (confirm, permanent). */
export default function UserActions({ user, lockedReason }: UserActionsProps) {
  const { message } = App.useApp();
  const [setSuspended, suspending] = useSetUserSuspendedMutation();
  const [deleteUser, deleting] = useDeleteUserMutation();
  const [dialog, setDialog] = useState<"suspend" | "delete" | null>(null);
  const isSuspended = user.status === "SUSPENDED";

  if (lockedReason) return <Locked>{lockedReason}</Locked>;

  const changeSuspension = async (suspended: boolean) => {
    try {
      await setSuspended({ id: user.id, suspended }).unwrap();
      message.success(suspended ? `${user.email} suspended and signed out` : `${user.email} can sign in again`);
      setDialog(null);
    } catch (err) {
      setDialog(null);
      message.error(parseApiError(err, "Couldn't change this account. Try again."));
    }
  };

  const remove = async () => {
    try {
      await deleteUser(user.id).unwrap();
      message.success(`${user.email} deleted`);
      setDialog(null);
    } catch (err) {
      // e.g. "owns a company — transfer ownership first" comes from the backend as-is.
      setDialog(null);
      message.error(parseApiError(err, "Couldn't delete this account. Try again."));
    }
  };

  return (
    <Actions>
      {isSuspended ? (
        <Button
          size="small"
          loading={suspending.isLoading}
          onClick={() => changeSuspension(false)}
          aria-label={`Unsuspend ${user.email}`}
        >
          Unsuspend
        </Button>
      ) : (
        <Button size="small" onClick={() => setDialog("suspend")} aria-label={`Suspend ${user.email}`}>
          Suspend
        </Button>
      )}
      {/* Backend refuses to delete an owner who still owns a company (409): say so before the click. */}
      <Tooltip title={user.ownsCompany ? "Owns a company — transfer ownership first" : undefined}>
        <Button
          size="small"
          danger
          disabled={user.ownsCompany}
          onClick={() => setDialog("delete")}
          aria-label={`Delete ${user.email}`}
        >
          Delete
        </Button>
      </Tooltip>

      <ConfirmDialog
        open={dialog === "suspend"}
        icon={<UserX />}
        title="Suspend this account?"
        subject={`${user.email} · ${USER_ROLE_LABEL[user.role]}`}
        confirmText="Suspend"
        loading={suspending.isLoading}
        onConfirm={() => changeSuspension(true)}
        onCancel={() => setDialog(null)}
      >
        <ul>
          <li>They&apos;re signed out on every device at once.</li>
          <li>They can&apos;t sign in until you unsuspend them.</li>
          <li>Nothing is deleted — jobs, applications and data stay.</li>
        </ul>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "delete"}
        icon={<Trash2 />}
        title="Delete this account for good?"
        subject={`${user.email} · ${USER_ROLE_LABEL[user.role]}`}
        confirmText="Delete account"
        loading={deleting.isLoading}
        onConfirm={remove}
        onCancel={() => setDialog(null)}
      >
        <p>
          Their account and personal data are removed. <b>This can&apos;t be undone.</b>
        </p>
      </ConfirmDialog>
    </Actions>
  );
}

const Actions = styled.span`
  display: flex;
  justify-content: center;
  gap: ${s(6)};

  /* Suspend / Unsuspend share one width so the button pair doesn't shift between rows. */
  > .ant-btn:first-child {
    min-width: 100px; /* fits "Unsuspend" (button text is not scaled) */
  }
`;

const Locked = styled.span`
  display: block;
  text-align: center;
  font-size: ${s(13)};
  color: var(--faint);
  white-space: nowrap;
`;
