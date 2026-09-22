import { forwardRef } from "react";
import type { AppHeaderTitleProps } from "../../types/app-header";
import { cn } from "../../utils/cn";

/**
 * The system title in the app header (2.4: the rail is image-only, so the
 * app's name lives here). Carries its own styling, drop it in and it is
 * already sized, weighted, and spaced.
 */
export const AppHeaderTitle = forwardRef<
  HTMLHeadingElement,
  AppHeaderTitleProps
>(function AppHeaderTitle(
  { classNames, className, children, ...props },
  ref,
) {
  return (
    <h1
      ref={ref}
      className={cn(
        "clet-app-header__title gsl-app-header__title",
        classNames?.title,
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
});
