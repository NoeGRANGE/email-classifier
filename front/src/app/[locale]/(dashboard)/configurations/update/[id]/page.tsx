import * as React from "react";
import * as API from "@/lib/api";
import { headers } from "next/headers";
import ConfigurationUpdateScreen from "@/components/configurations/update/screen";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConfigurationUpdatePage({ params }: PageProps) {
  const id = (await params).id;
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const configuration = await API.getConfiguration(id, cookieHeader);

  return (
    <main>
      <ConfigurationUpdateScreen data={configuration.configuration} />
    </main>
  );
}
