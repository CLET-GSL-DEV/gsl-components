import { forwardRef } from "react";
import type { CardProps } from "../../types/card";
import { cn } from "../../utils/cn";
import "./styles/card.css";

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, classNames, header, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("gsl-card", classNames?.root, className)}
      {...props}
    >
      {header ? (
        <div className={cn("gsl-card__header", classNames?.header)}>
          {header}
        </div>
      ) : null}
      <div className={cn("gsl-card__body", classNames?.body)}>
        {children}
      </div>
    </div>
  );
});
