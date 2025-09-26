import * as React from "react";
import * as API from "@/lib/api";
import EmailsScreen from "@/components/emails/screen";
import { normaliseEmails } from "@/components/emails/utils";
import { headers } from "next/headers";

export default async function EmailsPage() {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const { emails } = await API.listUserEmails(cookieHeader);
  return (
    <main>
      <EmailsScreen emails={normaliseEmails(emails)} />
    </main>
  );
}
