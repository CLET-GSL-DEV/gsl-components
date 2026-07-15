import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@rfdtech/components";
import { Copy, Pencil, Trash2 } from "lucide-react";

const menuItems = [
  { label: "Edit", icon: Pencil, destructive: false },
  { label: "Duplicate", icon: Copy, destructive: false },
  { label: "Delete", icon: Trash2, destructive: true },
] as const;

export function PopoverExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={4}
        className="clet-popover--menu"
      >
        <div className="clet-popover__menu" role="menu">
          {menuItems.map(({ label, icon: Icon, destructive }) => (
            <PopoverClose asChild key={label}>
              <button
                type="button"
                className={[
                  "clet-popover__menu-item",
                  destructive ? "clet-popover__menu-item--destructive" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="menuitem"
              >
                <Icon size={16} strokeWidth={2} aria-hidden />
                {label}
              </button>
            </PopoverClose>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
