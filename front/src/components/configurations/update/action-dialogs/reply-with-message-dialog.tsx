"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n/use-translations";

import {
  CategoryActionDialogComponentProps,
  CategoryActionWithType,
  getActionProps,
} from "./types";
import styles from "./dialog.module.css";

type ReplyWithMessageAction = CategoryActionWithType<"reply_with_message">;
type Props = CategoryActionDialogComponentProps<"reply_with_message">;

type ReplyWithMessageProps = {
  subject?: unknown;
  message?: unknown;
};

const FALLBACK_DESCRIPTION = "Craft the automatic reply that will be sent.";
const SUBJECT_PLACEHOLDER = "Thanks for reaching out";
const MESSAGE_PLACEHOLDER =
  "Write the automatic reply that will be sent to the sender.";

export default function ReplyWithMessageActionDialog({
  action,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslations("configurations");
  const subjectId = React.useId();
  const messageId = React.useId();
  const baseProps = React.useMemo<ReplyWithMessageProps>(
    () => getActionProps(action) as ReplyWithMessageProps,
    [action]
  );

  const initialSubject = React.useMemo(() => {
    const rawValue = baseProps.subject;
    return typeof rawValue === "string" ? rawValue : "";
  }, [baseProps]);

  const initialMessage = React.useMemo(() => {
    const rawValue = baseProps.message;
    return typeof rawValue === "string" ? rawValue : "";
  }, [baseProps]);

  const [subjectValue, setSubjectValue] = React.useState(initialSubject);
  const [messageValue, setMessageValue] = React.useState(initialMessage);

  React.useEffect(() => {
    setSubjectValue(initialSubject);
  }, [initialSubject, action.id]);

  React.useEffect(() => {
    setMessageValue(initialMessage);
  }, [initialMessage, action.id]);

  const cancelLabel = t("category.actions.dialog.cancel", "Cancel");
  const saveLabel = t("category.actions.dialog.save", "Save changes");
  const title = t(
    "category.actions.dialog.reply_with_message.title",
    t("category.update.actions.reply_with_message.label", "Reply with message")
  );
  const description = t(
    "category.actions.dialog.reply_with_message.description",
    FALLBACK_DESCRIPTION
  );
  const subjectLabel = t(
    "category.actions.dialog.reply_with_message.subjectLabel",
    "Subject"
  );
  const subjectPlaceholder = t(
    "category.actions.dialog.reply_with_message.subjectPlaceholder",
    SUBJECT_PLACEHOLDER
  );
  const messageLabel = t(
    "category.actions.dialog.reply_with_message.bodyLabel",
    "Message"
  );
  const messagePlaceholder = t(
    "category.actions.dialog.reply_with_message.bodyPlaceholder",
    MESSAGE_PLACEHOLDER
  );
  const helperText = t(
    "category.actions.dialog.reply_with_message.helper",
    "Plain text only for now."
  );

  const handleSave = React.useCallback(() => {
    const nextAction: ReplyWithMessageAction = {
      ...action,
      props: {
        ...baseProps,
        subject: subjectValue.trim(),
        message: messageValue.trim(),
      },
    };

    onSubmit(nextAction);
  }, [action, baseProps, messageValue, onSubmit, subjectValue]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor={subjectId}>{subjectLabel}</Label>
          <Input
            id={subjectId}
            value={subjectValue}
            onChange={(event) => setSubjectValue(event.target.value)}
            placeholder={subjectPlaceholder}
            className={styles.input}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={messageId}>{messageLabel}</Label>
          <Textarea
            id={messageId}
            value={messageValue}
            onChange={(event) => setMessageValue(event.target.value)}
            placeholder={messagePlaceholder}
            rows={5}
            className={styles.textarea}
          />
          <p className="text-muted-foreground text-xs">{helperText}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} type="button">
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={handleSave} type="button">
          {saveLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
