import {
  AppHeader,
  AppHeaderTitle,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@rfdtech/components";

export function AppHeaderPageContextExample() {
  return (
    <div
      style={{
        height: 320,
        overflowY: "auto",
        borderRadius: "var(--clet-radius-2xl)",
        background: "var(--clet-bg)",
      }}
    >
      <AppHeader variant="plain">
        <AppHeaderTitle
          page="Case list"
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Cases</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
        >
          AQAIS
        </AppHeaderTitle>
      </AppHeader>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ margin: 0 }}>Scroll this panel: the header shrinks immediately,</p>
        <p style={{ margin: 0 }}>and the page title fades in once scrolled deep.</p>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} style={{ margin: 0, color: "var(--clet-text-secondary)" }}>
            Filler line {i + 1} to make the panel scrollable.
          </p>
        ))}
      </div>
    </div>
  );
}
