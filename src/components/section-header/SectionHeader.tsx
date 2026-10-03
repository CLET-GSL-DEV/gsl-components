import { forwardRef } from "react";
import type {
  SectionActionsProps,
  SectionDescriptionProps,
  SectionHeaderProps,
  SectionTitleProps,
} from "../../types/section-header";
import { cn } from "../../utils/cn";
import "./styles/section-header.css";

export const SectionHeader = /* @__PURE__ */ forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("clet-section-header gsl-section-header", classNames?.root, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const SectionTitle = /* @__PURE__ */ forwardRef<HTMLHeadingElement, SectionTitleProps>(
  function SectionTitle({ className, classNames, ...props }, ref) {
    return (
      <h2
        ref={ref}
        className={cn("clet-section-header__title gsl-section-header__title", classNames?.title, className)}
        {...props}
      />
    );
  },
);

export const SectionDescription = /* @__PURE__ */ forwardRef<
  HTMLParagraphElement,
  SectionDescriptionProps
>(function SectionDescription({ className, classNames, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn(
        "clet-section-header__description gsl-section-header__description",
        classNames?.description,
        className,
      )}
      {...props}
    />
  );
});

export const SectionActions = /* @__PURE__ */ forwardRef<HTMLDivElement, SectionActionsProps>(
  function SectionActions({ className, classNames, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "clet-section-header__actions gsl-section-header__actions",
          classNames?.actions,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
