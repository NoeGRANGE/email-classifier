"use client";

import * as React from "react";
import { useTranslations } from "@/i18n/use-translations";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as API from "@/lib/api";

import EmailsTable from "./emails-table";
import layoutStyles from "./screen.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import { normaliseEmails } from "./utils";

type Props = {
  emails: Email[];
};

export default function EmailsScreen({ emails: initialEmails }: Props) {
  const { t } = useTranslations("emails");
  const [update, setUpdate] = React.useReducer((x) => x + 1, 0);

  const {
    data: fetchedEmails,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["user emails", update],
    queryFn: async () => {
      console.log("Fetching user emails...");
      const res = await API.listUserEmails();
      return normaliseEmails(res.emails);
    },
    initialData: update === 0 ? initialEmails : undefined,
    placeholderData: keepPreviousData,
  });

  const latestEmails = React.useMemo(
    () => fetchedEmails ?? initialEmails,
    [fetchedEmails, initialEmails]
  );

  const [emails, setEmails] = React.useState<Email[]>(latestEmails);

  React.useEffect(() => {
    setEmails(latestEmails);
  }, [latestEmails]);

  const handleActivate = React.useCallback((email: Email) => {
    setEmails((current) =>
      current.map((item) =>
        item.email === email.email ? { ...item, activated: true } : item
      )
    );
  }, []);

  const handleDeactivate = React.useCallback((email: Email) => {
    setEmails((current) =>
      current.map((item) =>
        item.email === email.email ? { ...item, activated: false } : item
      )
    );
  }, []);

  const handleRemove = React.useCallback((email: Email) => {
    setEmails((current) =>
      current.filter((item) => item.email !== email.email)
    );
  }, []);

  const isInitialLoading = isLoading && !fetchedEmails && !initialEmails.length;
  const isBackgroundFetching = isFetching && !isLoading;

  return (
    <div className={layoutStyles.wrapper}>
      {isBackgroundFetching && (
        <div className={layoutStyles.refreshBar} aria-hidden="true" />
      )}

      {isInitialLoading ? (
        <div className={layoutStyles.skeletonStack}>
          <header className={layoutStyles.headerSkeleton}>
            <div className={layoutStyles.headerRow}>
              <div className={layoutStyles.headerSkeletonContent}>
                <Skeleton
                  className={layoutStyles.titleSkeleton}
                  aria-hidden="true"
                />
                <Skeleton
                  className={layoutStyles.leadSkeleton}
                  aria-hidden="true"
                />
              </div>
              <Skeleton
                className={layoutStyles.actionSkeleton}
                aria-hidden="true"
              />
            </div>
          </header>
          <div className={layoutStyles.tableSkeleton} aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className={layoutStyles.tableSkeletonRow}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <header className={layoutStyles.header}>
            <div className={layoutStyles.headerRow}>
              <div className={layoutStyles.headerContent}>
                <h1 className={layoutStyles.title}>
                  {t("title", "Email connections")}
                </h1>
                <p className={layoutStyles.lead}>
                  {t(
                    "lead",
                    "Review and manage the email accounts linked to your workspace."
                  )}
                </p>
              </div>
            </div>
          </header>

          <EmailsTable
            emails={emails}
            t={t}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onRemove={handleRemove}
            setUpdate={setUpdate}
          />
        </>
      )}
    </div>
  );
}
