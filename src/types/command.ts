import type { Command as CommandPrimitive } from "cmdk";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface CommandClassNames {
  root?: string;
}

export interface CommandDialogClassNames {
  dialog?: string;
  overlay?: string;
  content?: string;
}

export interface CommandInputClassNames {
  wrapper?: string;
  input?: string;
}

export interface CommandListClassNames {
  list?: string;
}

export interface CommandEmptyClassNames {
  empty?: string;
}

export interface CommandGroupClassNames {
  group?: string;
  groupLoading?: string;
}

export interface CommandItemClassNames {
  item?: string;
}

export interface CommandSeparatorClassNames {
  separator?: string;
}

export interface CommandLoadingClassNames {
  loading?: string;
}

export interface CommandShortcutClassNames {
  shortcut?: string;
}

type CommandRootProps = ComponentPropsWithoutRef<typeof CommandPrimitive>;

export interface CommandProps extends CommandRootProps {
  classNames?: CommandClassNames;
  className?: string;
}

export interface CommandDialogProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Dialog> {
  classNames?: CommandDialogClassNames;
  className?: string;
  shortcut?: boolean | string;
}

export interface CommandInputProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  classNames?: CommandInputClassNames;
  className?: string;
  /** Display shortcut badge in the input. `false` hides; inherits from CommandDialog context when omitted. */
  shortcut?: boolean | string | false;
}

export interface CommandListProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.List> {
  classNames?: CommandListClassNames;
  className?: string;
}

export interface CommandEmptyProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {
  classNames?: CommandEmptyClassNames;
  className?: string;
}

export interface CommandGroupProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {
  classNames?: CommandGroupClassNames;
  className?: string;
  /** Shows a line loader inside the group; children are hidden while true. */
  loading?: boolean;
  /** Screen reader label while loading. */
  loadingLabel?: string;
}

export interface CommandItemProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  classNames?: CommandItemClassNames;
  className?: string;
}

export interface CommandSeparatorProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> {
  classNames?: CommandSeparatorClassNames;
  className?: string;
}

export interface CommandLoadingProps
  extends ComponentPropsWithoutRef<typeof CommandPrimitive.Loading> {
  classNames?: CommandLoadingClassNames;
  className?: string;
  children: ReactNode;
}

export interface CommandShortcutProps {
  classNames?: CommandShortcutClassNames;
  className?: string;
  children: ReactNode;
}
