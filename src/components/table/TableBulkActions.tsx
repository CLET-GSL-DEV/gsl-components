import type { TableBulkActionsProps } from "../../types/table";
import { Button } from "../button";
import { cn } from "../../utils/cn";

import { XCircle } from "lucide-react";

export function TableBulkActions({
  selectedIds,
  selectedCount,
  onClear,
  actions,
  renderActions,
  classNames,
  className,
}: TableBulkActionsProps) {
  const count = selectedCount ?? selectedIds.size;

  if (count === 0) return null;

  const hasActions =
    (actions && actions.length > 0) || typeof renderActions === "function";

  return (
    <div className="clet-table__bulk-actions-bar-wrapper gsl-table__bulk-actions-bar-wrapper">
      <div
        className={cn(
          "clet-table__bulk-actions-bar gsl-table__bulk-actions-bar",
          classNames?.root,
          className,
        )}
      >
        <div className="clet-table__bulk-actions-left gsl-table__bulk-actions-left">
          <span
            className={cn("clet-table__bulk-actions-count gsl-table__bulk-actions-count", classNames?.count)}
          >
            Selected {count}
          </span>
          {onClear && (
            <button
              type="button"
              className="clet-table__bulk-actions-clear gsl-table__bulk-actions-clear"
              onClick={onClear}
              aria-label="Clear selection"
            >
              <XCircle size={14} strokeWidth={1.5} />
              <span className="clet__table__bulk-actions-clear-label">
                Clear
              </span>
            </button>
          )}
        </div>
        {hasActions && (
          <div className="clet-table__bulk-actions-group gsl-table__bulk-actions-group">
            {typeof renderActions === "function"
              ? renderActions({ selectedIds })
              : actions
                ? actions.map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant={action.destructive ? "outline" : "secondary"}
                      className={cn(
                        action.destructive &&
                          "clet-table__bulk-actions-action--destructive gsl-table__bulk-actions-action--destructive",
                      )}
                      onClick={() => action.onClick(selectedIds)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))
                : null}
          </div>
        )}
      </div>
    </div>
  );
}
