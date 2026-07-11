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

// Outline variant uses literal triangle/dash glyphs instead of icon components.
const outlineTrendGlyphs: Record<MetricTrend, string> = {
  up: "▲",
  down: "▼",
  neutral: "–",
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
      variant = "default",
      trend,
      trendValue,
      animate = false,
      animationDuration = 1500,
      loading = false,
      loadingLabel = "Loading metric",
      className,
      classNames,
      ...props
    },
    ref,
  ) {
    const isOutline = variant === "outline";
    const TrendIcon = trend && !isOutline ? trendIcons[trend] : null;
    const trendGlyph = trend && isOutline ? outlineTrendGlyphs[trend] : null;

    // Outline variant drops the leading +/- from the trend value.

    const displayTrendValue =
      isOutline && trendValue ? trendValue.replace(/^[+-]/, "") : trendValue;

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
        className={cn(
          "gsl-metric-card",
          `gsl-metric-card--${variant}`,
          loading && "gsl-metric-card--loading",
          classNames?.root,
          className,
        )}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="gsl-metric-card__sr-only" role="status">
            {loadingLabel}
          </span>
        ) : null}

        <div className="gsl-metric-card__header" aria-hidden={loading || undefined}>
          {icon ? (
            loading ? (
              <span className="gsl-skeleton gsl-metric-card__skeleton-icon" />
            ) : (
              <span className={cn("gsl-metric-card__icon", classNames?.icon)}>
                {icon}
              </span>
            )
          ) : null}
          {loading ? (
            <span className="gsl-skeleton gsl-metric-card__skeleton-label" />
          ) : (
            <span className={cn("gsl-metric-card__label", classNames?.label)}>
              {label}
            </span>
          )}
        </div>

        <div
          className="gsl-metric-card__value-row"
          aria-hidden={loading || undefined}
        >
          {loading ? (
            <span className="gsl-skeleton gsl-metric-card__skeleton-value" />
          ) : (
            <span className={cn("gsl-metric-card__value", classNames?.value)}>
              {displayValue}
            </span>
          )}

          {trend && trendValue ? (
            loading ? (
              <span className="gsl-skeleton gsl-metric-card__skeleton-trend" />
            ) : (
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
                {trendGlyph ? (
                  <span className="gsl-metric-card__trend-glyph" aria-hidden>
                    {trendGlyph}
                  </span>
                ) : null}
                {displayTrendValue}
              </span>
            )
          ) : null}
        </div>

        {description ? (
          loading ? (
            <span
              className="gsl-skeleton gsl-metric-card__skeleton-description"
              aria-hidden
            />
          ) : (
            <span
              className={cn(
                "gsl-metric-card__description",
                classNames?.description,
              )}
            >
              {description}
            </span>
          )
        ) : null}
      </div>
    );
  },
);
