import type { AppItem } from "@rfdtech/components";

/**
 * Shared 9-app directory used by every AppSwitcher across the demo, so it's
 * consistent (and easy to find/update in one place) app-wide.
 */
export const demoApps: AppItem[] = [
  {
    id: "gov-portal",
    name: "Governance Portal",
    icon: "https://ui-avatars.com/api/?name=Governance+Portal&background=1d4ed8&color=fff&size=96",
    href: "http://178.105.154.224:3001",
  },
  {
    id: "finance-hub",
    name: "Finance Hub",
    icon: "https://ui-avatars.com/api/?name=Finance+Hub&background=047857&color=fff&size=96",
    href: "http://178.105.154.224:3002",
  },
  {
    id: "hr-suite",
    name: "HR Suite",
    icon: "https://ui-avatars.com/api/?name=HR+Suite&background=7c3aed&color=fff&size=96",
  },
  {
    id: "legal-research",
    name: "Legal Research",
    icon: "https://ui-avatars.com/api/?name=Legal+Research&background=b45309&color=fff&size=96",
  },
  {
    id: "case-management",
    name: "Case Management",
    icon: "https://ui-avatars.com/api/?name=Case+Management&background=0e7490&color=fff&size=96",
  },
  {
    id: "training-academy",
    name: "Training Academy",
    icon: "https://ui-avatars.com/api/?name=Training+Academy&background=be185d&color=fff&size=96",
  },
  {
    id: "compliance-center",
    name: "Compliance Center",
    icon: "https://ui-avatars.com/api/?name=Compliance+Center&background=4d7c0f&color=fff&size=96",
  },
  {
    id: "document-vault",
    name: "Document Vault",
    icon: "https://ui-avatars.com/api/?name=Document+Vault&background=475569&color=fff&size=96",
  },
  {
    id: "analytics-suite",
    name: "Analytics Suite",
    icon: "https://ui-avatars.com/api/?name=Analytics+Suite&background=9333ea&color=fff&size=96",
  },
];
