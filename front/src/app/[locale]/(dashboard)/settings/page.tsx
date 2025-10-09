import * as API from "@/lib/api";
import { headers } from "next/headers";
import SettingsScreen from "@/components/settings/screen";
import { Locale } from "@/i18n/I18n-provider";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const me = await API.apiMe(cookieHeader).catch(() => null);
  return (
    <main>
      <SettingsScreen userEmail={me?.user.email ?? null} />
    </main>
  );
}
