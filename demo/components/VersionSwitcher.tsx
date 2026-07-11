import { Dropdown } from "@rfdtech/components";
import { useNavigate } from "react-router-dom";
import { packageVersion } from "demo/docs/site-meta";

// Last v1 release before the 2.0.0 new-design-system rebrand (see CHANGELOG.md)
const LEGACY_VERSION = "1.22.0";

interface VersionSwitcherProps {
  active: "current" | "legacy";
}

/**
 * Lets the main dashboard jump between the current (new design system) look
 * at "/" and the previous version at "/legacy", for comparison.
 */
export function VersionSwitcher({ active }: VersionSwitcherProps) {
  const navigate = useNavigate();

  return (
    <Dropdown
      value={active}
      onValueChange={(value) => {
        if (value === "legacy") {
          navigate("/legacy");
        } else {
          navigate("/");
        }
      }}
      options={[
        { value: "current", label: `v${packageVersion}` },
        { value: "legacy", label: `v${LEGACY_VERSION}` },
      ]}
      clearable={false}
      aria-label="Design system version"
    />
  );
}
