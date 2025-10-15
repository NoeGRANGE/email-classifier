"use client";

import * as React from "react";
import { useTranslations } from "@/i18n/use-translations";

import OrganisationOverview from "./organisation-overview";
import TeamMembersSection from "./team-members-section";
import layoutStyles from "./screen.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import { enrichMembers } from "./utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import * as API from "@/lib/api";

type Props = {
  data: OrganisationData;
  meRole: { role: string; activatedEmails: number; authorizedEmails: number };
};

function HeaderSkeleton() {
  return (
    <header className={layoutStyles.headerSkeleton}>
      <Skeleton className={layoutStyles.titleSkeleton} aria-hidden="true" />
      <Skeleton className={layoutStyles.leadSkeleton} aria-hidden="true" />
      <Skeleton className={layoutStyles.leadSkeleton} aria-hidden="true" />
    </header>
  );
}

function OverviewSkeleton() {
  return (
    <section className={layoutStyles.cardSkeleton} aria-hidden="true">
      <div className={layoutStyles.headerSkeleton}>
        <Skeleton className={layoutStyles.titleSkeleton} />
        <div className={layoutStyles.skeletonMeta}>
          <Skeleton className={layoutStyles.skeletonMetaItem} />
          <Skeleton className={layoutStyles.skeletonMetaItem} />
        </div>
      </div>
      <div className={layoutStyles.statsSkeleton}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div className={layoutStyles.statSkeleton} key={index}>
            <Skeleton className={layoutStyles.statSkeletonLabel} />
            <Skeleton className={layoutStyles.statSkeletonValue} />
          </div>
        ))}
      </div>
      <div className={layoutStyles.usageSkeleton}>
        <div className={layoutStyles.usageSkeletonHeader}>
          <Skeleton className={layoutStyles.usageSkeletonLabel} />
          <Skeleton className={layoutStyles.usageSkeletonPercent} />
        </div>
        <Skeleton className={layoutStyles.usageSkeletonBar} />
        <Skeleton className={layoutStyles.usageSkeletonNote} />
      </div>
    </section>
  );
}

function MembersSkeleton() {
  return (
    <section className={layoutStyles.sectionSkeleton} aria-hidden="true">
      <div className={layoutStyles.headerSkeleton}>
        <Skeleton className={layoutStyles.titleSkeleton} />
        <Skeleton className={layoutStyles.leadSkeleton} />
      </div>
      <div className={layoutStyles.tableSkeleton}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className={layoutStyles.tableSkeletonRow} key={index} />
        ))}
      </div>
    </section>
  );
}

export default function OrganisationScreen({ data: _data, meRole }: Props) {
  const { t } = useTranslations("organisation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [update, setUpdate] = React.useReducer((x: number) => x + 1, 0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["organisation data", update],
    queryFn: async () => {
      const res = await API.getOrganisationData();
      return res.organisation;
    },
    initialData: update === 0 ? _data : undefined,
    placeholderData: keepPreviousData,
  });

  const organisation = data ?? _data;

  const members = React.useMemo(
    () => enrichMembers(organisation.members),
    [organisation.members]
  );

  const isInitialLoading = isLoading && !data;
  const isBackgroundFetching = isFetching && !isLoading;

  React.useEffect(() => {
    if (searchParams.has("inviteToken")) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("inviteToken");
      router.replace(`?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  return (
    <div className={layoutStyles.wrapper}>
      {isBackgroundFetching && (
        <div className={layoutStyles.refreshBar} aria-hidden="true" />
      )}

      {isInitialLoading ? (
        <div className={layoutStyles.skeletonStack}>
          <HeaderSkeleton />
          <OverviewSkeleton />
          <MembersSkeleton />
        </div>
      ) : (
        <>
          <header className={layoutStyles.header}>
            <h1 className={layoutStyles.title}>{organisation.name}</h1>
            <p className={layoutStyles.lead}>
              {t(
                "lead",
                "Manage your workspace, monitor seat usage, and keep your teammates in sync."
              )}
            </p>
          </header>

          <OrganisationOverview
            seatsPurchased={organisation.seatsPurchased}
            seatsUsed={organisation.seatsUsed}
            members={members}
            t={t}
          />

          <TeamMembersSection
            members={members}
            t={t}
            setUpdate={setUpdate}
            role={meRole.role}
          />
        </>
      )}
    </div>
  );
}
