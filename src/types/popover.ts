import type * as PopoverPrimitive from "@radix-ui/react-popover";

export interface PopoverContentClassNames {
  content?: string;
}

export interface PopoverContentProps
  extends PopoverPrimitive.PopoverContentProps {
  classNames?: PopoverContentClassNames;
}
