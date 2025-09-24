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
import * as API from "@/lib/api";

import styles from "./team-member-invite-dialog.module.css";
import {
  formatTemplate,
  prettifyLabel,
  type TranslateFn,
} from "./utils";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionableRoles: string[];
  defaultInviteRole: string;
  onInviteSuccess: () => void;
  t: TranslateFn;
};

export default function TeamMemberInviteDialog({
  open,
  onOpenChange,
  actionableRoles,
  defaultInviteRole,
  onInviteSuccess,
  t,
}: Props) {
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState(defaultInviteRole);
  const [inviteMailboxes, setInviteMailboxes] = React.useState("1");

  const resetForm = React.useCallback(() => {
    setInviteEmail("");
    setInviteRole(defaultInviteRole);
    setInviteMailboxes("1");
  }, [defaultInviteRole]);

  React.useEffect(() => {
    if (!open) {
      setInviteRole(defaultInviteRole);
    }
  }, [defaultInviteRole, open]);

  const parsedInviteMailboxes = React.useMemo(() => {
    const parsed = Number(inviteMailboxes);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [inviteMailboxes]);

  const isInviteFormValid = React.useMemo(() => {
    if (!inviteEmail.trim()) return false;
    if (!inviteRole) return false;
    if (!inviteMailboxes.trim()) return false;
    if (Number.isNaN(parsedInviteMailboxes)) return false;
    return parsedInviteMailboxes > 0;
  }, [inviteEmail, inviteMailboxes, inviteRole, parsedInviteMailboxes]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        resetForm();
      } else {
        setInviteRole((current) => current || defaultInviteRole);
      }
    },
    [defaultInviteRole, onOpenChange, resetForm]
  );

  const submitInvite = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isInviteFormValid) return;

      try {
        const trimmedEmail = inviteEmail.trim();
        await API.inviteToOrganisation(
          trimmedEmail,
          inviteRole,
          parsedInviteMailboxes
        );
        onInviteSuccess();
        toast.success(
          t("members.toast.invite.success.title", "Invitation sent 🎉"),
          {
            description: formatTemplate(
              t(
                "members.toast.invite.success.description",
                "{email} has been invited successfully."
              ),
              { email: trimmedEmail }
            ),
          }
        );
      } catch (error) {
        const fallbackReason = t(
          "members.toast.invite.error.reasonFallback",
          "Something went wrong."
        );
        const errorReason =
          error instanceof Error && error.message.trim()
            ? error.message
            : fallbackReason;

        toast.error(t("members.toast.invite.error.title", "Failed to invite"), {
          description: formatTemplate(
            t(
              "members.toast.invite.error.description",
              "Unable to send the invitation. {reason}"
            ),
            { reason: errorReason }
          ),
        });
      }

      handleOpenChange(false);
    },
    [
      inviteEmail,
      inviteRole,
      isInviteFormValid,
      handleOpenChange,
      onInviteSuccess,
      parsedInviteMailboxes,
      t,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <form onSubmit={submitInvite} className={styles.form}>
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

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label htmlFor="invite-email" className="text-sm font-medium">
                {t("members.inviteDialog.emailLabel", "Email")}
              </label>
              <Input
                className={styles.compactInput}
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

            <div className={styles.field}>
              <label htmlFor="invite-role" className="text-sm font-medium">
                {t("members.inviteDialog.roleLabel", "Role")}
              </label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value)}>
                <SelectTrigger
                  id="invite-role"
                  className={styles.compactSelectTrigger}
                >
                  <SelectValue
                    placeholder={t(
                      "members.inviteDialog.rolePlaceholder",
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
              <label htmlFor="invite-mailboxes" className="text-sm font-medium">
                {t("members.inviteDialog.mailboxesLabel", "Mailboxes")}
              </label>
              <Input
                className={styles.compactInput}
                id="invite-mailboxes"
                type="number"
                min={1}
                inputMode="numeric"
                value={inviteMailboxes}
                onChange={(event) => setInviteMailboxes(event.target.value)}
                aria-describedby="invite-mailboxes-help"
                required
              />
              <p id="invite-mailboxes-help" className={styles.helperText}>
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
  );
}
