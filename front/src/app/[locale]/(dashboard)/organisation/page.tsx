import * as API from "@/lib/api";
import OrganisationScreen from "@/components/organisation/screen";
import { headers } from "next/headers";
import NoOrganisationPage from "./no-orga";

export default async function OrganisationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawInvite = sp?.inviteToken ?? undefined;
  const inviteToken = Array.isArray(rawInvite) ? rawInvite[0] : rawInvite;
  try {
    if (inviteToken) await API.joinOrganisation(inviteToken);
  } catch {}
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const data = await API.getOrganisationData(cookieHeader);
    return (
      <main>
        <OrganisationScreen data={data} />
      </main>
    );
  } catch {
    return <NoOrganisationPage />;
  }
}
