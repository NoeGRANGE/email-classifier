export type CategoryActionWithType<T extends CategoryActionType> = CategoryAction & {
  type: T;
};

export type CategoryActionDialogComponentProps<
  T extends CategoryActionType
> = {
  action: CategoryActionWithType<T>;
  onSubmit: (action: CategoryActionWithType<T>) => void;
  onCancel: () => void;
};

export function getActionProps(action: CategoryAction): Record<string, unknown> {
  const { props } = action;
  if (props && typeof props === "object" && !Array.isArray(props)) {
    return props as Record<string, unknown>;
  }

  return {};
}
