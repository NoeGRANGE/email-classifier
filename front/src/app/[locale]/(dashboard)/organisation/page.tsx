import * as API from "@/lib/api";
import OrganisationScreen from "@/components/organisation/screen";
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
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const data = await API.getOrganisationData(cookieHeader);
    return (
      <main>
        <OrganisationScreen data={data.organisation} />
      </main>
    );
  } catch {
    return <NoOrganisationPage />;
  }
}
