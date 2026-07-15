import { useCallback, useMemo, useState } from "react";
import { Download, FileCode2, FileSpreadsheet, Printer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../button/Button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
} from "../popover/Popover";
import type {
  ExportButtonProps,
  ExportFormat,
} from "../../types/export-button";
import {
  exportToCsv,
  exportToXlsx,
  exportToPdf,
  formatFilenameTimestamp,
} from "../../utils/export";
import { cn } from "../../utils/cn";

const FORMAT_CONFIG: Record<ExportFormat, { label: string; icon: LucideIcon }> = {
  csv: { label: "Export as CSV", icon: FileCode2 },
  xlsx: { label: "Export as Excel", icon: FileSpreadsheet },
  pdf: { label: "Export as PDF", icon: Printer },
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ExportButton<T>({
  data,
  columns,
  title,
  filename,
  filtersDescription,
  formats = ["csv", "xlsx", "pdf"],
  label = "Export",
  align = "end",
  side = "bottom",
  sideOffset = 4,
  classNames,
  variant = "outline",
  size = "md",
  className,
  ...buttonProps
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false);

  const baseFilename = useMemo(() => {
    const baseName = filename ?? slugify(title);
    const filtersSlug = filtersDescription ? slugify(filtersDescription) : null;
    return [baseName, filtersSlug, formatFilenameTimestamp(new Date())]
      .filter(Boolean)
      .join("-");
  }, [filename, title, filtersDescription]);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      setOpen(false);
      switch (format) {
        case "csv":
          exportToCsv(data, columns, `${baseFilename}.csv`);
          break;
        case "xlsx":
          exportToXlsx(data, columns, `${baseFilename}.xlsx`);
          break;
        case "pdf":
          exportToPdf(data, columns, `${baseFilename}.pdf`, {
            title,
            recordCount: data.length,
            filters: filtersDescription,
          });
          break;
      }
    },
    [data, columns, baseFilename, title, filtersDescription],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(classNames?.trigger, className)}
          {...buttonProps}
        >
          <Download size={16} strokeWidth={1.5} aria-hidden />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          className={cn("clet-popover--menu gsl-popover--menu", classNames?.menu)}
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <ul className="clet-popover__menu gsl-popover__menu">
            {formats.map((format) => {
              const { label: formatLabel, icon: Icon } = FORMAT_CONFIG[format];
              return (
                <li key={format}>
                  <button
                    type="button"
                    className={cn("clet-popover__menu-item gsl-popover__menu-item", classNames?.menuItem)}
                    onClick={() => handleExport(format)}
                  >
                    <Icon size={14} strokeWidth={1.5} aria-hidden />
                    {formatLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
}
