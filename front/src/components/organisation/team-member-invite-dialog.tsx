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
import { formatTemplate, prettifyLabel } from "./utils";
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [inviteResult, setInviteResult] = React.useState<{
    email: string;
    inviteLink: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = React.useState(false);

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
        setInviteResult(null);
        setHasCopied(false);
        setIsSubmitting(false);
      } else {
        setInviteRole((current) => current || defaultInviteRole);
      }
    },
    [defaultInviteRole, onOpenChange, resetForm]
  );

  const submitInvite = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isInviteFormValid || isSubmitting) return;

      try {
        setIsSubmitting(true);
        setHasCopied(false);
        const trimmedEmail = inviteEmail.trim();
        const response = await API.inviteToOrganisation(
          trimmedEmail,
          inviteRole,
          parsedInviteMailboxes
        );
        const { inviteLink } = response;
        if (!inviteLink) {
          throw new Error(
            t(
              "members.inviteDialog.missingInviteLink",
              "We could not generate the invite link. Please try again."
            )
          );
        }
        setInviteResult({ email: trimmedEmail, inviteLink });
        resetForm();
        onInviteSuccess();
        toast.success(
          t("members.toast.invite.success.title", "Invite link ready 🎉"),
          {
            description: formatTemplate(
              t(
                "members.toast.invite.success.description",
                "Share the invite link with {email} so they can join."
              ),
              { email: trimmedEmail }
            ),
          }
        );
      } catch (error) {
        setInviteResult(null);
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
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      inviteEmail,
      inviteRole,
      isInviteFormValid,
      isSubmitting,
      onInviteSuccess,
      parsedInviteMailboxes,
      resetForm,
      t,
    ]
  );

  const copyInviteLink = React.useCallback(async () => {
    if (!inviteResult?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteResult.inviteLink);
      setHasCopied(true);
      toast.success(
        t("members.inviteDialog.copySuccess", "Invite link copied to clipboard")
      );
    } catch (error) {
      const description =
        error instanceof Error && error.message
          ? error.message
          : t(
              "members.inviteDialog.copyErrorFallback",
              "We were unable to copy the link automatically. Please copy it manually."
            );
      toast.error(
        t("members.inviteDialog.copyErrorTitle", "Unable to copy invite link"),
        {
          description,
        }
      );
    }
  }, [inviteResult, t]);

  React.useEffect(() => {
    if (!hasCopied) return;
    const timeout = window.setTimeout(() => setHasCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [hasCopied]);

  const handleInviteAnother = React.useCallback(() => {
    setInviteResult(null);
    setHasCopied(false);
  }, []);

  const isSuccessState = Boolean(inviteResult);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.dialogContent}>
        {isSuccessState && inviteResult ? (
          <div className={styles.form}>
            <DialogHeader>
              <DialogTitle>
                {t("members.inviteDialog.successTitle", "Invitation ready")}
              </DialogTitle>
              <DialogDescription>
                {formatTemplate(
                  t(
                    "members.inviteDialog.successDescription",
                    "Share this link with {email} so they can join your workspace."
                  ),
                  { email: inviteResult.email }
                )}
              </DialogDescription>
            </DialogHeader>

            <div className={styles.successField}>
              <label htmlFor="invite-link" className="text-sm font-medium">
                {t("members.inviteDialog.inviteLinkLabel", "Invite link")}
              </label>
              <div className={styles.copyRow}>
                <Input
                  id="invite-link"
                  value={inviteResult.inviteLink}
                  readOnly
                  className={styles.copyInput}
                />
                <Button type="button" onClick={copyInviteLink} variant="outline">
                  {hasCopied
                    ? t("members.inviteDialog.copied", "Link copied")
                    : t("members.inviteDialog.copyLink", "Copy invite link")}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleInviteAnother}
              >
                {t(
                  "members.inviteDialog.inviteAnother",
                  "Invite someone else"
                )}
              </Button>
              <DialogClose asChild>
                <Button type="button">
                  {t("members.inviteDialog.done", "Done")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        ) : (
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
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="invite-role" className="text-sm font-medium">
                  {t("members.inviteDialog.roleLabel", "Role")}
                </label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) => setInviteRole(value)}
                  disabled={isSubmitting}
                >
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
                  disabled={isSubmitting}
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
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  {t("members.inviteDialog.cancel", "Cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!isInviteFormValid || isSubmitting}>
                {isSubmitting
                  ? t("members.inviteDialog.submitting", "Sending…")
                  : t("members.inviteDialog.submit", "Send invite")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
