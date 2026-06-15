export interface DocNavItem {
  slug: string;
  title: string;
}

export interface DocNavSection {
  title: string;
  items: DocNavItem[];
}

export const docNavSections: DocNavSection[] = [
  {
    title: "Guide",
    items: [
      { slug: "getting-started", title: "Getting started" },
      { slug: "theme", title: "Theme" },
      { slug: "changelog", title: "Changelog" },
    ],
  },
  {
    title: "Components",
    items: [
      { slug: "app-switcher", title: "AppSwitcher" },
      { slug: "badge", title: "Badge" },
      { slug: "breadcrumb", title: "Breadcrumb" },
      { slug: "bulk-import-modal", title: "BulkImportModal" },
      { slug: "button", title: "Button" },
      { slug: "checkbox", title: "Checkbox" },
      { slug: "command", title: "Command" },
      { slug: "dropdown", title: "Dropdown" },
      { slug: "dialog", title: "Dialog" },
      { slug: "modal", title: "Modal" },
      { slug: "popover", title: "Popover" },
      { slug: "progress-bar", title: "ProgressBar" },
      { slug: "radio-group", title: "RadioGroup" },
      { slug: "sheet", title: "Sheet" },
      { slug: "sidebar", title: "Sidebar" },
      { slug: "tabs", title: "Tabs" },
    ],
  },
];
