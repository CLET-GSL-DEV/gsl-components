import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { RadioGroupProps } from "../../types/radio-group";
import { cn } from "../../utils/cn";
import { RadioGroupProvider } from "./RadioGroupContext";
import "./styles/radio-group.css";

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  required,
  orientation = "vertical",
  variant = "default",
  classNames,
  className,
  children,
}: RadioGroupProps) {
  return (
    <RadioGroupProvider variant={variant}>
      <RadioGroupPrimitive.Root
        className={cn(
          "clet-radio-group",
          variant === "card" && "clet-radio-group--card",
          disabled && "clet-radio-group--disabled",
          classNames?.root,
          className,
        )}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        disabled={disabled}
        required={required}
        orientation={orientation}
      >
        {children}
      </RadioGroupPrimitive.Root>
    </RadioGroupProvider>
  );
}
