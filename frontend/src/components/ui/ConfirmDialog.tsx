"use client";

import { Button, Modal } from "antd";
import { TriangleAlert } from "lucide-react";
import styled, { createGlobalStyle } from "styled-components";
import { s } from "@/styles/scale";

// "Confirm before anything permanent" (template 12-common/ConfirmDialogs): says exactly what will
// happen; the confirm button is the only red thing. AntD Modal gives focus trap, Esc and aria.

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** What it's about, under the title: "Java Backend Developer · TechNova Labs". */
  subject?: React.ReactNode;
  /** Consequences: text, a list, or a field (password / reason). */
  children?: React.ReactNode;
  confirmText: string;
  cancelText?: string;
  icon?: React.ReactNode;
  /** While the request runs: spinner on confirm, closing blocked. */
  loading?: boolean;
  /** e.g. a required reason is still empty. */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  subject,
  children,
  confirmText,
  cancelText = "Cancel",
  icon = <TriangleAlert />,
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <>
      <DialogStyles />
      <Modal
        open={open}
        onCancel={loading ? undefined : onCancel}
        closable={false}
        mask={{ closable: !loading }}
        keyboard={!loading}
        footer={null}
        width={480}
        centered
        destroyOnHidden
        rootClassName="ks-confirm"
        // Head goes in AntD's own title slot: that's what names the dialog for screen readers
        // (a custom aria-labelledby on Modal is ignored).
        title={
          <Head>
            <IconTile aria-hidden>{icon}</IconTile>
            <div>
              <Title>{title}</Title>
              {subject && <Subject>{subject}</Subject>}
            </div>
          </Head>
        }
      >
        <Body>
          {children && <Consequences>{children}</Consequences>}

          <Buttons>
            <Button onClick={onCancel} disabled={loading}>
              {cancelText}
            </Button>
            <Button type="primary" danger onClick={onConfirm} loading={loading} disabled={confirmDisabled}>
              {confirmText}
            </Button>
          </Buttons>
        </Body>
      </Modal>
    </>
  );
}

// AntD renders the modal in a portal, so its card is styled through the root class.
const DialogStyles = createGlobalStyle`
  .ks-confirm .ant-modal-content {
    padding: ${s(28)};
    border-radius: ${s(24)};
    background: var(--surface);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
  }

  .ks-confirm .ant-modal-header {
    margin-bottom: ${s(16)};
    background: transparent;
  }

  .ks-confirm .ant-modal-title {
    font-weight: inherit;
    font-size: inherit;
    line-height: inherit;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${s(16)};
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${s(14)};
`;

const IconTile = styled.span`
  flex: none;
  width: ${s(48)};
  height: ${s(48)};
  border-radius: ${s(14)};
  display: grid;
  place-items: center;
  background: var(--badt);
  color: var(--bad);

  svg {
    width: ${s(22)};
    height: ${s(22)};
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${s(20)};
  line-height: ${s(28)};
  font-weight: 700;
`;

const Subject = styled.p`
  margin: 0;
  font-size: ${s(14)};
  line-height: ${s(20)};
  color: var(--muted);
`;

const Consequences = styled.div`
  font-size: ${s(14)};
  line-height: ${s(20)};
  color: var(--muted);

  p {
    margin: 0;
  }

  ul {
    margin: 0;
    padding-left: ${s(20)};
    display: flex;
    flex-direction: column;
    gap: ${s(6)};
  }

  b {
    color: var(--ink);
  }
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${s(10)};
`;
