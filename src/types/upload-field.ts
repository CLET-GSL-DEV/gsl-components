import type { HTMLAttributes } from "react";

export interface UploadFieldClassNames {
  root?: string;
  icon?: string;
  title?: string;
  subtitle?: string;
  files?: string;
  fileCard?: string;
  fileName?: string;
  fileSize?: string;
  removeButton?: string;
  actionButton?: string;
}

export interface UploadFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  invalid?: boolean;
  disabled?: boolean;
  classNames?: UploadFieldClassNames;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  value?: File | File[] | null;
  onChange?: (file: File | File[] | null) => void;
  name?: string;
}
