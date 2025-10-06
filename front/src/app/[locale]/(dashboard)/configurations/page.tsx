import * as React from "react";
import { headers } from "next/headers";
import * as API from "@/lib/api";
import ConfigurationsScreen from "@/components/configurations/screen";

export default async function ConfigurationsPage() {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const configs = await API.getConfigurations(cookieHeader);
  return (
    <main>
      <ConfigurationsScreen data={configs.configurations} />
    </main>
  );
}
