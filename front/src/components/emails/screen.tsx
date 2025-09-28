"use client";

import * as React from "react";
import { useTranslations } from "@/i18n/use-translations";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as API from "@/lib/api";

import EmailsTable from "./emails-table";
import layoutStyles from "./screen.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Props = {
  emails: Email[];
  hasMaxMailboxes: boolean;
};

export default function EmailsScreen({
  emails: initialEmails,
  hasMaxMailboxes: initialHasMaxMailboxes,
}: Props) {
  const { t } = useTranslations("emails");
  const [update, setUpdate] = React.useReducer((x) => x + 1, 0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["user emails", update],
    queryFn: async () => {
      const res = await API.listUserEmails();
      return { emails: res.emails, hasMaxMailboxes: res.hasMaxMailboxes };
    },
    initialData:
      update === 0
        ? { emails: initialEmails, hasMaxMailboxes: initialHasMaxMailboxes }
        : undefined,
    placeholderData: keepPreviousData,
  });

  const formatTemplate = React.useCallback(
    (template: string, replacements: Record<string, string | number>) => {
      return Object.entries(replacements).reduce((acc, [key, value]) => {
        const pattern = new RegExp(`\\{${key}\\}`, "g");
        return acc.replace(pattern, String(value));
      }, template);
    },
    []
  );

  const extractErrorReason = React.useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof Error) {
        const trimmed = error.message.trim();
        if (trimmed) {
          try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed?.message === "string" && parsed.message.trim()) {
              return parsed.message.trim();
            }
          } catch {}
          return trimmed;
        }
      }
      return fallback;
    },
    []
  );

  const handleDeactivate = async (email: Email) => {
    const fallbackReason = t(
      "toast.deactivate.error.reasonFallback",
      "Something went wrong."
    );
    try {
      await API.activateOrDeactivateUserEmails(email.id);
      setUpdate();
      toast.success(t("toast.deactivate.success.title", "Email deactivated"), {
        description: formatTemplate(
          t("toast.deactivate.success.description", "{email} is inactive now."),
          { email: email.email }
        ),
      });
    } catch (error) {
      const errorReason = extractErrorReason(error, fallbackReason);
      toast.error(t("toast.deactivate.error.title", "Deactivation failed"), {
        description: formatTemplate(
          t(
            "toast.deactivate.error.description",
            "We couldn't deactivate the email. {reason}"
          ),
          { reason: errorReason }
        ),
      });
    }
  };

  const handleActivate = async (email: Email) => {
    const fallbackReason = t(
      "toast.activate.error.reasonFallback",
      "Something went wrong."
    );
    try {
      await API.activateOrDeactivateUserEmails(email.id);
      setUpdate();
      toast.success(t("toast.activate.success.title", "Email activated"), {
        description: formatTemplate(
          t("toast.activate.success.description", "{email} is active now."),
          { email: email.email }
        ),
      });
    } catch (error) {
      const errorReason = extractErrorReason(error, fallbackReason);
      toast.error(t("toast.activate.error.title", "Activation failed"), {
        description: formatTemplate(
          t(
            "toast.activate.error.description",
            "We couldn't activate the email. {reason}"
          ),
          { reason: errorReason }
        ),
      });
    }
  };

  const handleRemove = async (email: Email) => {
    const fallbackReason = t(
      "toast.remove.error.reasonFallback",
      "Something went wrong."
    );
    try {
      await API.removeUserEmails(email.id);
      setUpdate();
      toast.success(t("toast.remove.success.title", "Email removed"), {
        description: formatTemplate(
          t("toast.remove.success.description", "{email} was disconnected."),
          { email: email.email }
        ),
      });
    } catch (error) {
      const errorReason = extractErrorReason(error, fallbackReason);
      toast.error(t("toast.remove.error.title", "Removal failed"), {
        description: formatTemplate(
          t(
            "toast.remove.error.description",
            "We couldn't remove the email. {reason}"
          ),
          { reason: errorReason }
        ),
      });
    }
  };

  const isInitialLoading = isLoading && !data && !initialEmails.length;
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

          {data && data.emails && (
            <EmailsTable
              emails={data.emails}
              t={t}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onRemove={handleRemove}
              setUpdate={setUpdate}
              hasMaxMailboxes={data.hasMaxMailboxes}
            />
          )}
        </>
      )}
    </div>
  );
}
