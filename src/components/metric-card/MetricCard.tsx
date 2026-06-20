import { forwardRef, useEffect, useMemo, useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { MetricCardProps, MetricTrend } from "../../types/metric-card";
import { cn } from "../../utils/cn";
import "./styles/metric-card.css";

const trendIcons: Record<MetricTrend, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

interface ParsedValue {
  num: number;
  prefix: string;
  suffix: string;
  decimals: number;
  localeFormat: boolean;
}

function parseValueForAnimation(value: string | number): ParsedValue | null {
  if (typeof value === "number") {
    return {
      num: value,
      prefix: "",
      suffix: "",
      decimals: 0,
      localeFormat: false,
    };
  }
  const cleaned = value.replace(/,/g, "");
  const hadCommas = value !== cleaned;
  const match = cleaned.match(/^([^0-9.-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return {
    num: parseFloat(match[2]),
    prefix: match[1],
    suffix: match[3],
    decimals: match[2].split(".")[1]?.length ?? 0,
    localeFormat: hadCommas,
  };
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  function MetricCard(
    {
      label,
      value,
      icon,
      description,
      trend,
      trendValue,
      animate = false,
      animationDuration = 1500,
      className,
      classNames,
      ...props
    },
    ref,
  ) {
    const TrendIcon = trend ? trendIcons[trend] : null;

    const parsed = useMemo(
      () => (animate ? parseValueForAnimation(value) : null),
      [animate, value],
    );

    const [animatedNum, setAnimatedNum] = useState(0);

    useEffect(() => {
      if (!parsed) {
        setAnimatedNum(0);
        return;
      }

      const from = 0;
      const to = parsed.num;

      if (from === to) {
        setAnimatedNum(to);
        return;
      }

      const startTime = performance.now();
      let rafId: number;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedNum(from + (to - from) * eased);
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        }
      };

      rafId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafId);
    }, [parsed, animationDuration]);

    let displayValue: string | number = value;
    if (parsed) {
      const formatted = parsed.localeFormat
        ? animatedNum.toLocaleString("en-US", {
            minimumFractionDigits: parsed.decimals,
            maximumFractionDigits: parsed.decimals,
          })
        : animatedNum.toFixed(parsed.decimals);
      displayValue = `${parsed.prefix}${formatted}${parsed.suffix}`;
    }

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
            {displayValue}
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
