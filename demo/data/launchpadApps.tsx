import { SystemLaunchpadIcon } from "@rfdtech/components";
import type { LaunchpadApp } from "@rfdtech/components";

/**
 * Shared 9-app directory used by every Launchpad across the demo, so it's
 * consistent (and easy to find/update in one place) app-wide. Same app list
 * as `demoApps` (used by the legacy `AppSwitcher` demo route), just with
 * `SystemLaunchpadIcon` tiles instead of image-URL icons.
 */
export const launchpadApps: LaunchpadApp[] = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: <SystemLaunchpadIcon name="Governance Portal" />,
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: <SystemLaunchpadIcon name="Finance Hub" />,
  },
  {
    id: "hr-suite",
    name: "HR Suite",
    icon: <SystemLaunchpadIcon name="HR Suite" />,
  },
  {
    id: "legal-research",
    name: "Legal Research",
    icon: <SystemLaunchpadIcon name="Legal Research" />,
  },
  {
    id: "case-management",
    name: "Case Management",
    icon: <SystemLaunchpadIcon name="Case Management" />,
  },
  {
    id: "training-academy",
    name: "Training Academy",
    icon: <SystemLaunchpadIcon name="Training Academy" />,
  },
  {
    id: "compliance-center",
    name: "Compliance Center",
    icon: <SystemLaunchpadIcon name="Compliance Center" />,
  },
  {
    id: "document-vault",
    name: "Document Vault",
    icon: <SystemLaunchpadIcon name="Document Vault" />,
  },
  {
    id: "analytics-suite",
    name: "Analytics Suite",
    icon: <SystemLaunchpadIcon name="Analytics Suite" />,
  },
  {
    id: "ai-suite",
    name: "AI Suite",
    icon: <SystemLaunchpadIcon name="A I" />,
  },
];
