import { forwardRef } from "react";
import type { CSSProperties } from "react";
import type { NoticeProps } from "../../types/notice";
import { cn } from "../../utils/cn";
import "./styles/notice.css";

export const Notice = forwardRef<HTMLDivElement, NoticeProps>(function Notice(
  {
    variant = "default",
    color,
    title,
    icon,
    leftBorder = false,
    dashed = false,
    classNames,
    className,
    children,
    style,
    role,
    ...props
  },
  ref,
) {
  const mergedStyle: CSSProperties | undefined = color
    ? { ...style, ["--gsl-notice-accent" as string]: color }
    : style;

  return (
    <div
      ref={ref}
      role={role ?? (variant === "error" ? "alert" : "status")}
      style={mergedStyle}
      className={cn(
        "gsl-notice",
        `gsl-notice--${variant}`,
        leftBorder && "gsl-notice--left-border",
        dashed && "gsl-notice--dashed",
        classNames?.root,
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className={cn("gsl-notice__icon", classNames?.icon)}>
          {icon}
        </span>
      ) : null}
      <div className="gsl-notice__content">
        {title ? (
          <div className={cn("gsl-notice__header", classNames?.header)}>
            <span className={cn("gsl-notice__title", classNames?.title)}>
              {title}
            </span>
          </div>
        ) : null}
        {children ? (
          <div className={cn("gsl-notice__body", classNames?.body)}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
});
