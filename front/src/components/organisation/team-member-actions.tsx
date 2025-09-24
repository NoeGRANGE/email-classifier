"use client";

import * as React from "react";
import { MoreHorizontal, UserCog, UserMinus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styles from "./team-member-actions.module.css";
import {
  formatTemplate,
  type NormalisedMember,
  type TranslateFn,
} from "./utils";
import * as API from "@/lib/api";
import { toast } from "sonner";

type TeamMemberActionsProps = {
  member: NormalisedMember;
  t: TranslateFn;
  className?: string;
  onManage?: (member: NormalisedMember) => void;
  onRemove?: (member: NormalisedMember) => void;
};

export default function TeamMemberActions({
  member,
  t,
  className,
  onManage,
  onRemove,
}: TeamMemberActionsProps) {
  const handleManage = () => {
    onManage?.(member);
  };

  const handleRemove = async () => {
    const fallbackReason = t(
      "members.toast.remove.error.reasonFallback",
      "Something went wrong."
    );
    try {
      await API.removeOrganisationMember(member.id);
      toast.success(t("members.toast.remove.success.title", "Member removed"), {
        description: formatTemplate(
          t(
            "members.toast.remove.success.description",
            "{email} no longer has access."
          ),
          { email: member.email }
        ),
      });
      onRemove?.(member);
    } catch (error) {
      let errorReason = fallbackReason;
      if (error instanceof Error) {
        const trimmed = error.message.trim();
        if (trimmed) {
          try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed?.message === "string" && parsed.message.trim()) {
              errorReason = parsed.message.trim();
            } else {
              errorReason = trimmed;
            }
          } catch {
            errorReason = trimmed;
          }
        }
      }

      toast.error(t("members.toast.remove.error.title", "Failed to remove"), {
        description: formatTemplate(
          t(
            "members.toast.remove.error.description",
            "Unable to remove the member. {reason}"
          ),
          { reason: errorReason }
        ),
      });
    }
  };

  return (
    <div className={cn(styles.root, className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("members.actions.open", "Open actions menu")}
            className={styles.triggerButton}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={styles.menu}>
          <DropdownMenuItem onSelect={handleManage} className={styles.menuItem}>
            <UserCog className="size-4" aria-hidden="true" />
            {t("members.actions.manage", "Manage")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleRemove}
            className={styles.menuItem}
          >
            <UserMinus className="size-4" aria-hidden="true" />
            {t("members.actions.remove", "Remove")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
