"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Building2, CreditCard, Mails, Settings, Wrench } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useTranslations } from "@/i18n/use-translations";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/ui/language-switcher";
import styles from "./dashboard-shell.module.css";

export type DashboardNavItem = {
  /** Unique identifier so the list is easy to extend later. */
  id: string;
  /** Text displayed inside the sidebar button. */
  label: string;
  /** Optional translation key for the label. */
  labelKey?: string;
  /** Path without the locale prefix, e.g. `"organisations"` or `"/subscriptions"`. */
  href: string;
  /** Optional icon from lucide-react. */
  icon?: LucideIcon;
};

/**
 * Prototype list of navigation links that can be adjusted to fit real data later.
 * Extend or replace this array to control the sidebar entries.
 */
export const DEFAULT_DASHBOARD_NAV: DashboardNavItem[] = [
  {
    id: "organisation",
    label: "Organisation",
    labelKey: "sidebar.nav.organisation",
    href: "organisation",
    icon: Building2,
  },
  {
    id: "emails",
    label: "Emails",
    labelKey: "sidebar.nav.emails",
    href: "emails",
    icon: Mails,
  },
  {
    id: "configurations",
    label: "Configurations",
    labelKey: "sidebar.nav.configurations",
    href: "configurations",
    icon: Wrench,
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    labelKey: "sidebar.nav.subscriptions",
    href: "subscriptions",
    icon: CreditCard,
  },
  {
    id: "settings",
    label: "Settings",
    labelKey: "sidebar.nav.settings",
    href: "settings",
    icon: Settings,
  },
];

type DashboardShellProps = {
  children: ReactNode;
  /** Locale-aware prefix, e.g. `/en`. */
  baseHref?: string;
  /** Navigation items to render inside the sidebar. */
  items?: DashboardNavItem[];
  /** Optional element rendered next to the trigger inside the header. */
  headerAddon?: ReactNode;
};

type NormalizedNavItem = DashboardNavItem & { fullHref: string };

/**
 * Re-usable shell that keeps the sidebar mounted across dashboard pages.
 */
export function DashboardShell({
  children,
  items = DEFAULT_DASHBOARD_NAV,
  baseHref = "",
  headerAddon,
}: DashboardShellProps) {
  const { t } = useTranslations("dashboard");
  const pathname = usePathname();

  const normalizedItems = useMemo<NormalizedNavItem[]>(() => {
    const prefix = baseHref.replace(/\/$/, "");
    return items.map((item) => {
      const rawHref = item.href.startsWith("/") ? item.href : `/${item.href}`;
      const fullHref = `${prefix}${rawHref}`.replace(/\/+/g, "/") || "/";
      return {
        ...item,
        fullHref,
      };
    });
  }, [items, baseHref]);

  const getItemLabel = useCallback(
    (item: NormalizedNavItem) =>
      item.labelKey
        ? t(item.labelKey, item.label ?? item.id)
        : item.label ?? item.id,
    [t]
  );

  const activeItem = useMemo(() => {
    const current = pathname?.replace(/\/$/, "");
    return normalizedItems.find((item) => {
      const target = item.fullHref.replace(/\/$/, "");
      if (!current || !target) return false;
      return current === target || current.startsWith(`${target}/`);
    });
  }, [normalizedItems, pathname]);

  const activeLabel = useMemo(
    () => (activeItem ? getItemLabel(activeItem) : undefined),
    [activeItem, getItemLabel]
  );

  return (
    <SidebarProvider>
      <div className={styles.dashboardShell}>
        <Sidebar className={styles.sidebar}>
          <SidebarHeader className={styles.sidebarHeader}>
            <div className={styles.sidebarHeaderContent}>
              <span className={styles.brand}>
                {t("sidebar.brand", "Taggly")}
              </span>
              <div
                className={cn(
                  styles.languageSwitcher,
                  "group-data-[collapsible=icon]:hidden"
                )}
              >
                <LanguageSwitcher />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className={styles.sidebarContent}>
            <SidebarGroup>
              <SidebarGroupLabel className={styles.groupLabel}>
                {t("sidebar.workspace", "Workspace")}
              </SidebarGroupLabel>
              <SidebarMenu>
                {normalizedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem?.id === item.id;
                  const displayLabel = getItemLabel(item);
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          styles.menuButton,
                          !Icon && styles.menuButtonNoIcon
                        )}
                      >
                        <Link href={item.fullHref}>
                          {Icon ? (
                            <Icon className={styles.menuButtonIcon} />
                          ) : null}
                          <span className={styles.menuButtonLabel}>
                            {displayLabel}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            {/* <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Add quick links or shortcuts here.
            </div> */}
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className={styles.mainHeader}>
            <SidebarTrigger className={styles.sidebarTrigger} />
            <div className={styles.mainTitle}>
              {activeLabel ?? t("sidebar.dashboardFallback", "Dashboard")}
            </div>
            {headerAddon}
          </header>
          <div className={styles.mainContent}>{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
