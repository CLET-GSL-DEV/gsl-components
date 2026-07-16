import type { HTMLAttributes } from "react";

export interface CountrySelectorClassNames {
  root?: string;
  trigger?: string;
  flag?: string;
  name?: string;
  menu?: string;
  option?: string;
  search?: string;
}

/**
 * @deprecated `CountrySelector` is deprecated in favor of `Combobox` (country selection)
 * or `PhoneNumberInput`'s own country picker (phone numbers) — see the migration guide.
 */
export interface CountrySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  invalid?: boolean;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (countryCode: string) => void;
  placeholder?: string;
  classNames?: CountrySelectorClassNames;
  className?: string;
}
