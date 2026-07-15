import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useId } from "react";
import type { RadioProps } from "../../types/radio-group";
import { cn } from "../../utils/cn";
import { useRadioGroupContext } from "./RadioGroupContext";

export function Radio({
  value,
  label,
  description,
  disabled = false,
  id: idProp,
  "aria-label": ariaLabel,
  classNames,
  className,
}: RadioProps) {
  const { variant } = useRadioGroupContext();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = `${id}-description`;
  const hasText = Boolean(label || description);
  const Wrapper = hasText ? "label" : "span";

  return (
    <Wrapper
      className={cn(
        "clet-radio",
        variant === "card" && "clet-radio--card",
        disabled && "clet-radio--disabled",
        classNames?.root,
        className,
      )}
    >
      <RadioGroupPrimitive.Item
        id={id}
        className={cn("clet-radio__control", classNames?.control)}
        value={value}
        disabled={disabled}
        aria-label={!hasText ? ariaLabel : undefined}
        aria-describedby={description ? descriptionId : undefined}
      >
        <RadioGroupPrimitive.Indicator
          className={cn("clet-radio__indicator", classNames?.indicator)}
        />
      </RadioGroupPrimitive.Item>
      {hasText ? (
        <span className={cn("clet-radio__content", classNames?.content)}>
          {label ? (
            <span className={cn("clet-radio__label", classNames?.label)}>
              {label}
            </span>
          ) : null}
          {description ? (
            <span
              id={descriptionId}
              className={cn("clet-radio__description", classNames?.description)}
            >
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </Wrapper>
  );
}
