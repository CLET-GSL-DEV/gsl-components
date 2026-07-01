import { gslMembers } from "./demoHomeMembers";
import { getAllDocSlugs, getDocPage } from "../docs/registry";

export interface SearchItem {
  value: string;
  label: string;
  onSelect: () => void;
}

const PAGES: { value: string; label: string }[] = [
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
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "alerts", label: "Alerts" },
  { value: "messages", label: "Messages" },
  { value: "api-keys", label: "API Keys" },
  { value: "webhooks", label: "Webhooks" },
  { value: "system-logs", label: "System Logs" },
  { value: "help", label: "Help Center" },
  { value: "regions", label: "Regions" },
];

export function buildPageItems(query: string): SearchItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return PAGES
    .filter((p) => p.label.toLowerCase().includes(q))
    .map((p) => ({ ...p, onSelect: () => console.log(`Navigating to ${p.label}`) }));
}

export function buildMemberItems(query: string): SearchItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return gslMembers
    .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    .slice(0, 5)
    .map((m) => ({
      value: `member-${m.id}`,
      label: `${m.name} — ${m.email}`,
      onSelect: () => console.log(`Selected: ${m.name}`),
    }));
}

export function buildDocItems(query: string): SearchItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const slugs = getAllDocSlugs();
  const results: SearchItem[] = [];
  for (const slug of slugs) {
    const page = getDocPage(slug);
    if (!page) continue;
    const title = page.meta.title ?? "";
    const description = page.meta.description ?? "";
    if (title.toLowerCase().includes(q) || description.toLowerCase().includes(q) || slug.toLowerCase().includes(q)) {
      results.push({
        value: slug,
        label: title,
        onSelect: () => {},
      });
    }
  }
  return results;
}
