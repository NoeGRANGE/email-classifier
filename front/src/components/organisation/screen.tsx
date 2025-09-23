"use client";

import * as React from "react";
import { useTranslations } from "@/i18n/use-translations";

import OrganisationOverview from "./organisation-overview";
import TeamMembersSection from "./team-members-section";
import layoutStyles from "./screen.module.css";
import { enrichMembers } from "./utils";
import { useRouter, useSearchParams } from "next/navigation";

type Props = { data: OrganisationData };

export default function OrganisationScreen({ data }: Props) {
  const { t } = useTranslations("organisation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const members = React.useMemo(
    () => enrichMembers(data.members),
    [data.members]
  );

  React.useEffect(() => {
    if (searchParams.has("inviteToken")) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("inviteToken");
      router.replace(`?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  return (
    <div className={layoutStyles.wrapper}>
      <header className={layoutStyles.header}>
        <h1 className={layoutStyles.title}>{data.name}</h1>
        <p className={layoutStyles.lead}>
          {t(
            "lead",
            "Manage your workspace, monitor seat usage, and keep your teammates in sync."
          )}
        </p>
      </header>

      <OrganisationOverview
        seatsPurchased={data.seatsPurchased}
        seatsUsed={data.seatsUsed}
        members={members}
        t={t}
      />

      <TeamMembersSection members={members} t={t} />
    </div>
  );
}
