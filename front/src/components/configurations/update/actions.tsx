"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  ReplyAll,
  Tag,
  Send,
  FolderInput,
  Settings2,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "@/i18n/use-translations";

import AssignCategoriesActionDialog from "./action-dialogs/assign-categories-dialog";
import ForwardToActionDialog from "./action-dialogs/forward-to-dialog";
import MoveToFolderActionDialog from "./action-dialogs/move-to-folder-dialog";
import ReplyWithMessageActionDialog from "./action-dialogs/reply-with-message-dialog";
import styles from "./actions.module.css";
import { CategoryActionWithType } from "./action-dialogs/types";

type Props = {
  actions: CategoryAction[];
  setActions: React.Dispatch<React.SetStateAction<CategoryAction[]>>;
};

const FALLBACK_TYPE_LABELS: Record<CategoryActionType, string> = {
  assign_categories: "Assign category",
  move_to_folder: "Move to folder",
  forward_to: "Forward to",
  reply_with_message: "Reply with a message",
};

const ACTION_TYPES: { name: CategoryActionType; logo: React.ElementType }[] = [
  { name: "assign_categories", logo: Tag },
  { name: "move_to_folder", logo: FolderInput },
  { name: "forward_to", logo: Send },
  { name: "reply_with_message", logo: ReplyAll },
];

export default function CategoryUpdateActions({ actions, setActions }: Props) {
  const { t } = useTranslations("configurations");
  const [openedActionId, setOpenedActionId] = React.useState<number | null>(
    null
  );
  const [draftAction, setDraftAction] = React.useState<CategoryAction | null>(
    null
  );

  const activeAction = React.useMemo(
    () => {
      if (draftAction && draftAction.id === openedActionId) {
        return draftAction;
      }

      if (openedActionId === null) return null;

      return actions.find((action) => action.id === openedActionId) ?? null;
    },
    [actions, draftAction, openedActionId]
  );

  const title = t("category.actions.title", "Configured actions");
  const subtitle = t(
    "category.update.actions.subtitle",
    "Pick the action that should run for emails in this category."
  );
  const emptyLabel = t("category.actions.empty", "No actions configured yet.");
  const addLabel = t("category.actions.add", "Add action");
  const addAriaLabel = t("category.actions.add.aria", "Add a new action");
  const manageAriaLabel = t("category.actions.manage.aria", "Manage action");
  const removeAriaLabel = t(
    "category.actions.removeAction",
    "Remove action"
  );

  const handleManageClick = React.useCallback((actionId: number) => {
    setDraftAction(null);
    setOpenedActionId(actionId);
  }, []);

  const handleDialogClose = React.useCallback(() => {
    setOpenedActionId(null);
    setDraftAction(null);
  }, []);

  const handleDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        handleDialogClose();
      }
    },
    [handleDialogClose]
  );

  const handleDialogSubmit = React.useCallback(
    (nextAction: CategoryAction) => {
      setActions((prev) => {
        const existingIndex = prev.findIndex(
          (action) => action.id === nextAction.id
        );

        if (existingIndex === -1) {
          return [...prev, nextAction];
        }

        return prev.map((action) =>
          action.id === nextAction.id ? nextAction : action
        );
      });
      handleDialogClose();
    },
    [handleDialogClose, setActions]
  );

  const getActionTypeLabel = React.useCallback(
    (actionType: CategoryActionType) =>
      t(
        `category.actions.types.${actionType}`,
        FALLBACK_TYPE_LABELS[actionType]
      ),
    [t]
  );

  const handleCreateAction = React.useCallback(
    (actionType: CategoryActionType) => {
      const existingActions = draftAction
        ? [...actions, draftAction]
        : actions;
      const minId = existingActions.reduce(
        (acc, item) => Math.min(acc, item.id),
        0
      );
      const nextId = minId > 0 ? -1 : minId - 1;
      const nextAction: CategoryAction = {
        id: nextId,
        type: actionType,
        props: {},
      };
      setDraftAction(nextAction);
      setOpenedActionId(nextId);
    },
    [actions, draftAction]
  );

  const handleDeleteAction = React.useCallback(
    (actionId: number) => {
      setActions((prev) => prev.filter((action) => action.id !== actionId));
      if (draftAction && draftAction.id === actionId) {
        setDraftAction(null);
      }
      if (openedActionId === actionId) {
        setOpenedActionId(null);
      }
    },
    [draftAction, openedActionId, setActions]
  );

  const dialogContent = React.useMemo(() => {
    if (!activeAction) return null;

    switch (activeAction.type) {
      case "assign_categories":
        return (
          <AssignCategoriesActionDialog
            action={activeAction as CategoryActionWithType<"assign_categories">}
            onCancel={handleDialogClose}
            onSubmit={handleDialogSubmit}
          />
        );
      case "move_to_folder":
        return (
          <MoveToFolderActionDialog
            action={activeAction as CategoryActionWithType<"move_to_folder">}
            onCancel={handleDialogClose}
            onSubmit={handleDialogSubmit}
          />
        );
      case "forward_to":
        return (
          <ForwardToActionDialog
            action={activeAction as CategoryActionWithType<"forward_to">}
            onCancel={handleDialogClose}
            onSubmit={handleDialogSubmit}
          />
        );
      case "reply_with_message":
        return (
          <ReplyWithMessageActionDialog
            action={
              activeAction as CategoryActionWithType<"reply_with_message">
            }
            onCancel={handleDialogClose}
            onSubmit={handleDialogSubmit}
          />
        );
      default:
        return null;
    }
  }, [activeAction, handleDialogClose, handleDialogSubmit]);

  return (
    <section className={styles.field}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <span className="text-sm font-medium text-foreground">{title}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="primary" type="button" aria-label={addAriaLabel}>
                {addLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ACTION_TYPES.map((actionType) => (
                <DropdownMenuItem
                  key={actionType.name}
                  onSelect={() => handleCreateAction(actionType.name)}
                  className={styles.menuItem}
                >
                  <actionType.logo
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  {getActionTypeLabel(actionType.name)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className={styles.description}>{subtitle}</p>
      </div>

      <div className={styles.list}>
        {actions.length === 0 ? (
          <p className={styles.empty}>{emptyLabel}</p>
        ) : (
          actions.map((action) => {
            const typeLabel = getActionTypeLabel(action.type);
            return (
              <div key={action.id} className={styles.item}>
                <span className={styles.type}>{typeLabel}</span>
                <div className={styles.actionButtons}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleManageClick(action.id)}
                    aria-label={`${manageAriaLabel}: ${typeLabel}`}
                    type="button"
                  >
                    <Settings2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAction(action.id)}
                    aria-label={`${removeAriaLabel}: ${typeLabel}`}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog
        open={Boolean(activeAction)}
        onOpenChange={handleDialogOpenChange}
      >
        {dialogContent ? (
          <DialogContent className={styles.dialog}>
            {dialogContent}
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}
