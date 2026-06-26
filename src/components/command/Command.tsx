import { Command as CommandPrimitive } from "cmdk";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Search, XCircle } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandInputProps,
  CommandItemProps,
  CommandListProps,
  CommandLoadingProps,
  CommandProps,
  CommandSeparatorProps,
  CommandShortcutProps,
} from "../../types/command";
import { cn } from "../../utils/cn";
import {
  CommandDialogProvider,
  useCommandDialog,
} from "./CommandDialogContext";
import {
  CommandPopoverProvider,
  useCommandPopover,
} from "./CommandPopoverContext";
import { useCommandShortcut } from "./hooks/useCommandShortcut";
import { formatCommandShortcutLabels } from "./hooks/parseCommandShortcut";
import "./styles/command.css";

export { useCommandDialog } from "./CommandDialogContext";
export { useCommandShortcut } from "./hooks/useCommandShortcut";
export type { UseCommandShortcutOptions } from "./hooks/useCommandShortcut";
export {
  formatCommandShortcutLabels,
  matchesCommandShortcut,
  parseCommandShortcut,
} from "./hooks/parseCommandShortcut";
export type { ParsedCommandShortcut } from "./hooks/parseCommandShortcut";

function resolveInputShortcut(
  shortcut: boolean | string | false | undefined,
  contextShortcut?: string,
) {
  if (shortcut === false) {
    return undefined;
  }

  if (shortcut === true) {
    return "mod+k";
  }

  if (typeof shortcut === "string") {
    return shortcut;
  }

  return contextShortcut;
}

export const Command = forwardRef<HTMLDivElement, CommandProps>(
  function Command({ classNames, className, children, ...props }, ref) {
    const [open, setOpen] = useState(false);
    const inputWrapperRef = useRef<HTMLDivElement | null>(null);
    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const cancelPendingClose = useCallback(() => {
      clearTimeout(blurTimeoutRef.current);
    }, []);

    useEffect(() => {
      const timeout = blurTimeoutRef.current;
      return () => clearTimeout(timeout);
    }, []);

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
        <CommandPopoverProvider
          value={{ isInline: true, open, setOpen, inputWrapperRef, blurTimeoutRef, cancelPendingClose }}
        >
          <CommandPrimitive
            ref={ref}
            className={cn("gsl-command", classNames?.root, className)}
            {...props}
          >
            {children}
          </CommandPrimitive>
        </CommandPopoverProvider>
      </PopoverPrimitive.Root>
    );
  },
);

export const CommandDialog = forwardRef<HTMLDivElement, CommandDialogProps>(
  function CommandDialog(
    {
      classNames,
      className,
      overlayClassName,
      contentClassName,
      shortcut,
      open: openProp,
      defaultOpen,
      onOpenChange,
      children,
      ...props
    },
    ref,
  ) {
    const hasShortcut = shortcut !== undefined && shortcut !== false;
    const shortcutValue =
      shortcut === true
        ? "mod+k"
        : typeof shortcut === "string"
          ? shortcut
          : "mod+k";
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const resolvedOpen = isControlled ? openProp : internalOpen;

    const handleOpenChange = useCallback(
      (nextOpen: boolean) => {
        if (!isControlled) {
          setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
      [isControlled, onOpenChange],
    );

    const toggleOpen = useCallback(() => {
      handleOpenChange(!resolvedOpen);
    }, [handleOpenChange, resolvedOpen]);

    useCommandShortcut(toggleOpen, {
      shortcut: shortcutValue,
      enabled: hasShortcut,
    });

    const dialogOpenProps = hasShortcut
      ? { open: resolvedOpen, onOpenChange: handleOpenChange }
      : { open: openProp, defaultOpen, onOpenChange };

    return (
      <CommandPrimitive.Dialog
        ref={ref}
        className={cn(
          "gsl-command",
          "gsl-command--dialog",
          classNames?.dialog,
          className,
        )}
        overlayClassName={cn(
          "gsl-command-dialog__overlay",
          classNames?.overlay,
          overlayClassName,
        )}
        contentClassName={cn(
          "gsl-command-dialog__content",
          classNames?.content,
          contentClassName,
        )}
        {...dialogOpenProps}
        {...props}
      >
        {hasShortcut ? (
          <CommandDialogProvider inputShortcut={shortcutValue}>
            {children}
          </CommandDialogProvider>
        ) : (
          children
        )}
      </CommandPrimitive.Dialog>
    );
  },
);

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  function CommandInput({ classNames, className, shortcut, ...props }, ref) {
    const popover = useCommandPopover();
    const dialogContext = useCommandDialog();
    const resolvedShortcut = resolveInputShortcut(
      shortcut,
      dialogContext?.inputShortcut,
    );
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [hasValue, setHasValue] = useState(false);
    const shortcutLabels = useMemo(
      () =>
        resolvedShortcut ? formatCommandShortcutLabels(resolvedShortcut) : [],
      [resolvedShortcut],
    );

    const handleFocus = useCallback(() => {
      if (popover?.isInline) {
        popover.cancelPendingClose();
        popover.setOpen(true);
      }
    }, [popover]);

    const handleBlur = useCallback(() => {
      if (popover?.isInline && popover.blurTimeoutRef) {
        popover.blurTimeoutRef.current = setTimeout(() => {
          popover.setOpen(false);
        }, 150);
      }
    }, [popover]);

    const input = (
      <>
        <Search
          className="gsl-command__input-icon"
          aria-hidden="true"
          size={16}
          strokeWidth={2}
        />
        <CommandPrimitive.Input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          className={cn("gsl-command__input", classNames?.input, className)}
          onInput={(e) => setHasValue((e.target as HTMLInputElement).value.length > 0)}
          {...props}
        />
        {hasValue && (
          <div
            className="gsl-command__input-clear"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = "";
                inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                inputRef.current.focus();
                setHasValue(false);
              }
            }}
            aria-label="Clear search"
          >
            <XCircle size={16} strokeWidth={1.5} aria-hidden />
          </div>
        )}
        {!hasValue && shortcutLabels.length > 0 ? (
          <kbd className="gsl-command__input-shortcut" aria-hidden="true">
            {shortcutLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="gsl-command__shortcut-key"
              >
                {label}
              </span>
            ))}
          </kbd>
        ) : null}
      </>
    );

    if (popover?.isInline) {
      return (
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={popover.inputWrapperRef}
            className={cn(
              "gsl-command__input-wrapper",
              classNames?.wrapper,
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {input}
          </div>
        </PopoverPrimitive.Anchor>
      );
    }

    return (
      <div
        className={cn("gsl-command__input-wrapper", classNames?.wrapper)}
      >
        {input}
      </div>
    );
  },
);

export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  function CommandList({ classNames, className, children, ...props }, ref) {
    const popover = useCommandPopover();

    if (popover?.isInline) {
      return (
        <PopoverPrimitive.Content
            className="gsl-command__popover"
            sideOffset={4}
            align="start"
            forceMount
            data-testid="command-popover"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDown={() => popover.cancelPendingClose()}
            onPointerDownOutside={() => {
              popover.setOpen(false);
            }}
          >
            <CommandPrimitive.List
              ref={ref}
              className={cn(
                "gsl-command__list",
                classNames?.list,
                className,
              )}
              {...props}
            >
              {children}
            </CommandPrimitive.List>
          </PopoverPrimitive.Content>
      );
    }

    return (
      <CommandPrimitive.List
        ref={ref}
        className={cn("gsl-command__list", classNames?.list, className)}
        {...props}
      >
        {children}
      </CommandPrimitive.List>
    );
  },
);

export const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  function CommandEmpty({ classNames, className, children, ...props }, ref) {
    return (
      <CommandPrimitive.Empty
        ref={ref}
        className={cn("gsl-command__empty", classNames?.empty, className)}
        {...props}
      >
        {children}
      </CommandPrimitive.Empty>
    );
  },
);

export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  function CommandGroup(
    {
      classNames,
      className,
      children,
      loading = false,
      loadingLabel = "Loading...",
      ...props
    },
    ref,
  ) {
    return (
      <CommandPrimitive.Group
        ref={ref}
        className={cn("gsl-command__group", classNames?.group, className)}
        {...props}
      >
        {loading ? (
          <div
            className={cn(
              "gsl-command__group-loading",
              classNames?.groupLoading,
            )}
            role="status"
            aria-label={loadingLabel}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="gsl-command__skeleton">
                <div className="gsl-command__skeleton-line" />
              </div>
            ))}
          </div>
        ) : (
          children
        )}
      </CommandPrimitive.Group>
    );
  },
);

export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  function CommandItem({ classNames, className, children, ...props }, ref) {
    return (
      <CommandPrimitive.Item
        ref={ref}
        className={cn("gsl-command__item", classNames?.item, className)}
        {...props}
      >
        {children}
      </CommandPrimitive.Item>
    );
  },
);

export const CommandShortcut = forwardRef<HTMLElement, CommandShortcutProps>(
  function CommandShortcut({ classNames, className, children }, ref) {
    return (
      <kbd
        ref={ref}
        className={cn("gsl-command__shortcut", classNames?.shortcut, className)}
      >
        {children}
      </kbd>
    );
  },
);

export const CommandSeparator = forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(function CommandSeparator({ classNames, className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("gsl-command__separator", classNames?.separator, className)}
      {...props}
    />
  );
});

export const CommandLoading = forwardRef<HTMLDivElement, CommandLoadingProps>(
  function CommandLoading({ classNames, className, children, ...props }, ref) {
    return (
      <CommandPrimitive.Loading
        ref={ref}
        className={cn("gsl-command__loading", classNames?.loading, className)}
        {...props}
      >
        {children}
      </CommandPrimitive.Loading>
    );
  },
);
