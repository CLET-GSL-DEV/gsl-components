import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { Link } from "react-router-dom";
import { CodeFigure } from "./components/CodeFigure";
import { ExampleTabs } from "./components/ExampleTabs";
import { PropsTable } from "./components/PropsTable";

function Pre({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      className={["demo-docs__code", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </pre>
  );
}

function Table({ children, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="demo-docs__table-wrap">
      <table className="demo-docs__table" {...props}>
        {children}
      </table>
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="demo-docs__title" {...props} />,
  h2: (props) => <h2 className="demo-docs__section-title" {...props} />,
  h3: (props) => <h3 className="demo-docs__subsection-title" {...props} />,
  p: (props) => <p className="demo-docs__paragraph" {...props} />,
  ul: (props) => <ul className="demo-docs__notes" {...props} />,
  ol: (props) => <ol className="demo-docs__notes demo-docs__notes--ordered" {...props} />,
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/")) {
      return (
        <Link to={href} className="demo-docs__link">
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className="demo-docs__link" {...props}>
        {children}
      </a>
    );
  },
  figure: CodeFigure,
  pre: Pre,
  table: Table,
  ExampleTabs,
  PropsTable,
};
