import {
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

function setRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref && typeof ref === "object") {
    (ref as { current: T | null }).current = value;
  }
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (ref) {
        setRef(ref, value as T);
      }
    });
  };
}

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactElement;
  ref?: Ref<HTMLElement>;
}

export function Slot({ children, className, ref, ...props }: SlotProps) {
  if (!isValidElement(children)) {
    return null;
  }

  const childProps = children.props as Record<string, unknown> & {
    className?: string;
    ref?: Ref<HTMLElement>;
  };

  const mergedClassName = [className, childProps.className].filter(Boolean).join(" ");

  return cloneElement(children, {
    ...childProps,
    ...props,
    className: mergedClassName || undefined,
    ref: mergeRefs(ref, childProps.ref),
  } as Record<string, unknown>);
}
