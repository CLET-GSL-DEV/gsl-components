import { useEffect, useMemo, useRef, useState } from "react";
import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

interface ExampleCodeProps {
  source: string;
  title?: string;
}

const DUAL_THEME = "github-light github-dark";

function prepareDisplaySource(source: string): string {
  return source.replace(/^export function /m, "function ");
}

function parseShikiDualThemeHtml(html: string): string {
  const match = html.match(/^<pre[^>]*><code>([\s\S]*)<\/code><\/pre>$/);
  return match?.[1] ?? html;
}

export function ExampleCode({ source, title = "App.tsx" }: ExampleCodeProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [innerHtml, setInnerHtml] = useState<string | null>(null);
  const displaySource = useMemo(() => prepareDisplaySource(source), [source]);

  useEffect(() => {
    let cancelled = false;

    void codeToHtml(displaySource, {
      lang: "tsx",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    }).then((nextHtml) => {
      if (!cancelled) {
        setInnerHtml(parseShikiDualThemeHtml(nextHtml));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [displaySource]);

  const getText = () => codeRef.current?.textContent ?? displaySource;

  return (
    <div className="demo-docs__code-block">
      <div className="demo-docs__code-toolbar">
        <span className="demo-docs__code-filename">{title}</span>
        <CopyButton getText={getText} />
      </div>
      <figure className="demo-docs__code-figure">
        <pre className="demo-docs__code">
          {innerHtml ? (
            <code
              ref={codeRef}
              data-theme={DUAL_THEME}
              dangerouslySetInnerHTML={{ __html: innerHtml }}
            />
          ) : (
            <code ref={codeRef}>{displaySource}</code>
          )}
        </pre>
      </figure>
    </div>
  );
}
