import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { CopyButton } from "./CopyButton";

interface CodeFigureProps extends ComponentPropsWithoutRef<"figure"> {
  children: ReactNode;
}

const DEFAULT_FILENAMES: Record<string, string> = {
  bash: "terminal",
  css: "styles.css",
  ts: "example.ts",
  tsx: "example.tsx",
};

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }

  return "";
}

function isTitleNode(node: ReactNode): node is ReactElement {
  return (
    isValidElement(node) &&
    typeof node.props === "object" &&
    node.props !== null &&
    "data-rehype-pretty-code-title" in node.props
  );
}

function findCodeLanguage(node: ReactNode): string | undefined {
  if (!isValidElement<{ children?: ReactNode; "data-language"?: string }>(node)) {
    return undefined;
  }

  if (node.type === "code" && node.props["data-language"]) {
    return node.props["data-language"];
  }

  if (node.props.children) {
    for (const child of Children.toArray(node.props.children)) {
      const language = findCodeLanguage(child);
      if (language) {
        return language;
      }
    }
  }

  return undefined;
}

function stripTitleNodes(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    return Children.map(node, stripTitleNodes);
  }

  if (isTitleNode(node)) {
    return null;
  }

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return node;
  }

  if (!node.props.children) {
    return node;
  }

  const nextChildren = Children.map(node.props.children, stripTitleNodes);
  return cloneElement(node, { children: nextChildren });
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

function extractFilename(children: ReactNode): string | undefined {
  for (const child of Children.toArray(children)) {
    if (isTitleNode(child)) {
      const title = getTextContent(child.props.children).trim();
      if (title) {
        return title;
      }
    }

    if (isValidElement<{ children?: ReactNode }>(child)) {
      const nested = extractFilename(child.props.children);
      if (nested) {
        return nested;
      }
    }
  }

  const language = findCodeLanguage(children);
  if (language && DEFAULT_FILENAMES[language]) {
    return DEFAULT_FILENAMES[language];
  }

  return undefined;
}

export function CodeFigure({ children, className, ...props }: CodeFigureProps) {
  const codeRef = useRef<HTMLElement>(null);

  const getText = useCallback(
    () => codeRef.current?.textContent ?? "",
    [],
  );

  const highlightedFigure = findHighlightedFigure(children);
  const figureChildren = highlightedFigure?.props.children ?? children;
  const filename = useMemo(() => extractFilename(figureChildren), [figureChildren]);
  const bodyChildren = useMemo(
    () => attachCodeRef(stripTitleNodes(figureChildren), codeRef),
    [figureChildren],
  );

  return (
    <div className="demo-docs__code-block">
      <div className="demo-docs__code-toolbar">
        {filename ? (
          <span className="demo-docs__code-filename">{filename}</span>
        ) : null}
        <CopyButton getText={getText} />
      </div>
      {highlightedFigure ? (
        cloneElement(highlightedFigure, {
          className: ["demo-docs__code-figure", highlightedFigure.props.className, className]
            .filter(Boolean)
            .join(" "),
          children: bodyChildren,
        })
      ) : (
        <figure
          className={["demo-docs__code-figure", className].filter(Boolean).join(" ")}
          {...props}
        >
          {bodyChildren}
        </figure>
      )}
    </div>
  );
}
