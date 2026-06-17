import type { AppHeaderSearchDataGroup } from "@rfdtech/components";
import { gslMembers, type GslMember } from "./demoHomeMembers";

export function buildSearchResults(query: string): AppHeaderSearchDataGroup[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const matched: { value: string; label: string; onSelect: () => void }[] = gslMembers
    .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    .slice(0, 5)
    .map((m) => ({
      value: `member-${m.id}`,
      label: `${m.name} — ${m.email}`,
      onSelect: () => console.log(`Selected: ${m.name}`),
    }));

  const pages = [
    { value: "dashboard", label: "Dashboard" },
    { value: "members", label: "Members" },
    { value: "examinations", label: "Examinations" },
    { value: "candidates", label: "Candidates" },
    { value: "institutions", label: "Institutions" },
    { value: "item-bank", label: "Item Bank" },
    { value: "moderation", label: "Moderation" },
    { value: "results", label: "Results" },
    { value: "certificates", label: "Certificates" },
    { value: "roles", label: "Roles & Access" },
    { value: "permissions", label: "Permissions" },
    { value: "audit-trail", label: "Audit Trail" },
    { value: "billing", label: "Billing" },
    { value: "archives", label: "Archives" },
    { value: "analytics", label: "Analytics Overview" },
    { value: "reports", label: "Reports" },
    { value: "alerts", label: "Alerts" },
    { value: "messages", label: "Messages" },
    { value: "api-keys", label: "API Keys" },
    { value: "webhooks", label: "Webhooks" },
    { value: "system-logs", label: "System Logs" },
    { value: "help", label: "Help Center" },
    { value: "regions", label: "Regions" },
  ].filter((p) => p.label.toLowerCase().includes(q));

  const groups: AppHeaderSearchDataGroup[] = [];
  if (pages.length > 0) groups.push({ heading: "Pages", items: pages });
  if (matched.length > 0) groups.push({ heading: "Members", items: matched });
  return groups;
}
