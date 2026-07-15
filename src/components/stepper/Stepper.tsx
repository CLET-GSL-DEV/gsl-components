import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
} from "react";
import type {
  StepLabelProps,
  StepProps,
  StepState,
  StepperProps,
} from "../../types/stepper";
import { cn } from "../../utils/cn";
import { StepperContext, useStepperContext } from "./StepperContext";
import "./styles/stepper.css";

function StepCheck({ className }: { className?: string }) {
  return (
    <svg
      className={cn("clet-stepper__check gsl-stepper__check", className)}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
    >
      <path
        d="M2 7.5L5.5 11L12 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const StepperRoot = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    value,
    clickable = false,
    onValueChange,
    classNames,
    className,
    children,
    ...props
  },
  ref,
) {
  const steps = Children.toArray(children).filter(
    (child): child is ReactElement<StepProps> =>
      isValidElement(child) && child.type === Step,
  );

  const contextValue = { value, clickable, onValueChange };

  return (
    <StepperContext.Provider value={contextValue}>
      <ol
        ref={ref}
        className={cn("clet-stepper gsl-stepper", classNames?.root, className)}
        {...props}
      >
        {steps.map((step, index) =>
          cloneElement(step, {
            __isLast: index === steps.length - 1,
            key: step.key ?? `clet-step-${index}`,
          }),
        )}
      </ol>
    </StepperContext.Provider>
  );
});

export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  {
    value,
    disabled = false,
    classNames,
    className,
    children,
    __isLast = false,
    ...props
  },
  ref,
) {
  const { value: current, clickable, onValueChange } = useStepperContext();

  const state: StepState =
    value < current ? "complete" : value === current ? "active" : "upcoming";

  const isComplete = state === "complete";
  const isActive = state === "active";
  const canClick = clickable && !disabled;

  const marker = (
    <span className={cn("clet-stepper__marker gsl-stepper__marker", classNames?.marker)}>
      <span
        className={cn(
          "clet-stepper__number gsl-stepper__number",
          isComplete && "clet-stepper__number--hidden gsl-stepper__number--hidden",
          classNames?.number,
        )}
        aria-hidden={isComplete}
      >
        {value}
      </span>
      {isComplete ? <StepCheck className={classNames?.check} /> : null}
    </span>
  );

  return (
    <li
      ref={ref}
      aria-current={isActive ? "step" : undefined}
      className={cn(
        "clet-stepper__item gsl-stepper__item",
        `clet-stepper__item--${state} gsl-stepper__item--${state}`,
        disabled && "clet-stepper__item--disabled gsl-stepper__item--disabled",
        canClick && "clet-stepper__item--clickable gsl-stepper__item--clickable",
        classNames?.root,
        className,
      )}
      {...props}
    >
      {canClick ? (
        <button
          type="button"
          className={cn("clet-stepper__button gsl-stepper__button", classNames?.button)}
          onClick={() => onValueChange?.(value)}
          aria-label={`Go to step ${value}`}
        >
          {marker}
          {children}
        </button>
      ) : (
        <>
          {marker}
          {children}
        </>
      )}
      {!__isLast ? (
        <span
          className={cn("clet-stepper__connector gsl-stepper__connector", classNames?.connector)}
          aria-hidden="true"
        >
          <span className="clet-stepper__connector-track gsl-stepper__connector-track" aria-hidden="true" />
          <span
            className={cn(
              "clet-stepper__connector-fill gsl-stepper__connector-fill",
              isComplete && "clet-stepper__connector-fill--visible gsl-stepper__connector-fill--visible",
            )}
            aria-hidden="true"
          />
        </span>
      ) : null}
    </li>
  );
});

export const StepLabel = forwardRef<HTMLSpanElement, StepLabelProps>(
  function StepLabel({ classNames, className, children, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn("clet-stepper__label gsl-stepper__label", classNames?.root, className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);

type StepperComponent = typeof StepperRoot & {
  Step: typeof Step;
  StepLabel: typeof StepLabel;
};

export const Stepper = StepperRoot as StepperComponent;
Stepper.Step = Step;
Stepper.StepLabel = StepLabel;
