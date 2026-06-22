import { forwardRef } from "react";
import type { CardProps, CardHeaderProps, CardTitleProps, CardActionsProps } from "../../types/card";
import { cn } from "../../utils/cn";
import "./styles/card.css";

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("gsl-card", className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("gsl-card__header", className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, children, ...props },
  ref,
) {
  return (
    <h3
      ref={ref}
      className={cn("gsl-card__title", className)}
      {...props}
    >
      {children}
    </h3>
  );
});

export const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(function CardActions(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("gsl-card__actions", className)}
      {...props}
    >
      {children}
    </div>
  );
});
