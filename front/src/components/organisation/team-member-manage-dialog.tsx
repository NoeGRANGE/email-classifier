"use client";

import * as React from "react";

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

import styles from "./team-member-manage-dialog.module.css";
import { formatTemplate, prettifyLabel, type NormalisedMember } from "./utils";
import { toast } from "sonner";
import * as API from "@/lib/api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setUpdate: React.ActionDispatch<[]>;
  member: NormalisedMember | null;
  actionableRoles: string[];
  t: TranslateFn;
};

export default function TeamMemberManageDialog({
  open,
  onOpenChange,
  member,
  actionableRoles,
  setUpdate,
  t,
}: Props) {
  const fallbackRole = React.useMemo(
    () => actionableRoles[0] ?? "",
    [actionableRoles]
  );

  const [selectedRole, setSelectedRole] = React.useState(
    member?._roleKey ?? fallbackRole
  );
  const [mailboxes, setMailboxes] = React.useState(
    member ? String(member.authorizedEmails) : "1"
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setSelectedRole(member?._roleKey ?? fallbackRole);
    setMailboxes(member ? String(member.authorizedEmails) : "1");
  }, [fallbackRole, member]);

  const handleDialogChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        resetForm();
      }
    },
    [onOpenChange, resetForm]
  );

  React.useEffect(() => {
    if (!open) return;
    if (!member) {
      setSelectedRole(fallbackRole);
      setMailboxes("1");
      return;
    }
    setSelectedRole(member._roleKey ?? fallbackRole);
    setMailboxes(String(member.authorizedEmails));
  }, [member, open, fallbackRole]);

  const parsedMailboxes = React.useMemo(() => {
    const parsed = Number(mailboxes);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [mailboxes]);

  const isFormValid = React.useMemo(() => {
    if (!member) return false;
    if (!selectedRole) return false;
    if (!mailboxes.trim()) return false;
    if (Number.isNaN(parsedMailboxes)) return false;
    return parsedMailboxes > 0;
  }, [mailboxes, member, parsedMailboxes, selectedRole]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!member) return;
      if (!isFormValid) return;

      try {
        setIsSaving(true);
        await API.manageOrganisationMember(
          member.id,
          selectedRole,
          parsedMailboxes
        );
        setUpdate();
        toast.success(
          t("members.manageDialog.success", "Member details updated.")
        );
        handleDialogChange(false);
      } catch (error) {
        const fallbackReason = t(
          "members.manageDialog.errorFallback",
          "Something went wrong."
        );
        const errorReason =
          error instanceof Error && error.message.trim()
            ? error.message
            : fallbackReason;
        toast.error(t("members.manageDialog.errorTitle", "Failed to update"), {
          description: formatTemplate(
            t(
              "members.manageDialog.errorDescription",
              "Unable to update the member. {reason}"
            ),
            { reason: errorReason }
          ),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [handleDialogChange, isFormValid, member, parsedMailboxes, selectedRole, t]
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={styles.dialogContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <DialogHeader>
            <DialogTitle>
              {t("members.manageDialog.title", "Manage member")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "members.manageDialog.description",
                "Update their role or mailbox allocation."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label htmlFor="manage-email" className="text-sm font-medium">
                {t("members.manageDialog.emailLabel", "Email")}
              </label>
              <Input
                id="manage-email"
                value={member?.email ?? ""}
                disabled
                readOnly
                className={styles.compactInput}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="manage-role" className="text-sm font-medium">
                {t("members.manageDialog.roleLabel", "Role")}
              </label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value)}
              >
                <SelectTrigger
                  id="manage-role"
                  className={styles.compactSelectTrigger}
                >
                  <SelectValue
                    placeholder={t(
                      "members.manageDialog.rolePlaceholder",
                      "Select a role"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {actionableRoles.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className={styles.compactSelectItem}
                    >
                      {t(`members.roles.${role}`, prettifyLabel(role))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.field}>
              <label htmlFor="manage-mailboxes" className="text-sm font-medium">
                {t("members.manageDialog.mailboxesLabel", "Mailboxes")}
              </label>
              <Input
                id="manage-mailboxes"
                type="number"
                min={1}
                inputMode="numeric"
                value={mailboxes}
                onChange={(event) => setMailboxes(event.target.value)}
                className={styles.compactInput}
                aria-describedby="manage-mailboxes-help"
                required
              />
              <p id="manage-mailboxes-help" className={styles.helperText}>
                {t(
                  "members.manageDialog.mailboxesHelp",
                  "Adjust how many mailboxes this member can access."
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("members.manageDialog.cancel", "Cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isFormValid || isSaving}>
              {t("members.manageDialog.submit", "Save changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
