"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, ShieldCheck, UserCog, UserMinus } from "lucide-react";
import * as API from "@/lib/api";

import styles from "./team-members-section.module.css";
import TeamMembersOptions from "./team-members-options";
import TeamMembersTable from "./team-members-table";
import {
  ROLE_PRIORITY,
  prettifyLabel,
  type NormalisedMember,
  type TranslateFn,
} from "./utils";

type TeamMembersSectionProps = {
  members: NormalisedMember[];
  t: TranslateFn;
};

export default function TeamMembersSection({
  members,
  t,
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
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState(defaultInviteRole);
  const [inviteMailboxes, setInviteMailboxes] = React.useState("1");

  const resetInviteForm = React.useCallback(() => {
    setInviteEmail("");
    setInviteRole(defaultInviteRole);
    setInviteMailboxes("1");
  }, [defaultInviteRole]);

  const handleInviteDialogChange = React.useCallback(
    (open: boolean) => {
      setInviteDialogOpen(open);
      if (!open) {
        resetInviteForm();
      } else {
        setInviteRole((current) => current || defaultInviteRole);
      }
    },
    [defaultInviteRole, resetInviteForm]
  );

  const showInviteDialog = React.useCallback(() => {
    setInviteDialogOpen(true);
    setInviteRole((current) => current || defaultInviteRole);
  }, [defaultInviteRole]);

  const parsedInviteMailboxes = React.useMemo(() => {
    const parsed = Number(inviteMailboxes);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [inviteMailboxes]);

  React.useEffect(() => {
    if (!isInviteDialogOpen) {
      setInviteRole(defaultInviteRole);
    }
  }, [defaultInviteRole, isInviteDialogOpen]);

  const isInviteFormValid = React.useMemo(() => {
    if (!inviteEmail.trim()) return false;
    if (!inviteRole) return false;
    if (!inviteMailboxes.trim()) return false;
    if (Number.isNaN(parsedInviteMailboxes)) return false;
    return parsedInviteMailboxes > 0;
  }, [inviteEmail, inviteMailboxes, inviteRole, parsedInviteMailboxes]);

  const handleInviteSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isInviteFormValid) return;
      console.log("invite", { inviteEmail, inviteRole, parsedInviteMailboxes });
      try {
        await API.inviteToOrganisation(
          inviteEmail.trim(),
          inviteRole,
          parsedInviteMailboxes
        );
      } catch (error) {
        console.error("Failed to invite member", error);
      }
      setInviteDialogOpen(false);
      resetInviteForm();
    },
    [
      inviteEmail,
      inviteRole,
      parsedInviteMailboxes,
      isInviteFormValid,
      resetInviteForm,
    ]
  );

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
      }),
    []
  );

  const formatDate = React.useCallback(
    (value: string | null | undefined) => {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "—";
      return dateFormatter.format(date);
    },
    [dateFormatter]
  );

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

  const handleRoleChange = React.useCallback(
    (member: NormalisedMember, role: string) => {
      console.info("change role", { memberId: member.id, role });
      // TODO: Connect to mutation endpoint when available.
    },
    []
  );

  const handleRemoveMember = React.useCallback((member: NormalisedMember) => {
    console.info("remove member", { memberId: member.id });
    // TODO: Connect to mutation endpoint when available.
  }, []);

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
      // {
      //   accessorKey: "createdAt",
      //   header: () => t("members.columns.invited", "Invited"),
      //   cell: ({ row }) => formatDate(row.original.createdAt),
      //   sortingFn: (a, b) => {
      //     const aTime = new Date(a.original.createdAt).getTime();
      //     const bTime = new Date(b.original.createdAt).getTime();
      //     return aTime - bTime;
      //   },
      // },
      // {
      //   accessorKey: "acceptedAt",
      //   header: () => t("members.columns.joined", "Joined"),
      //   cell: ({ row }) => formatDate(row.original.acceptedAt),
      //   sortingFn: (a, b) => {
      //     const aTime = new Date(a.original.acceptedAt).getTime();
      //     const bTime = new Date(b.original.acceptedAt).getTime();
      //     return aTime - bTime;
      //   },
      // },
      {
        id: "actions",
        header: () => null,
        enableSorting: false,
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className={styles.actionsCell}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("members.actions.open", "Open actions menu")}
                  >
                    <MoreHorizontal aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {t("members.actions.title", "Member actions")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      {t("members.actions.role", "Manage role")}
                    </DropdownMenuLabel>
                    {actionableRoles.map((role) => {
                      const isCurrent = role === member._roleKey;
                      return (
                        <DropdownMenuItem
                          key={role}
                          disabled={isCurrent}
                          onSelect={() => {
                            if (!isCurrent) handleRoleChange(member, role);
                          }}
                        >
                          {isCurrent ? (
                            <ShieldCheck
                              className="size-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <UserCog className="size-4" aria-hidden="true" />
                          )}
                          {t(`members.roles.${role}`, prettifyLabel(role))}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => handleRemoveMember(member)}
                  >
                    <UserMinus className="size-4" aria-hidden="true" />
                    {t("members.actions.remove", "Remove from organisation")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [actionableRoles, formatDate, handleRemoveMember, handleRoleChange, t]
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
      />

      <TeamMembersTable
        data={filteredMembers}
        columns={columns}
        className={styles.membersTable}
      />

      <Dialog open={isInviteDialogOpen} onOpenChange={handleInviteDialogChange}>
        <DialogContent className="p-6 sm:p-6 !p-6 sm:!p-6">
          <form
            onSubmit={handleInviteSubmit}
            className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8"
          >
            <DialogHeader>
              <DialogTitle>
                {t("members.inviteDialog.title", "Invite a teammate")}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "members.inviteDialog.description",
                  "Send an invitation email and set their initial access."
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="invite-email" className="text-sm font-medium">
                  {t("members.inviteDialog.emailLabel", "Email")}
                </label>
                <Input
                  className="!px-2.5"
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder={t(
                    "members.inviteDialog.emailPlaceholder",
                    "name@example.com"
                  )}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="invite-role" className="text-sm font-medium">
                  {t("members.inviteDialog.roleLabel", "Role")}
                </label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) => setInviteRole(value)}
                >
                  <SelectTrigger id="invite-role" className="!pl-2.5">
                    <SelectValue
                      placeholder={t(
                        "members.inviteDialog.rolePlaceholder",
                        "Select a role"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {actionableRoles.map((role) => (
                      <SelectItem key={role} value={role} className="!pl-2.5">
                        {t(`members.roles.${role}`, prettifyLabel(role))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="invite-mailboxes"
                  className="text-sm font-medium"
                >
                  {t("members.inviteDialog.mailboxesLabel", "Mailboxes")}
                </label>
                <Input
                  className="!px-2.5"
                  id="invite-mailboxes"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={inviteMailboxes}
                  onChange={(event) => setInviteMailboxes(event.target.value)}
                  aria-describedby="invite-mailboxes-help"
                  required
                />
                <p
                  id="invite-mailboxes-help"
                  className="text-muted-foreground text-sm"
                >
                  {t(
                    "members.inviteDialog.mailboxesHelp",
                    "Define how many mailboxes this member can access."
                  )}
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("members.inviteDialog.cancel", "Cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!isInviteFormValid}>
                {t("members.inviteDialog.submit", "Send invite")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
