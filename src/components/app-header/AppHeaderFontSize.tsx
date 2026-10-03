import { forwardRef, useCallback, useContext } from "react";
import type { AppHeaderFontSizeProps } from "../../types/app-header";
import type { CletFontSize } from "../../types/theme";
import { TextAaIcon } from "@phosphor-icons/react/ssr";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "../../utils/cn";
import { withComponentId } from "../../utils/componentId";
import { ThemeContext } from "../theme/ThemeContext";
import "./styles/app-header.css";

const OPTIONS: readonly { value: CletFontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Normal" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Largest" },
];

interface OptionProps {
  value: CletFontSize;
  label: string;
  active: boolean;
  className?: string;
  onSelect: (value: CletFontSize) => void;
}

/** Its own component so the click handler is memoized per option, not per render. */
function AppHeaderFontSizeOption({ value, label, active, className, onSelect }: OptionProps) {
  const handleClick = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <button
      type="button"
      aria-pressed={active}
      data-state={active ? "checked" : "unchecked"}
      className={cn(
        "clet-text-size-popover__option gsl-text-size-popover__option",
        `clet-text-size-popover__option--${value}`,
        className,
      )}
      onClick={handleClick}
    >
      <span className="clet-text-size-popover__option-glyph gsl-text-size-popover__option-glyph">
        Aa
      </span>
      {label}
    </button>
  );
}

const AppHeaderFontSizeBase = /* @__PURE__ */ forwardRef<HTMLButtonElement, AppHeaderFontSizeProps>(
  function AppHeaderFontSize(
    { className, classNames, label = "Text size", title = "Text size" },
    ref,
  ) {
    const themeContext = useContext(ThemeContext);

    // Renders nothing without a ThemeProvider, since there is no store to write to.
    if (!themeContext) {
      return null;
    }

    const { fontSize, setFontSize } = themeContext;

    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            className={cn(
              "clet-app-header__notif-btn gsl-app-header__notif-btn clet-app-header__text-size-btn gsl-app-header__text-size-btn",
              classNames?.root,
              className,
            )}
            aria-label={label}
          >
            <TextAaIcon size={20} weight="duotone" aria-hidden />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={cn(
              "clet-text-size-popover gsl-text-size-popover",
              classNames?.content,
            )}
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <div
              className={cn(
                "clet-text-size-popover__title gsl-text-size-popover__title",
                classNames?.title,
              )}
            >
              {title}
            </div>
            {/* Plain buttons with aria-pressed, not a radiogroup: that role
                promises arrow-key navigation, and Tab is what these answer to. */}
            <div aria-label={title}>
              {OPTIONS.map((option) => (
                <AppHeaderFontSizeOption
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  active={fontSize === option.value}
                  className={classNames?.option}
                  onSelect={setFontSize}
                />
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

export const AppHeaderFontSize = /* @__PURE__ */ withComponentId(
  AppHeaderFontSizeBase,
  "AppHeaderFontSize",
);
