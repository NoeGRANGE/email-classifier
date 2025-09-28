"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import styles from "./team-members-options.module.css";
import { prettifyLabel } from "./utils";

type TeamMembersOptionsProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  uniqueRoles: string[];
  uniqueStatuses: string[];
  t: TranslateFn;
  onInvite: () => void;
};

export default function TeamMembersOptions({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  uniqueRoles,
  uniqueStatuses,
  t,
  onInvite,
}: TeamMembersOptionsProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.filtersGroup}>
        <Input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("members.filters.search", "Search by email or role")}
          aria-label={t("members.filters.search", "Search by email or role")}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.filtersGroup}>
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger
            size="sm"
            aria-label={t("members.filters.role", "Filter by role")}
            className={styles.selectTrigger}
          >
            <SelectValue
              placeholder={t("members.filters.role", "Filter by role")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="!pl-2.5">
              {t("members.filters.roleAll", "All roles")}
            </SelectItem>
            {uniqueRoles.map((role) => (
              <SelectItem key={role} value={role} className="!pl-2.5">
                {t(`members.roles.${role}`, prettifyLabel(role))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger
            size="sm"
            aria-label={t("members.filters.status", "Filter by status")}
            className={styles.selectTrigger}
          >
            <SelectValue
              placeholder={t("members.filters.status", "Filter by status")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="!pl-2.5">
              {t("members.filters.statusAll", "All statuses")}
            </SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status} className="!pl-2.5">
                {t(`members.status.${status}`, prettifyLabel(status))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        startIcon={<Plus aria-hidden="true" />}
        onClick={onInvite}
        className={styles.inviteButton}
      >
        {t("members.invite", "Invite member")}
      </Button>
    </div>
  );
}
