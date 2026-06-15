import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@rfdtech/components";
import { Copy, Pencil, Trash2 } from "lucide-react";

const menuItems = [
  { label: "Edit", icon: Pencil },
  { label: "Duplicate", icon: Copy },
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
        className="gsl-popover--menu"
      >
        <div className="gsl-popover__menu" role="menu">
          {menuItems.map(({ label, icon: Icon, destructive }) => (
            <PopoverClose asChild key={label}>
              <button
                type="button"
                className={[
                  "gsl-popover__menu-item",
                  destructive ? "gsl-popover__menu-item--destructive" : "",
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
