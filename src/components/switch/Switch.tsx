import * as SwitchPrimitive from "@radix-ui/react-switch";
import { useId } from "react";
import type { SwitchProps } from "../../types/switch";
import { cn } from "../../utils/cn";
import "./styles/switch.css";

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  labelPosition = "right",
  disabled = false,
  invalid = false,
  required,
  name,
  value,
  id: idProp,
  "aria-label": ariaLabel,
  classNames,
  className,
}: SwitchProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const Wrapper = label ? "label" : "span";

  const control = (
    <SwitchPrimitive.Root
      id={id}
      className={cn(
        "clet-switch__track",
        invalid && "clet-switch__track--invalid",
        classNames?.track,
      )}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      aria-invalid={invalid || undefined}
      aria-label={!label ? ariaLabel : undefined}
    >
      <SwitchPrimitive.Thumb
        className={cn("clet-switch__thumb", classNames?.thumb)}
      />
    </SwitchPrimitive.Root>
  );

  return (
    <Wrapper
      className={cn(
        "clet-switch",
        disabled && "clet-switch--disabled",
        classNames?.root,
        className,
      )}
    >
      {label && labelPosition === "left" ? (
        <span className={cn("clet-switch__label", classNames?.label)}>
          {label}
        </span>
      ) : null}
      {control}
      {label && labelPosition === "right" ? (
        <span className={cn("clet-switch__label", classNames?.label)}>
          {label}
        </span>
      ) : null}
    </Wrapper>
  );
}
