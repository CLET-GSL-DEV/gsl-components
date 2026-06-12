import type { InputMaskProps } from "../../types/input-mask";
import { useInputMask } from "./hooks/useInputMask";
import "../../styles/theme.css";
import "./styles/input-mask.css";

export function InputMask({
  mask,
  value,
  defaultValue,
  onChange,
  onValueChange,
  ariaLabel,
  placeholder,
  disabled = false,
  id,
  name,
  className,
  style,
  inputMode = "text",
}: InputMaskProps) {
  const { inputRef, maskedValue, handleChange, handleKeyDown, handlePaste } =
    useInputMask({
      mask,
      value,
      defaultValue,
      onChange,
      onValueChange,
      disabled,
    });

  return (
    <div
      className={["gsl-input-mask", className].filter(Boolean).join(" ")}
      style={style}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        className="gsl-input-mask__input"
        value={maskedValue}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        inputMode={inputMode}
        autoComplete="off"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    </div>
  );
}
