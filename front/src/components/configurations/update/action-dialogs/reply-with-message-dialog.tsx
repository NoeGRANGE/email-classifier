"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  messageText?: unknown;
  replyAll?: unknown;
};

const FALLBACK_DESCRIPTION = "Craft the automatic reply that will be sent.";
const MESSAGE_PLACEHOLDER =
  "Write the automatic reply that will be sent to the sender.";

export default function ReplyWithMessageActionDialog({
  action,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslations("configurations");
  const messageId = React.useId();
  const replyAllId = React.useId();
  const baseProps = React.useMemo<ReplyWithMessageProps>(
    () => getActionProps(action) as ReplyWithMessageProps,
    [action]
  );

  const initialMessage = React.useMemo(() => {
    const rawValue =
      typeof baseProps.messageText === "string"
        ? baseProps.messageText
        : baseProps.message;
    return typeof rawValue === "string" ? rawValue : "";
  }, [baseProps]);

  const preservedSubject = React.useMemo(() => {
    const rawValue = baseProps.subject;
    return typeof rawValue === "string" ? rawValue : undefined;
  }, [baseProps]);

  const initialReplyAll = React.useMemo(() => {
    const rawValue = baseProps.replyAll;
    return typeof rawValue === "boolean" ? rawValue : false;
  }, [baseProps]);

  const [messageValue, setMessageValue] = React.useState(initialMessage);
  const [replyAll, setReplyAll] = React.useState(initialReplyAll);

  React.useEffect(() => {
    setMessageValue(initialMessage);
  }, [initialMessage, action.id]);

  React.useEffect(() => {
    setReplyAll(initialReplyAll);
  }, [initialReplyAll, action.id]);

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
  const replyAllLabel = t(
    "category.actions.dialog.reply_with_message.replyAll",
    "Reply to all recipients"
  );

  const hasMessage = React.useMemo(
    () => messageValue.trim().length > 0,
    [messageValue]
  );

  const handleSave = React.useCallback(() => {
    const trimmedMessage = messageValue.trim();
    const nextProps = { ...baseProps } as Record<string, unknown>;

    if (preservedSubject !== undefined) {
      nextProps.subject = preservedSubject;
    } else {
      delete nextProps.subject;
    }

    nextProps.messageText = trimmedMessage;
    delete nextProps.message;
    nextProps.replyAll = replyAll;

    const nextAction: ReplyWithMessageAction = {
      ...action,
      props: nextProps,
    };

    onSubmit(nextAction);
  }, [action, baseProps, messageValue, onSubmit, preservedSubject, replyAll]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
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
        <div className="flex items-center gap-2">
          <Checkbox
            id={replyAllId}
            checked={replyAll}
            onCheckedChange={(checked) => setReplyAll(Boolean(checked))}
          />
          <Label htmlFor={replyAllId} className="text-sm font-medium">
            {replyAllLabel}
          </Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} type="button">
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          type="button"
          disabled={!hasMessage}
        >
          {saveLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
