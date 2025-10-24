import * as React from "react";
import * as API from "@/lib/api";
import EmailsScreen from "@/components/emails/screen";
import { headers } from "next/headers";
import NoOrganisationPage from "../organisation/no-orga";
import CreateOrganisation from "@/components/organisation/create-organisation";

export default async function EmailsPage() {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  try {
    const { emails, hasMaxMailboxes } = await API.listUserEmails(cookieHeader);
    return (
      <main>
        <EmailsScreen emails={emails} hasMaxMailboxes={hasMaxMailboxes} />
      </main>
    );
  } catch {
    try {
      const me = await API.apiMe(cookieHeader);
      if (
        me.user.org_id === null &&
        (me.user.subscription_status === "active" ||
          me.user.subscription_status === "trialing")
      ) {
        return (
          <main>
            <CreateOrganisation />
          </main>
        );
      } else {
        return <NoOrganisationPage />;
      }
    } catch {
      return <NoOrganisationPage />;
    }
  }
}
