import { useCallback, useEffect, useState } from "react";
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  useDialogSearchParam,
} from "@rfdtech/components";

type MockItem = { value: string; label: string };

const MOCK_NAV: MockItem[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "users", label: "Users" },
];

const MOCK_ACTIONS: MockItem[] = [{ value: "sign-out", label: "Sign out" }];

function filterItems(query: string, items: readonly MockItem[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(normalized) ||
      item.value.toLowerCase().includes(normalized),
  );
}

function useMockGroupFetch(
  query: string,
  items: readonly MockItem[],
  delayMs: number,
) {
  const [results, setResults] = useState<MockItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      setResults(filterItems(normalized, items));
      setLoading(false);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, items, delayMs]);

  return { results, loading };
}

export function CommandDialogExample() {
  const { open, onOpenChange, openWith } = useDialogSearchParam("command-menu");
  const [search, setSearch] = useState("");
  const [lastAction, setLastAction] = useState("Open the command menu");
  const navigation = useMockGroupFetch(search, MOCK_NAV, 350);
  const actions = useMockGroupFetch(search, MOCK_ACTIONS, 700);
  const hasSearch = Boolean(search.trim());
  const anyLoading = navigation.loading || actions.loading;
  const totalResults = navigation.results.length + actions.results.length;
  const showEmpty = hasSearch && !anyLoading && totalResults === 0;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        setSearch("");
      }
    },
    [onOpenChange],
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Button variant="secondary" onClick={() => openWith()}>
        Open command menu
      </Button>
      <p style={{ margin: 0, fontSize: 14, color: "var(--clet-text-secondary)" }}>
        Press <kbd>Cmd</kbd>+<kbd>K</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd>.{" "}
        {lastAction}
      </p>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        shortcut
        label="Command menu"
        shouldFilter={false}
      >
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Type a command..."
          aria-label="Command search"
        />
        {hasSearch ? (
          <CommandList>
            {showEmpty ? <CommandEmpty>No results found.</CommandEmpty> : null}
            <CommandGroup
              heading="Navigation"
              loading={navigation.loading}
              loadingLabel="Loading navigation"
            >
              {navigation.results.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    setLastAction(`Navigated to ${item.label}`);
                    handleOpenChange(false);
                  }}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup
              heading="Actions"
              loading={actions.loading}
              loadingLabel="Loading actions"
            >
              {actions.results.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    setLastAction(
                      item.value === "sign-out" ? "Signed out" : item.label,
                    );
                    handleOpenChange(false);
                  }}
                >
                  {item.label}
                  {item.value === "sign-out" ? (
                    <CommandShortcut>
                      <span>⌘</span>
                      <span>Q</span>
                    </CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        ) : null}
      </CommandDialog>
    </div>
  );
}
