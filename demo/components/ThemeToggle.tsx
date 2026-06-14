import { ThemeProvider, useTheme } from "@rfdtech/components";
import type { GslTheme } from "@rfdtech/components";

const themes: GslTheme[] = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="demo-theme-toggle">
      <span className="demo-theme-toggle__label">Theme</span>
      <select
        className="demo-theme-toggle__select"
        value={theme}
        onChange={(event) => setTheme(event.target.value as GslTheme)}
        aria-label="Color theme"
      >
        {themes.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}

export { ThemeProvider };
