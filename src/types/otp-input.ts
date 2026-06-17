import type { HTMLAttributes } from "react";

export interface OtpInputClassNames {
  root?: string;
  slot?: string;
}

export interface OtpInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  invalid?: boolean;
  disabled?: boolean;
  classNames?: OtpInputClassNames;
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  name?: string;
}
