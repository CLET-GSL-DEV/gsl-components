import type { ReactNode } from "react";
import type { ButtonProps } from "./button";
import type { ExportColumn } from "../utils/export";

export type { ExportColumn };

export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface ExportButtonClassNames {
  trigger?: string;
  menu?: string;
  menuItem?: string;
}

export interface ExportButtonProps<T = unknown>
  extends Omit<ButtonProps, "children" | "classNames"> {
  data: T[];
  columns: ExportColumn<T>[];
  title: string;
  filename?: string;
  filtersDescription?: string;
  formats?: ExportFormat[];
  label?: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  classNames?: ExportButtonClassNames;
}
