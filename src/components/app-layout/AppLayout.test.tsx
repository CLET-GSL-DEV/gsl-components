import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./AppLayout";
import { AppSidebar } from "./AppSidebar";
import { AppBody } from "./AppBody";
import { AppHeader } from "../app-header/AppHeader";

describe("AppLayout", () => {
  it("renders children with auto-positioning", () => {
    render(
      <AppLayout>
        <AppBody>Content</AppBody>
      </AppLayout>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("positions AppHeader in header area", () => {
    const { container } = render(
      <AppLayout>
        <AppHeader>Header</AppHeader>
        <AppBody>Body</AppBody>
      </AppLayout>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    // Header should be in the sticky header wrapper
    const headerWrapper = container.querySelector(".gsl-app-layout__header");
    expect(headerWrapper).toBeInTheDocument();
  });

  it("positions AppSidebar in sidebar area", () => {
    const { container } = render(
      <AppLayout>
        <AppSidebar>Sidebar</AppSidebar>
        <AppBody>Body</AppBody>
      </AppLayout>,
    );
    const sidebarWrapper = container.querySelector(".gsl-app-layout__sidebar");
    expect(sidebarWrapper).toBeInTheDocument();
    expect(sidebarWrapper).toHaveTextContent("Sidebar");
  });

  it("positions all three components", () => {
    const { container } = render(
      <AppLayout>
        <AppHeader>H</AppHeader>
        <AppSidebar>S</AppSidebar>
        <AppBody>B</AppBody>
      </AppLayout>,
    );
    expect(container.querySelector(".gsl-app-layout__header")).toBeInTheDocument();
    expect(container.querySelector(".gsl-app-layout__sidebar")).toBeInTheDocument();
    // Content is wrapped in AppBody's <main>
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppLayout ref={ref}>
        <AppBody>Body</AppBody>
      </AppLayout>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges className on root", () => {
    const { container } = render(
      <AppLayout className="custom">
        <AppBody>Body</AppBody>
      </AppLayout>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass("custom");
    expect(root).toHaveClass("gsl-app-layout");
  });
});

describe("AppSidebar", () => {
  it("renders children", () => {
    render(<AppSidebar>Nav</AppSidebar>);
    expect(screen.getByText("Nav")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<AppSidebar ref={ref}>S</AppSidebar>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("AppBody", () => {
  it("renders children in main element", () => {
    render(<AppBody>Page</AppBody>);
    expect(screen.getByRole("main")).toHaveTextContent("Page");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<AppBody ref={ref}>Body</AppBody>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("merges className", () => {
    render(<AppBody className="custom">Body</AppBody>);
    expect(screen.getByRole("main")).toHaveClass("custom");
  });
});
