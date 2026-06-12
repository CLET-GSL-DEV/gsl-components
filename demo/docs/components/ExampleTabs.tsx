import { useId, useState, type ReactNode } from "react";

type TabId = "preview" | "code";

interface ExampleTabsProps {
  title?: string;
  preview: ReactNode;
  children: ReactNode;
}

export function ExampleTabs({ title, preview, children }: ExampleTabsProps) {
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
        <div className="demo-docs__preview-canvas">{preview}</div>
      </div>

      <div
        id={codePanelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-code-tab`}
        hidden={activeTab !== "code"}
        className="demo-docs__tab-panel demo-docs__tab-panel--code"
      >
        {children}
      </div>
    </div>
  );
}
