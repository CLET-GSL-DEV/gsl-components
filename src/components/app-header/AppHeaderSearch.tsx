import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  },
  ref,
) {
  const [search, setSearch] = useState("");
  const hasSearch = Boolean(search.trim());
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onSearch?.(debouncedSearch);
  }, [debouncedSearch, onSearch]);

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

  return (
    <Command
      label={label}
      shouldFilter={false}
      className={cn("clet-app-header-search gsl-app-header-search", className)}
    >
      <CommandInput
        ref={ref}
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
});

(AppHeaderSearch as unknown as { componentId: string }).componentId = "AppHeaderSearch";
