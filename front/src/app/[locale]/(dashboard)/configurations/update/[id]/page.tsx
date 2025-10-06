import * as React from "react";
import * as API from "@/lib/api";
import { headers } from "next/headers";
import ConfigurationUpdateScreen from "@/components/configurations/update/screen";

type PageProps = {
  params: { id: string };
};

export default async function ConfigurationUpdatePage({ params }: PageProps) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const configuration = await API.getConfiguration(params.id, cookieHeader);

  return (
    <main>
      <ConfigurationUpdateScreen data={configuration.configuration} />
    </main>
  );
}
