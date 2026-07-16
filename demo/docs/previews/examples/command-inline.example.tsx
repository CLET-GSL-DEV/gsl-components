import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@rfdtech/components";

type MockItem = { value: string; label: string };

const MOCK_CONTACT: MockItem[] = [
  { value: "email", label: "Email" },
  { value: "name", label: "Full name" },
  { value: "phone", label: "Phone number" },
];

const MOCK_ORG: MockItem[] = [
  { value: "company", label: "Company name" },
  { value: "address", label: "Street address" },
];

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

export function CommandInlineExample() {
  const [search, setSearch] = useState("");
  const [field, setField] = useState<string>("email");
  const contact = useMockGroupFetch(search, MOCK_CONTACT, 350);
  const organization = useMockGroupFetch(search, MOCK_ORG, 700);
  const hasSearch = Boolean(search.trim());
  const anyLoading = contact.loading || organization.loading;
  const totalResults = contact.results.length + organization.results.length;
  const showEmpty = hasSearch && !anyLoading && totalResults === 0;

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 360, width: "100%" }}>
      <Command label="Field picker" shouldFilter={false}>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search fields..."
          aria-label="Search fields"
        />
        {hasSearch ? (
          <CommandList>
            {showEmpty ? <CommandEmpty>No results.</CommandEmpty> : null}
            <CommandGroup
              heading="Contact fields"
              loading={contact.loading}
              loadingLabel="Loading contact fields"
            >
              {contact.results.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => setField(item.value)}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup
              heading="Organization"
              loading={organization.loading}
              loadingLabel="Loading organization fields"
            >
              {organization.results.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => setField(item.value)}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        ) : null}
      </Command>
      <p style={{ margin: 0, fontSize: 14, color: "var(--clet-text-secondary)" }}>
        Selected field: <strong style={{ color: "var(--clet-text)" }}>{field}</strong>
      </p>
    </div>
  );
}
