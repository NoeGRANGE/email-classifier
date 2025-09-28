import * as React from "react";
import * as API from "@/lib/api";
import EmailsScreen from "@/components/emails/screen";
import { headers } from "next/headers";

export default async function EmailsPage() {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const { emails, hasMaxMailboxes } = await API.listUserEmails(cookieHeader);
  return (
    <main>
      <EmailsScreen emails={emails} hasMaxMailboxes={hasMaxMailboxes} />
    </main>
  );
}
