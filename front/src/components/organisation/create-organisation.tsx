"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n/use-translations";
import * as API from "@/lib/api";

import styles from "./create-organisation.module.css";

export default function CreateOrganisation() {
  const { t } = useTranslations("organisation");
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError(
        t("create.errors.required", "Enter a name to create your organisation.")
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await API.createOrganisation(trimmed);
      router.refresh();
    } catch (err) {
      let message = t(
        "create.errors.generic",
        "We couldn't create your organisation. Please try again."
      );

      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.message) {
            message = parsed.message;
          }
        } catch {
          // Ignore parsing issues; fallback message already set
        }
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            {t("create.title", "Create your organisation")}
          </h1>
          <p className={styles.subtitle}>
            {t(
              "create.subtitle",
              "Choose a name to finalise your workspace and invite the rest of your team."
            )}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="organisation-name">
            {t("create.nameLabel", "Organisation name")}
            <Input
              id="organisation-name"
              name="organisationName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("create.namePlaceholder", "LinBolt Team")}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "create-org-error" : undefined}
              maxLength={120}
              autoComplete="organization"
              autoFocus
              className={styles.input}
            />
          </label>

          {error ? (
            <p className={styles.error} role="alert" id="create-org-error">
              {error}
            </p>
          ) : (
            <p className={styles.note}>
              {t(
                "create.note",
                "You can update this later in the workspace settings."
              )}
            </p>
          )}

          <div className={styles.actions}>
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || name.trim() === ""}
            >
              {isSubmitting
                ? t("create.actions.loading", "Creating...")
                : t("create.actions.submit", "Create organisation")}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
