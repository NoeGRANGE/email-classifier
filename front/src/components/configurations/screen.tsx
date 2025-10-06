"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useTranslations } from "@/i18n/use-translations";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as API from "@/lib/api";

import ConfigurationCreateDialog from "../emails/configuration/create-dialog";
import ConfigurationsHeader from "./configurations-header";
import ConfigurationsTable from "./configurations-table";
import layoutStyles from "./screen.module.css";

type Props = { data: Configuration[] };

export default function ConfigurationsScreen({ data: initialData }: Props) {
  const { t, locale } = useTranslations("configurations");
  const router = useRouter();
  const [isCreateDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [isCreatingConfiguration, setCreatingConfiguration] =
    React.useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["configurations"],
    queryFn: async () => {
      const response = await API.getConfigurations();
      return response.configurations;
    },
    initialData,
    placeholderData: keepPreviousData,
  });

  const configurations = data ?? [];
  const hasInitialData = initialData.length > 0;
  const hasClientData = configurations.length > 0;
  const isInitialLoading = isLoading && !hasClientData && !hasInitialData;
  const shouldShowSkeleton = isLoading && !data && !hasInitialData;

  const handleCreate = React.useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleCreateDialogChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isCreatingConfiguration) {
        return;
      }
      setCreateDialogOpen(nextOpen);
    },
    [isCreatingConfiguration]
  );

  const handleCreateSubmit = React.useCallback(
    async (name: string) => {
      setCreatingConfiguration(true);
      try {
        const result = await API.createConfiguration(name);
        setCreateDialogOpen(false);
        router.push(`/${locale}/configurations/update/${result.configId}`);
      } catch (error) {
        const fallback = t(
          "createDialog.error",
          "We couldn't create the configuration."
        );
        let message = fallback;
        if (error instanceof Error) {
          const trimmed = error.message.trim();
          if (trimmed) {
            try {
              const parsed = JSON.parse(trimmed);
              if (
                typeof parsed?.message === "string" &&
                parsed.message.trim()
              ) {
                message = parsed.message.trim();
              } else {
                message = trimmed;
              }
            } catch {
              message = trimmed;
            }
          }
        }
        toast.error(message);
      } finally {
        setCreatingConfiguration(false);
      }
    },
    [locale, router, t]
  );

  const handleManage = React.useCallback((configuration: Configuration) => {
    console.log("[Configurations] manage configuration", configuration);
  }, []);

  const handleRemove = React.useCallback((configuration: Configuration) => {
    console.log("[Configurations] remove configuration", configuration);
  }, []);

  return (
    <div className={layoutStyles.wrapper}>
      {isFetching && !isLoading ? (
        <div className={layoutStyles.refreshBar} aria-hidden="true" />
      ) : null}

      <ConfigurationsHeader
        t={t}
        onCreate={handleCreate}
        isLoading={isInitialLoading || isCreatingConfiguration}
      />

      <ConfigurationsTable
        configurations={configurations}
        t={t}
        isLoading={shouldShowSkeleton}
        onManage={handleManage}
        onRemove={handleRemove}
      />

      <ConfigurationCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogChange}
        onSubmit={handleCreateSubmit}
        isSubmitting={isCreatingConfiguration}
        t={t}
      />
    </div>
  );
}
