import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { CopyButton } from "./CopyButton";

interface CodeFigureProps extends ComponentPropsWithoutRef<"figure"> {
  children: ReactNode;
}

function attachCodeRef(node: ReactNode, codeRef: React.RefObject<HTMLElement | null>): ReactNode {
  if (!isValidElement(node)) {
    return node;
  }

  const element = node as ReactElement<{ children?: ReactNode; ref?: unknown }>;

  if (element.type === "code") {
    return cloneElement(element, { ref: codeRef });
  }

  if (element.props.children) {
    return cloneElement(element, {
      children: Children.map(element.props.children, (child) =>
        attachCodeRef(child, codeRef),
      ),
    });
  }

  return element;
}

function findHighlightedFigure(children: ReactNode): ReactElement | null {
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === "figure") {
      return child as ReactElement<ComponentPropsWithoutRef<"figure">>;
    }
  }

  return null;
}

export function CodeFigure({ children, className, ...props }: CodeFigureProps) {
  const codeRef = useRef<HTMLElement>(null);

  const getText = useCallback(
    () => codeRef.current?.textContent ?? "",
    [],
  );

  const highlightedFigure = findHighlightedFigure(children);

  return (
    <div className="demo-docs__code-block">
      <div className="demo-docs__code-toolbar">
        <CopyButton getText={getText} />
      </div>
      {highlightedFigure ? (
        cloneElement(highlightedFigure, {
          className: ["demo-docs__code-figure", highlightedFigure.props.className, className]
            .filter(Boolean)
            .join(" "),
          children: attachCodeRef(highlightedFigure.props.children, codeRef),
        })
      ) : (
        <figure
          className={["demo-docs__code-figure", className].filter(Boolean).join(" ")}
          {...props}
        >
          {attachCodeRef(children, codeRef)}
        </figure>
      )}
    </div>
  );
}
