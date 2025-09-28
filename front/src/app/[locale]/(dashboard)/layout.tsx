import type { ReactNode } from "react";

import {
  DashboardShell,
  DEFAULT_DASHBOARD_NAV,
} from "@/components/layout/dashboard-shell";
import type { Locale } from "@/i18n/I18n-provider";
import ReactQueryProvider from "@/query-provider";
import { Toaster } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;

  return (
    <>
      <DashboardShell baseHref={`/${locale}`} items={DEFAULT_DASHBOARD_NAV}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </DashboardShell>
      <Toaster richColors />
    </>
  );
}
