"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null | undefined;
}) {
  return (
    <SessionProvider session={session ?? undefined}>{children}</SessionProvider>
  );
}
