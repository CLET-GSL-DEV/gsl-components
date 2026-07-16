import { Dropdown, ThemeProvider, useTheme } from "@rfdtech/components";
import type { CletTheme } from "@rfdtech/components";

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="demo-theme-toggle">
      <span className="demo-theme-toggle__label">Theme</span>
      <Dropdown
        aria-label="Color theme"
        value={theme}
        onValueChange={(value) => setTheme((value ?? "system") as CletTheme)}
        options={themeOptions}
      />
    </label>
  );
}

export { ThemeProvider };
