import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { useId } from "react";
import type { CheckboxProps } from "../../types/checkbox";
import { cn } from "../../utils/cn";
import "./styles/checkbox.css";

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled = false,
  required,
  name,
  value,
  id: idProp,
  "aria-label": ariaLabel,
  classNames,
  className,
}: CheckboxProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const Wrapper = label ? "label" : "span";

  return (
    <Wrapper
      className={cn(
        "gsl-checkbox",
        disabled && "gsl-checkbox--disabled",
        classNames?.root,
        className,
      )}
    >
      <CheckboxPrimitive.Root
        id={id}
        className={cn("gsl-checkbox__control", classNames?.control)}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        aria-label={!label ? ariaLabel : undefined}
      >
        <CheckboxPrimitive.Indicator
          className={cn("gsl-checkbox__indicator", classNames?.indicator)}
        >
          <Check
            className={cn("gsl-checkbox__icon", classNames?.icon)}
            size={14}
            strokeWidth={2.5}
            aria-hidden
          />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label ? (
        <span className={cn("gsl-checkbox__label", classNames?.label)}>
          {label}
        </span>
      ) : null}
    </Wrapper>
  );
}
