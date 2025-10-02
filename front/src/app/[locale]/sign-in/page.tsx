import * as API from "@/lib/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SignInScreen from "@/components/sign-in/screen";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const me = await API.apiMe(cookieHeader).catch(() => null);

  if (me?.ok && me?.user) {
    const { locale } = await params;
    redirect(`/${locale}/organisation`);
  }

  return (
    <main>
      <SignInScreen />
    </main>
  );
}
