import { forwardRef } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { MetricCardProps, MetricTrend } from "../../types/metric-card";
import { cn } from "../../utils/cn";
import "./styles/metric-card.css";

const trendIcons: Record<MetricTrend, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  function MetricCard(
    {
      label,
      value,
      icon,
      description,
      trend,
      trendValue,
      className,
      classNames,
      ...props
    },
    ref,
  ) {
    const TrendIcon = trend ? trendIcons[trend] : null;

    return (
      <div
        ref={ref}
        className={cn("gsl-metric-card", classNames?.root, className)}
        {...props}
      >
        <div className="gsl-metric-card__header">
          {icon ? (
            <span className={cn("gsl-metric-card__icon", classNames?.icon)}>
              {icon}
            </span>
          ) : null}
          <span className={cn("gsl-metric-card__label", classNames?.label)}>
            {label}
          </span>
        </div>

        <div className="gsl-metric-card__value-row">
          <span className={cn("gsl-metric-card__value", classNames?.value)}>
            {value}
          </span>

          {trend && trendValue ? (
            <span
              className={cn(
                "gsl-metric-card__trend",
                `gsl-metric-card__trend--${trend}`,
                classNames?.trend,
              )}
            >
              {TrendIcon ? (
                <TrendIcon size={14} strokeWidth={2.5} aria-hidden />
              ) : null}
              {trendValue}
            </span>
          ) : null}
        </div>

        {description ? (
          <span
            className={cn(
              "gsl-metric-card__description",
              classNames?.description,
            )}
          >
            {description}
          </span>
        ) : null}
      </div>
    );
  },
);
