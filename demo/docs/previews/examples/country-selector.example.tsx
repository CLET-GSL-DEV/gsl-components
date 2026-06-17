import { CountrySelector } from "@rfdtech/components";

export function CountrySelectorExample() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
      <CountrySelector />
      <CountrySelector invalid />
      <CountrySelector disabled />
    </div>
  );
}
