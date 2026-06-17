import type { HTMLAttributes, ReactNode } from "react";

export type MetricTrend = "up" | "down" | "neutral";

export interface MetricCardClassNames {
  root?: string;
  icon?: string;
  label?: string;
  value?: string;
  description?: string;
  trend?: string;
}

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Metric label shown above the value */
  label: string;
  /** The primary metric value */
  value: string | number;
  /** Optional icon displayed alongside the label */
  icon?: ReactNode;
  /** Subtitle or description below the value */
  description?: string;
  /** Direction of the trend indicator */
  trend?: MetricTrend;
  /** Formatted trend text (e.g. "+12.5%") */
  trendValue?: string;
  classNames?: MetricCardClassNames;
  className?: string;
}
