import { useState } from "react";
import {
  Button,
  Checkbox,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@rfdtech/components";

const filterOptions = [
  { id: "published", label: "Published only" },
  { id: "drafts", label: "Include drafts" },
  { id: "archived", label: "Include archived" },
  { id: "assigned", label: "Assigned to me" },
  { id: "mentions", label: "Mentions me" },
  { id: "recent", label: "Updated in last 7 days" },
];

export function SheetExample() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, boolean>>({
    published: true,
    drafts: false,
    archived: false,
    assigned: true,
    mentions: false,
    recent: true,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">Open filters</Button>
      </SheetTrigger>
      <SheetPortal>
        <SheetOverlay />
        <SheetContent side="right" showCloseButton>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine the list below. Changes apply when you click Apply.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div style={{ display: "grid", gap: 12 }}>
              {filterOptions.map(({ id, label }) => (
                <Checkbox
                  key={id}
                  label={label}
                  checked={filters[id]}
                  onCheckedChange={(checked) =>
                    setFilters((current) => ({ ...current, [id]: checked }))
                  }
                />
              ))}
            </div>
          </SheetBody>
          <SheetFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({
                  published: true,
                  drafts: false,
                  archived: false,
                  assigned: false,
                  mentions: false,
                  recent: false,
                });
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setOpen(false)}>Apply</Button>
          </SheetFooter>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}
