import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rfdtech/components";

const COUNT_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 22,
  height: 22,
  padding: "0 6px",
  borderRadius: 9999,
  background: "var(--clet-surface-dark)",
  color: "var(--clet-text)",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
} as const;

const TABS = [
  { value: "all", label: "All", count: 3, panel: "Every case on the docket." },
  { value: "filed", label: "Filed at intake", count: 2, panel: "Cases filed at intake." },
  { value: "requested", label: "Requested by the Chair", count: 1, panel: "Cases the Chair asked for." },
  { value: "tendered", label: "Tendered at the sitting", count: 0, panel: "Cases tendered at the sitting." },
  { value: "registry", label: "Added by the Registry", count: 0, panel: "Cases added by the Registry." },
];

export function TabsFlatExample() {
  return (
    <Tabs defaultValue="all" variant="flat">
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label} <span style={COUNT_STYLE}>{tab.count}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
