"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { Ban, CloudOff, LogIn, TriangleAlert } from "lucide-react";
import { ROLE_HOME, ROUTES } from "@/config/constants";
import { useAuth } from "@/features/auth";
import { parseApiError } from "@/lib/parseApiError";
import StateCard from "./StateCard";

// Any failed query → one friendly card (template 12-common/States, "Errors"). Pages pass the RTK
// error and a retry; 404 text can be specific ("This job may have closed…").

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  /** Overrides the 404 line, e.g. "This job may have closed, or the link is wrong." */
  notFoundText?: string;
};

const statusOf = (error: unknown) => (error as { status?: unknown } | undefined)?.status;

export default function ErrorState({ error, onRetry, notFoundText }: ErrorStateProps) {
  const router = useRouter();
  const { user } = useAuth();
  const status = statusOf(error);
  const home = user ? ROLE_HOME[user.role] : ROUTES.HOME;
  const retry = onRetry && <Button onClick={onRetry}>Try again</Button>;

  if (status === 404) {
    return (
      <StateCard
        role="alert"
        big="404"
        title="Page not found"
        action={
          <Button type="primary" onClick={() => router.push(home)}>
            Go to {user ? "my dashboard" : "home"}
          </Button>
        }
      >
        {notFoundText ?? "It may have been removed, or the link is wrong."}
      </StateCard>
    );
  }

  if (status === 401) {
    const signIn = () => {
      const next = window.location.pathname + window.location.search;
      window.location.replace(`${ROUTES.LOGIN}?next=${encodeURIComponent(next)}`);
    };
    return (
      <StateCard
        role="alert"
        icon={<LogIn />}
        title="You've been signed out"
        action={
          <Button type="primary" onClick={signIn}>
            Sign in again
          </Button>
        }
      >
        For your safety, sessions end after a while. Sign in to carry on where you left off.
      </StateCard>
    );
  }

  if (status === 403) {
    return (
      <StateCard
        role="alert"
        icon={<Ban />}
        title="This page isn't for your account"
        action={<Button onClick={() => router.push(home)}>Go to my dashboard</Button>}
      >
        {parseApiError(error, "Your account doesn't have access to this page.")}
      </StateCard>
    );
  }

  // Our BFF answers 502 when the backend is down; no status number = network / offline.
  if (status === 502 || typeof status !== "number") {
    return (
      <StateCard role="alert" icon={<CloudOff />} title="Can't reach Kaamsathi" action={retry}>
        {parseApiError(error, "Check your connection and try again.")}
      </StateCard>
    );
  }

  return (
    <StateCard role="alert" icon={<TriangleAlert />} title="Something went wrong on our side" action={retry}>
      Nothing you did. Please try again in a moment.
    </StateCard>
  );
}
