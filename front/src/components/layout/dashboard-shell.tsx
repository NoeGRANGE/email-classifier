"use client";

import { type ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Building2, CreditCard } from "lucide-react";

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
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  /** Unique identifier so the list is easy to extend later. */
  id: string;
  /** Text displayed inside the sidebar button. */
  label: string;
  /** Path without the locale prefix, e.g. `"organisation"` or `"/subscription"`. */
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
    href: "organisation",
    icon: Building2,
  },
  {
    id: "subscription",
    label: "Subscription",
    href: "subscription",
    icon: CreditCard,
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
  const pathname = usePathname();

  const normalizedItems = useMemo<NormalizedNavItem[]>(() => {
    const prefix = baseHref.replace(/\/$/, "");
    return items.map((item) => {
      const rawHref = item.href.startsWith("/")
        ? item.href
        : `/${item.href}`;
      const fullHref = `${prefix}${rawHref}`.replace(/\/+/g, "/") || "/";
      return {
        ...item,
        fullHref,
      };
    });
  }, [items, baseHref]);

  const activeItem = useMemo(() => {
    const current = pathname?.replace(/\/$/, "");
    return normalizedItems.find((item) => {
      const target = item.fullHref.replace(/\/$/, "");
      if (!current || !target) return false;
      return current === target || current.startsWith(`${target}/`);
    });
  }, [normalizedItems, pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex h-12 items-center px-2 text-sm font-semibold">
              Mailroom
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarMenu>
                {normalizedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem?.id === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={item.fullHref}
                          className={cn(
                            "flex w-full items-center gap-2",
                            !Icon && "pl-1"
                          )}
                        >
                          {Icon ? <Icon className="size-4" /> : null}
                          <span>{item.label}</span>
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
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Add quick links or shortcuts here.
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 truncate text-sm font-medium text-muted-foreground">
              {activeItem?.label ?? "Dashboard"}
            </div>
            {headerAddon}
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
