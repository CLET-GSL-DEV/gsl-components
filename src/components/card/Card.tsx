import { forwardRef } from "react";
import type { CardProps } from "../../types/card";
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
