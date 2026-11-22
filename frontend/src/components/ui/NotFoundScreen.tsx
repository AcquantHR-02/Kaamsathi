"use client";

import { Button } from "antd";
import styled from "styled-components";
import { ROUTES } from "@/config/constants";
import { s } from "@/styles/scale";
import StateCard from "./StateCard";

/** Unknown URL anywhere in the app (template 12-common/States, 404 card). */
export default function NotFoundScreen() {
  return (
    <Page>
      <Narrow>
        <StateCard
          big="404"
          title="Page not found"
          action={
            <Button type="primary" href={ROUTES.HOME}>
              Go home
            </Button>
          }
        >
          This page may have moved, or the link is wrong.
        </StateCard>
      </Narrow>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background: var(--bg);
`;

const Narrow = styled.div`
  width: 100%;
  max-width: ${s(420)};
`;
