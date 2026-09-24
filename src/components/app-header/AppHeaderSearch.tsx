import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { Search } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../command/Command";
import type { AppHeaderSearchProps } from "../../types/app-header";
import { cn } from "../../utils/cn";
import { useDebounce } from "../../hooks";
import "./styles/app-header.css";

export const AppHeaderSearch = forwardRef<
  HTMLInputElement,
  AppHeaderSearchProps
>(function AppHeaderSearch(
  {
    className,
    placeholder = "Search...",
    data,
    onSearch,
    showEmpty = false,
    emptyLabel = "No results",
    label = "Search",
    children,
    collapsible = false,
    collapsed: collapsedProp,
    defaultCollapsed = true,
    onCollapsedChange,
    expandLabel = "Open search",
  },
  ref,
) {
  const [search, setSearch] = useState("");
  const hasSearch = Boolean(search.trim());
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onSearch?.(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultCollapsed);
  const collapsed = collapsible
    ? (collapsedProp ?? uncontrolledCollapsed)
    : false;

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (collapsedProp === undefined) {
        setUncontrolledCollapsed(next);
      }
      onCollapsedChange?.(next);
    },
    [collapsedProp, onCollapsedChange],
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
    },
    [ref],
  );

  useEffect(() => {
    if (collapsible && !collapsed) {
      inputRef.current?.focus();
    }
  }, [collapsible, collapsed]);

  const collapse = useCallback(() => {
    setSearch("");
    setCollapsed(true);
  }, [setCollapsed]);

  const expandedRef = useRef<HTMLDivElement | null>(null);
  const blurTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (blurTimer.current !== null) {
        window.clearTimeout(blurTimer.current);
      }
    },
    [],
  );

  // Collapse back to the icon button when focus leaves the expanded field.
  // Deferred by a tick so a result click (mousedown blurs before click)
  // still lands on its item instead of an unmounted list.
  const handleExpandedBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
        return;
      }
      if (blurTimer.current !== null) {
        window.clearTimeout(blurTimer.current);
      }
      blurTimer.current = window.setTimeout(() => {
        blurTimer.current = null;
        if (
          expandedRef.current &&
          !expandedRef.current.contains(document.activeElement)
        ) {
          collapse();
        }
      }, 0);
    },
    [collapse],
  );

  const groupElements = useMemo(() => {
    if (!data) return null;
    return data.map((group, gi) => (
      <CommandGroup
        key={group.heading ?? `group-${gi}`}
        heading={group.heading}
        loading={group.loading}
        loadingLabel={group.loadingLabel}
      >
        {group.items.map((item) => (
          <CommandItem
            key={item.value}
            value={item.value}
            onSelect={item.onSelect}
          >
            {item.label}
          </CommandItem>
        ))}
      </CommandGroup>
    ));
  }, [data]);

  const hasAnyItems = data?.some((g) => g.items.length > 0) ?? false;
  const hasAnyLoading = data?.some((g) => g.loading) ?? false;
  const shouldShowEmpty =
    showEmpty && hasSearch && data && !hasAnyItems && !hasAnyLoading;

  const field = (
    <Command
      label={label}
      shouldFilter={false}
      className={cn(
        "clet-app-header-search gsl-app-header-search",
        !collapsible && className,
      )}
    >
      <CommandInput
        ref={setRefs}
        value={search}
        onValueChange={setSearch}
        placeholder={placeholder}
        aria-label={label}
      />
      {hasSearch && data ? (
        <CommandList>
          {groupElements}
          {shouldShowEmpty && <CommandEmpty>{emptyLabel}</CommandEmpty>}
          {children}
        </CommandList>
      ) : null}
    </Command>
  );

  if (!collapsible) {
    return field;
  }

  if (collapsed) {
    return (
      <button
        type="button"
        className={cn(
          "clet-app-header-search__trigger gsl-app-header-search__trigger",
          className,
        )}
        aria-label={expandLabel}
        aria-expanded={false}
        onClick={() => setCollapsed(false)}
      >
        <Search size={18} strokeWidth={1.5} aria-hidden />
      </button>
    );
  }

  return (
    <div
      ref={expandedRef}
      className={cn(
        "clet-app-header-search__expanded gsl-app-header-search__expanded",
        className,
      )}
      onBlur={handleExpandedBlur}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          collapse();
        }
      }}
    >
      {field}
    </div>
  );
});

(AppHeaderSearch as unknown as { componentId: string }).componentId = "AppHeaderSearch";
