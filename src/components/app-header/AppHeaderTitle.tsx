import { forwardRef } from "react";
import type { AppHeaderTitleProps } from "../../types/app-header";
import { cn } from "../../utils/cn";

/**
 * The system title in the app header (2.4: the rail is image-only, so the
 * app's name lives here). With page/breadcrumbs, the compact context
 * crossfades in on deep scroll in a plain header.
 */
export const AppHeaderTitle = forwardRef<
  HTMLHeadingElement,
  AppHeaderTitleProps
>(function AppHeaderTitle(
  { classNames, className, children, page, breadcrumbs, ...props },
  ref,
) {
  if (page == null && breadcrumbs == null) {
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
  }

  return (
    <div className="clet-app-header__page-context gsl-app-header__page-context">
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
      <div className="clet-app-header__page-compact gsl-app-header__page-compact">
        <div
          className={cn(
            "clet-app-header__title gsl-app-header__title",
            classNames?.title,
          )}
        >
          {children}
          {page != null ? (
            <span
              className={cn(
                "clet-app-header__title-page gsl-app-header__title-page",
                classNames?.page,
              )}
            >
              <span
                className={cn(
                  "clet-app-header__title-dot gsl-app-header__title-dot",
                  classNames?.dot,
                )}
                aria-hidden
              >
                ·
              </span>
              {page}
            </span>
          ) : null}
        </div>
        {breadcrumbs != null ? (
          <div
            className={cn(
              "clet-app-header__breadcrumbs gsl-app-header__breadcrumbs",
              classNames?.breadcrumbs,
            )}
          >
            {breadcrumbs}
          </div>
        ) : null}
      </div>
    </div>
  );
});
