import {
  Landmark,
  Wallet,
  Users,
  Scale,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  FolderLock,
  BarChart3,
  Bot,
} from "lucide-react";
import { LaunchpadIconTile } from "@rfdtech/components";
import type { LaunchpadApp } from "@rfdtech/components";

/**
 * Shared 9-app directory used by every Launchpad across the demo, so it's
 * consistent (and easy to find/update in one place) app-wide. Same app list
 * as `demoApps` (used by the legacy `AppSwitcher` demo route), just with
 * `LaunchpadIconTile` glyph tiles instead of image-URL icons.
 */
export const launchpadApps: LaunchpadApp[] = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: (
      <LaunchpadIconTile name="Governance Portal">
        <Landmark size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: (
      <LaunchpadIconTile name="Finance Hub">
        <Wallet size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "hr-suite",
    name: "HR Suite",
    icon: (
      <LaunchpadIconTile name="HR Suite">
        <Users size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "legal-research",
    name: "Legal Research",
    icon: (
      <LaunchpadIconTile name="Legal Research">
        <Scale size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "case-management",
    name: "Case Management",
    icon: (
      <LaunchpadIconTile name="Case Management">
        <Briefcase size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "training-academy",
    name: "Training Academy",
    icon: (
      <LaunchpadIconTile name="Training Academy">
        <GraduationCap size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "compliance-center",
    name: "Compliance Center",
    icon: (
      <LaunchpadIconTile name="Compliance Center">
        <ShieldCheck size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "document-vault",
    name: "Document Vault",
    icon: (
      <LaunchpadIconTile name="Document Vault">
        <FolderLock size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "analytics-suite",
    name: "Analytics Suite",
    icon: (
      <LaunchpadIconTile name="Analytics Suite">
        <BarChart3 size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
  {
    id: "ai-suite",
    name: "AI Suite",
    icon: (
      <LaunchpadIconTile name="AI Suite">
        <Bot size={26} strokeWidth={1.75} />
      </LaunchpadIconTile>
    ),
  },
];
