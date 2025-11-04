"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useTranslations } from "@/i18n/use-translations";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";
import * as API from "@/lib/api";
import styles from "./screen.module.css";

const PRIVACY_FALLBACK = "/privacy";
const HELP_FALLBACK = "mailto:ngrange.dev@gmail.com";

const PRIVACY_HREF =
  process.env.NEXT_PUBLIC_PRIVACY_URL &&
  process.env.NEXT_PUBLIC_PRIVACY_URL.length > 0
    ? process.env.NEXT_PUBLIC_PRIVACY_URL
    : PRIVACY_FALLBACK;

const HELP_HREF =
  process.env.NEXT_PUBLIC_HELP_URL &&
  process.env.NEXT_PUBLIC_HELP_URL.length > 0
    ? process.env.NEXT_PUBLIC_HELP_URL
    : HELP_FALLBACK;

const PRIVACY_IS_EXTERNAL = /^https?:\/\//i.test(PRIVACY_HREF);
const HELP_IS_MAILTO = /^mailto:/i.test(HELP_HREF);
const HELP_IS_EXTERNAL = /^https?:\/\//i.test(HELP_HREF);

function isIgnorableLogoutError(error: unknown) {
  if (error instanceof Error) {
    const trimmed = error.message.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.status === 404) return true;
      } catch {
        return false;
      }
    }
  }
  return false;
}

type SettingsScreenProps = {
  userEmail?: string | null;
};

type PendingAction = "logout" | "delete" | null;

export default function SettingsScreen({ userEmail }: SettingsScreenProps) {
  const { t, locale } = useTranslations("settings");
  const router = useRouter();
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const hasPendingAction = pendingAction !== null;
  const isLogoutPending = pendingAction === "logout";
  const isDeletePending = pendingAction === "delete";
  const processingLabel = t("settings.state.processing", "Processing...");
  const genericError = t(
    "settings.state.error.generic",
    "Something went wrong. Please try again."
  );

  const parseErrorMessage = React.useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        const trimmed = error.message.trim();
        if (trimmed) {
          try {
            const parsed = JSON.parse(trimmed);
            if (
              parsed &&
              typeof parsed === "object" &&
              typeof parsed.message === "string" &&
              parsed.message.trim()
            ) {
              return parsed.message.trim();
            }
          } catch {
            // ignore parse issues
          }
          return trimmed;
        }
      }
      return genericError;
    },
    [genericError]
  );

  React.useEffect(() => {
    if (pendingAction === "logout") {
      setDeleteDialogOpen(false);
    }
  }, [pendingAction]);

  const handleLogout = React.useCallback(async () => {
    if (pendingAction) return;
    setPendingAction("logout");
    try {
      const { error: globalError } = await supabase.auth.signOut({
        scope: "global",
      });
      const { error: localError } = await supabase.auth.signOut({
        scope: "local",
      });
      let logoutError: unknown = null;
      try {
        await API.apiLogout();
      } catch (apiError) {
        if (!isIgnorableLogoutError(apiError)) {
          logoutError = apiError;
        }
      }

      if (localError) throw localError;
      if (globalError) throw globalError;
      if (logoutError) throw logoutError;

      toast.success(
        t("settings.state.success.logout", "You have been logged out.")
      );
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(parseErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }, [pendingAction, router, locale, parseErrorMessage, t]);

  const handleDeleteAccount = React.useCallback(async () => {
    if (pendingAction) return;
    setPendingAction("delete");
    try {
      await API.deleteAccount();
      await supabase.auth.signOut().catch(() => {});

      toast.success(
        t("settings.state.success.delete", "Your account was deleted.")
      );
      setDeleteDialogOpen(false);
      router.replace(`/${locale}/sign-in`);
      router.refresh();
    } catch (error) {
      toast.error(parseErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }, [pendingAction, router, locale, parseErrorMessage, t]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("settings.title", "Settings")}</h1>
        <p className={styles.lead}>
          {t(
            "settings.lead",
            "Manage your account preferences and access helpful resources."
          )}
        </p>
      </header>

      <section className={styles.section} aria-labelledby="support-resources">
        <h2 id="support-resources" className={styles.sectionTitle}>
          {t("settings.section.support", "Support")}
        </h2>
        <div className={styles.sectionList}>
          <div className={styles.item}>
            <div className={styles.itemText}>
              <h3 className={styles.itemTitle}>
                {t("settings.links.help.title", "Need help?")}
              </h3>
              <p className={styles.itemDescription}>
                {t(
                  "settings.links.help.description",
                  "Contact our support team for assistance with setup or troubleshooting."
                )}
              </p>
            </div>
            <div className={styles.itemActions}>
              <Button asChild variant="outline" className={styles.linkButton}>
                {HELP_IS_MAILTO ? (
                  <a href={HELP_HREF}>
                    {t("settings.links.help.button", "Contact support")}
                  </a>
                ) : HELP_IS_EXTERNAL ? (
                  <a href={HELP_HREF} target="_blank" rel="noreferrer">
                    {t("settings.links.help.button", "Contact support")}
                  </a>
                ) : (
                  <Link href={HELP_HREF}>
                    {t("settings.links.help.button", "Contact support")}
                  </Link>
                )}
              </Button>
            </div>
          </div>

          <div className={styles.item}>
            <div className={styles.itemText}>
              <h3 className={styles.itemTitle}>
                {t("settings.links.privacy.title", "Privacy policy")}
              </h3>
              <p className={styles.itemDescription}>
                {t(
                  "settings.links.privacy.description",
                  "Review how we collect, store, and protect your data."
                )}
              </p>
            </div>
            <div className={styles.itemActions}>
              <Button asChild variant="outline" className={styles.linkButton}>
                {PRIVACY_IS_EXTERNAL ? (
                  <a href={PRIVACY_HREF} target="_blank" rel="noreferrer">
                    {t("settings.links.privacy.button", "View policy")}
                  </a>
                ) : (
                  <Link href={PRIVACY_HREF}>
                    {t("settings.links.privacy.button", "View policy")}
                  </Link>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="account-settings">
        <h2 id="account-settings" className={styles.sectionTitle}>
          {t("settings.section.account", "Account")}
        </h2>
        <div className={styles.sectionList}>
          <div className={styles.item}>
            <div className={styles.itemText}>
              <h3 className={styles.itemTitle}>
                {t("settings.actions.logout.title", "Log out")}
              </h3>
              <p className={styles.itemDescription}>
                {t(
                  "settings.actions.logout.description",
                  "Leave the dashboard securely and sign in again when you're ready."
                )}
                {userEmail ? (
                  <span className={styles.meta}>
                    {t(
                      "settings.actions.logout.meta",
                      "Signed in as {email}"
                    ).replace("{email}", userEmail)}
                  </span>
                ) : null}
              </p>
            </div>
            <div className={styles.itemActions}>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={hasPendingAction}
              >
                {isLogoutPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {isLogoutPending
                  ? processingLabel
                  : t("settings.actions.logout.button", "Log out")}
              </Button>
            </div>
          </div>

          <div className={styles.item}>
            <div className={styles.itemText}>
              <h3 className={styles.itemTitle}>
                {t("settings.actions.delete.title", "Delete account")}
              </h3>
              <p className={styles.itemDescription}>
                {t(
                  "settings.actions.delete.description",
                  "Permanently remove your profile and associated data. This action cannot be undone."
                )}
              </p>
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <div className={styles.itemActions}>
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={hasPendingAction}>
                    {t("settings.actions.delete.button", "Delete account")}
                  </Button>
                </DialogTrigger>
              </div>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t(
                      "settings.actions.delete.confirmTitle",
                      "Delete your account?"
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {t(
                      "settings.actions.delete.confirmDescription",
                      "This will remove your data permanently. You will lose access to all workspaces connected to this email."
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isDeletePending}>
                      {t("settings.actions.delete.confirmCancel", "Cancel")}
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeletePending}
                  >
                    {isDeletePending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {isDeletePending
                      ? processingLabel
                      : t(
                          "settings.actions.delete.confirmConfirm",
                          "Yes, delete account"
                        )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
}
