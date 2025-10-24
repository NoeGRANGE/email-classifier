import * as API from "@/lib/api";
import OrganisationScreen from "@/components/organisation/screen";
import CreateOrganisation from "@/components/organisation/create-organisation";
import { headers } from "next/headers";
import NoOrganisationPage from "./no-orga";
import { cookies } from "next/headers";

export default async function OrganisationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawInvite = sp?.inviteToken ?? undefined;
  let inviteToken = Array.isArray(rawInvite) ? rawInvite[0] : rawInvite;
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const cookieStore = await cookies();

  if (!inviteToken) {
    const match = cookieHeader.match(/inviteToken=([^;]+)/);
    if (match) {
      const tokenFromCookie = decodeURIComponent(match[1]);
      if (tokenFromCookie) inviteToken = tokenFromCookie;
    }
  }
  try {
    if (inviteToken) {
      await API.joinOrganisation(inviteToken, cookieHeader);
      cookieStore.delete("inviteToken");
    }
  } catch {}

  try {
    const [data, meRole] = await Promise.all([
      API.getOrganisationData(cookieHeader),
      API.getMeRole(cookieHeader),
    ]);
    return (
      <main>
        <OrganisationScreen data={data.organisation} meRole={meRole} />
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
