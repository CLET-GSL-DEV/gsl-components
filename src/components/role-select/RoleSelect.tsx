import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../dialog/Dialog";
import { Button } from "../button/Button";
import type { Role, RoleSelectProps } from "../../types/role-select";
import { cn } from "../../utils/cn";
import "./styles/role-select.css";

export function RoleSelect({
  title,
  roles,
  selectedRole,
  onClickRole,
  noConfirm = false,
  className,
  style,
}: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const selected = roles.find((role) => role.id === selectedRole) ?? null;

  const handleSelect = (role: Role) => {
    if (role.disabled) return;
    setOpen(false);

    if (noConfirm) {
      onClickRole(role);
      return;
    }

    setPendingRole(role);
  };

  const handleConfirm = () => {
    if (pendingRole) {
      onClickRole(pendingRole);
    }
    setPendingRole(null);
  };

  const handleCancel = () => {
    setPendingRole(null);
  };

  return (
    <div className={cn("clet-role-select gsl-role-select", className)} style={style}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button type="button" className="clet-role-select__trigger gsl-role-select__trigger">
            <span className="clet-role-select__trigger-label gsl-role-select__trigger-label">
              {title ?? "View as"}
            </span>
            <span className="clet-role-select__trigger-value gsl-role-select__trigger-value">
              {selected?.icon && (
                <span className="clet-role-select__trigger-icon gsl-role-select__trigger-icon" aria-hidden>
                  {selected.icon}
                </span>
              )}
              {selected?.name ?? "Select role"}
              <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="clet-role-select__popover gsl-role-select__popover"
            side="bottom"
            align="start"
            sideOffset={4}
            role="menu"
          >
            <ul className="clet-role-select__list gsl-role-select__list">
              {roles.map((role) => {
                const isSelected = role.id === selectedRole;
                return (
                  <li key={role.id}>
                    <button
                      type="button"
                      className={cn(
                        "clet-role-select__item gsl-role-select__item",
                        role.disabled && "clet-role-select__item--disabled gsl-role-select__item--disabled",
                      )}
                      onClick={() => handleSelect(role)}
                      disabled={role.disabled}
                      aria-pressed={isSelected}
                    >
                      <span className="clet-role-select__item-content gsl-role-select__item-content">
                        {role.icon && (
                          <span className="clet-role-select__item-icon gsl-role-select__item-icon" aria-hidden>
                            {role.icon}
                          </span>
                        )}
                        <span className="clet-role-select__name gsl-role-select__name">
                          {role.name}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "clet-role-select__radio gsl-role-select__radio",
                          isSelected && "clet-role-select__radio--selected gsl-role-select__radio--selected",
                        )}
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <Dialog
        open={pendingRole !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRole(null);
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Confirm Role Switch</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to switch to the {pendingRole?.name} portal?
            </DialogDescription>
            <DialogFooter>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirm}>
                Switch
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
