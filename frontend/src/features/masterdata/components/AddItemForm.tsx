"use client";

import { App, Button, Form, Input } from "antd";
import styled from "styled-components";
import { getErrorCode, parseApiError } from "@/lib/parseApiError";
import { s } from "@/styles/scale";
import { useAddMasterItemMutation, useAllMasterItemsQuery } from "../api/masterdataApi";
import { type MASTER_LISTS, sameName } from "../utils/lists";

type List = (typeof MASTER_LISTS)[number];
type Values = { name: string; state?: string };

const DUPLICATE = "Already in the list (capital letters don't count).";

type AddItemFormProps = { list: List; onDone: () => void };

/** "Add a skill" form (in the page's drawer). Stays open after adding so several items can go in a row;
 *  the name field is focused again. Cities also need a state (backend CityRequest), which the template omits. */
export default function AddItemForm({ list, onDone }: AddItemFormProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const { data } = useAllMasterItemsQuery(list.kind);
  const [add, { isLoading }] = useAddMasterItemMutation();
  const isCity = list.kind === "cities";

  const name = Form.useWatch("name", form) ?? "";
  const state = Form.useWatch("state", form) ?? "";
  const canSubmit = name.trim() !== "" && (!isCity || state.trim() !== "");

  const submit = async ({ name, state }: Values) => {
    try {
      const item = await add({ kind: list.kind, name: name.trim(), ...(isCity && { state: state?.trim() }) }).unwrap();
      form.resetFields();
      form.getFieldInstance("name")?.focus();
      message.success(`“${item.name}” added`);
    } catch (err) {
      const duplicate = getErrorCode(err) === "MASTERDATA_NAME_EXISTS";
      form.setFields([
        { name: "name", errors: [duplicate ? DUPLICATE : parseApiError(err, "Couldn't add it. Try again.")] },
      ]);
    }
  };

  return (
    <Card form={form} layout="vertical" requiredMark={false} onFinish={submit} aria-label={`Add a ${list.singular}`}>
      <Form.Item
        name="name"
        label="Name"
        rules={[
          { required: true, whitespace: true, message: "Enter a name." },
          { max: 100, message: "Keep it under 100 characters." },
          {
            validator: (_, value?: string) =>
              value && data?.some((i) => sameName(i.name, value)) ? Promise.reject(DUPLICATE) : Promise.resolve(),
          },
        ]}
      >
        <Input autoFocus placeholder={`e.g. ${list.example}`} maxLength={100} />
      </Form.Item>

      {isCity && (
        <Form.Item
          name="state"
          label="State"
          rules={[
            { required: true, whitespace: true, message: "Enter the state." },
            { max: 100, message: "Keep it under 100 characters." },
          ]}
        >
          <Input placeholder="e.g. Maharashtra" maxLength={100} />
        </Form.Item>
      )}

      <Buttons>
        <Button onClick={onDone} disabled={isLoading}>
          Done
        </Button>
        <Button type="primary" htmlType="submit" loading={isLoading} disabled={!canSubmit}>
          Add
        </Button>
      </Buttons>
      <Hint>Names are unique, ignoring capital letters.</Hint>
    </Card>
  );
}

const Card = styled(Form<Values>)`
  && {
    display: flex;
    flex-direction: column;
    gap: ${s(16)};
  }

  && .ant-form-item {
    margin-bottom: 0;
  }
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
