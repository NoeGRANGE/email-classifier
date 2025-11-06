import {
  DashboardShell,
  DEFAULT_DASHBOARD_NAV,
} from "@/components/layout/dashboard-shell";
import { Locale } from "@/i18n/I18n-provider";
import ReactQueryProvider from "@/query-provider";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  const safeLocale = locale || "en";

  return (
    <>
      <DashboardShell baseHref={`/${safeLocale}`} items={DEFAULT_DASHBOARD_NAV}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </DashboardShell>
      <Toaster richColors />
    </>
  );
}
