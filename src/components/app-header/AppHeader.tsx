import type {
  AppHeaderProps,
  AppHeaderActionsProps,
  AppHeaderBrandingProps,
} from "../../types/app-header";
import { cn } from "../../utils/cn";
import "./styles/app-header.css";

export const AppHeader = ({
  className,
  children,
  variant = "default",
  ...props
}: AppHeaderProps) => {
  return (
    <div
      className={cn(
        "gsl-app-header",
        variant === "plain" && "gsl-app-header--plain",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const AppHeaderActions = ({ className, children, ...props }: AppHeaderActionsProps) => {
  return (
    <div className={cn("gsl-app-header__right", className)} {...props}>
      {children}
    </div>
  );
};

export const AppHeaderBranding = ({
  className,
  logo,
  title,
  subtitle,
  children,
}: AppHeaderBrandingProps) => {
  return (
    <div className={cn("gsl-app-header__branding", className)}>
      {logo && <span className="gsl-app-header__branding-logo">{logo}</span>}
      {children ?? (
        <span className="gsl-app-header__branding-text">
          {title && (
            <span className="gsl-app-header__branding-title">{title}</span>
          )}
          {title && subtitle && (
            <span className="gsl-app-header__branding-sep" aria-hidden>
              -
            </span>
          )}
          {subtitle && (
            <span className="gsl-app-header__branding-subtitle">{subtitle}</span>
          )}
        </span>
      )}
    </div>
  );
};

(AppHeader as unknown as { componentId: string }).componentId = "AppHeader";
(AppHeaderActions as unknown as { componentId: string }).componentId = "AppHeaderActions";
(AppHeaderBranding as unknown as { componentId: string }).componentId = "AppHeaderBranding";
