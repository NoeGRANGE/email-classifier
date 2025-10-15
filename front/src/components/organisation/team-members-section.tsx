"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";

import styles from "./team-members-section.module.css";
import TeamMemberActions from "./team-member-actions";
import TeamMemberInviteDialog from "./team-member-invite-dialog";
import TeamMemberManageDialog from "./team-member-manage-dialog";
import TeamMembersOptions from "./team-members-options";
import TeamMembersTable from "./team-members-table";
import { ROLE_PRIORITY, prettifyLabel, type NormalisedMember } from "./utils";
import * as API from "@/lib/api";

type TeamMembersSectionProps = {
  members: NormalisedMember[];
  t: TranslateFn;
  setUpdate: React.ActionDispatch<[]>;
  role: string;
};

export default function TeamMembersSection({
  members,
  t,
  setUpdate,
  role,
}: TeamMembersSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const uniqueRoles = React.useMemo(() => {
    const sortedRoles = Array.from(
      new Set(members.map((member) => member._roleKey).filter(Boolean))
    ).sort((a, b) => {
      const aIndex = ROLE_PRIORITY.indexOf(a as (typeof ROLE_PRIORITY)[number]);
      const bIndex = ROLE_PRIORITY.indexOf(b as (typeof ROLE_PRIORITY)[number]);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    return sortedRoles;
  }, [members]);

  const uniqueStatuses = React.useMemo(
    () =>
      Array.from(
        new Set(members.map((member) => member._statusKey).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    [members]
  );

  const actionableRoles = React.useMemo(() => {
    const seed = new Set<string>();
    (ROLE_PRIORITY as readonly string[]).forEach((role) => seed.add(role));
    uniqueRoles.forEach((role) => seed.add(role));
    return Array.from(seed);
  }, [uniqueRoles]);

  const defaultInviteRole = React.useMemo(
    () => actionableRoles[0] ?? "",
    [actionableRoles]
  );

  const [isInviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [isManageDialogOpen, setManageDialogOpen] = React.useState(false);
  const [managedMember, setManagedMember] =
    React.useState<NormalisedMember | null>(null);

  const showInviteDialog = React.useCallback(() => {
    setInviteDialogOpen(true);
  }, []);

  const handleManageMember = React.useCallback((member: NormalisedMember) => {
    setManagedMember(member);
    setManageDialogOpen(true);
  }, []);

  const handleManageDialogOpenChange = React.useCallback((open: boolean) => {
    setManageDialogOpen(open);
    if (!open) {
      setManagedMember(null);
    }
  }, []);

  const handleInviteSuccess = React.useCallback(() => {
    setUpdate();
  }, [setUpdate]);

  const filteredMembers = React.useMemo(() => {
    const roleKey = roleFilter === "all" ? null : roleFilter;
    const statusKey = statusFilter === "all" ? null : statusFilter;
    const query = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      if (roleKey && member._roleKey !== roleKey) return false;
      if (statusKey && member._statusKey !== statusKey) return false;
      if (!query) return true;

      const haystack = [member.email, member.role, member.status]
        .filter(Boolean)
        .map((value) => value.toLowerCase())
        .join(" ");

      return haystack.includes(query);
    });
  }, [members, roleFilter, statusFilter, searchQuery]);

  const columns = React.useMemo<ColumnDef<NormalisedMember>[]>(
    () => [
      {
        accessorKey: "email",
        header: () => t("members.columns.email", "Email"),
        cell: ({ row }) => (
          <span className={styles.emailValue} title={row.original.email}>
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: () => t("members.columns.role", "Role"),
        cell: ({ row }) => {
          const { role, _roleKey } = row.original;
          return (
            <span className={styles.roleChip} data-role={_roleKey || undefined}>
              {t(`members.roles.${_roleKey}`, prettifyLabel(role))}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => t("members.columns.status", "Status"),
        cell: ({ row }) => {
          const { status, _statusKey } = row.original;
          return (
            <span
              className={styles.statusPill}
              data-status={_statusKey || undefined}
            >
              {t(`members.status.${_statusKey}`, prettifyLabel(status))}
            </span>
          );
        },
      },
      {
        accessorKey: "authorizedEmails",
        header: () => t("members.columns.authorized", "Authorized emails"),
        cell: ({ row }) => row.original.authorizedEmails.toLocaleString(),
      },
      {
        id: "actions",
        header: () => null,
        enableSorting: false,
        cell: ({ row }) =>
          role === "admin" || role === "owner" ? (
            <TeamMemberActions
              member={row.original}
              t={t}
              onManage={handleManageMember}
              onRemove={setUpdate}
            />
          ) : null,
      },
    ],
    [handleManageMember, setUpdate, t]
  );

  return (
    <section className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>
          {t("members.title", "Team members")}
        </h2>
        <p className={styles.tableDescription}>
          {t(
            "members.description",
            "Review everyone in your workspace, adjust permissions, or remove access."
          )}
        </p>
      </div>

      <TeamMembersOptions
        searchQuery={searchQuery}
        onSearchChange={(value) => setSearchQuery(value)}
        roleFilter={roleFilter}
        onRoleChange={(value) => setRoleFilter(value)}
        statusFilter={statusFilter}
        onStatusChange={(value) => setStatusFilter(value)}
        uniqueRoles={uniqueRoles}
        uniqueStatuses={uniqueStatuses}
        t={t}
        onInvite={showInviteDialog}
        role={role}
      />

      <TeamMembersTable
        data={filteredMembers}
        columns={columns}
        className={styles.membersTable}
      />

      <TeamMemberInviteDialog
        open={isInviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        actionableRoles={actionableRoles}
        defaultInviteRole={defaultInviteRole}
        onInviteSuccess={handleInviteSuccess}
        t={t}
      />
      <TeamMemberManageDialog
        open={isManageDialogOpen}
        onOpenChange={handleManageDialogOpenChange}
        setUpdate={setUpdate}
        member={managedMember}
        actionableRoles={actionableRoles}
        t={t}
      />
    </section>
  );
}
