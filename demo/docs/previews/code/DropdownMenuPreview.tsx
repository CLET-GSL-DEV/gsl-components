import { DropdownMenu } from "@rfdtech/components";

export function DropdownMenuPreview() {
  return (
    <DropdownMenu
      ariaLabel="Row actions"
      trigger={<span className="demo-menu-trigger">Actions</span>}
      items={[
        { id: "edit", label: "Edit", onSelect: () => console.log("edit") },
        { id: "docs", label: "Docs", href: "/docs" },
        {
          id: "delete",
          label: "Delete",
          onSelect: () => console.log("delete"),
          destructive: true,
        },
      ]}
    />
  );
}
