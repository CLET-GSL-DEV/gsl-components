import type { HTMLAttributes } from "react";

export interface PhoneNumberInputClassNames {
  root?: string;
  prefix?: string;
  input?: string;
  dropdown?: string;
}

export interface PhoneNumberInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  invalid?: boolean;
  disabled?: boolean;
  classNames?: PhoneNumberInputClassNames;
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string;
  name?: string;
}
