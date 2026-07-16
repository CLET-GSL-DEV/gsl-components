import { useId, useState, type ReactNode } from "react";
import { ExampleCode } from "./ExampleCode";

type TabId = "preview" | "code";

interface ExampleTabsProps {
  title?: string;
  preview: ReactNode;
  code: string;
  codeTitle?: string;
  canvasClassName?: string;
}

export function ExampleTabs({
  title,
  preview,
  code,
  codeTitle,
  canvasClassName,
}: ExampleTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("preview");
  const baseId = useId();
  const previewPanelId = `${baseId}-preview`;
  const codePanelId = `${baseId}-code`;

  return (
    <div className="demo-docs__example-tabs">
      {title ? <p className="demo-docs__example-title">{title}</p> : null}

      <div className="demo-docs__tabs" role="tablist" aria-label={title ?? "Example"}>
        <button
          type="button"
          role="tab"
          id={`${baseId}-preview-tab`}
          className={[
            "demo-docs__tab",
            activeTab === "preview" ? "demo-docs__tab--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-selected={activeTab === "preview"}
          aria-controls={previewPanelId}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
        <button
          type="button"
          role="tab"
          id={`${baseId}-code-tab`}
          className={[
            "demo-docs__tab",
            activeTab === "code" ? "demo-docs__tab--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-selected={activeTab === "code"}
          aria-controls={codePanelId}
          onClick={() => setActiveTab("code")}
        >
          Code
        </button>
      </div>

      <div
        id={previewPanelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-preview-tab`}
        hidden={activeTab !== "preview"}
        className="demo-docs__tab-panel"
      >
        <div
          className={["demo-docs__preview-canvas", canvasClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {preview}
        </div>
      </div>

      <div
        id={codePanelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-code-tab`}
        hidden={activeTab !== "code"}
        className="demo-docs__tab-panel demo-docs__tab-panel--code"
      >
        <ExampleCode source={code} title={codeTitle} />
      </div>
    </div>
  );
}
