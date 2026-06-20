import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./AppLayout";
import { AppSidebar } from "./AppSidebar";
import { AppBreadcrumb } from "./AppBreadcrumb";
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
    expect(container.querySelector(".gsl-app-header")).toBeInTheDocument();
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

  it("positions AppBreadcrumb between header and body", () => {
    const { container } = render(
      <AppLayout>
        <AppBreadcrumb>Breadcrumb</AppBreadcrumb>
        <AppBody>Body</AppBody>
      </AppLayout>,
    );
    const breadcrumbWrapper = container.querySelector(".gsl-app-layout__breadcrumb");
    expect(breadcrumbWrapper).toBeInTheDocument();
    expect(breadcrumbWrapper).toHaveTextContent("Breadcrumb");
  });

  it("positions all four components", () => {
    const { container } = render(
      <AppLayout>
        <AppHeader>H</AppHeader>
        <AppSidebar>S</AppSidebar>
        <AppBreadcrumb>Bc</AppBreadcrumb>
        <AppBody>B</AppBody>
      </AppLayout>,
    );
    expect(container.querySelector(".gsl-app-header")).toBeInTheDocument();
    expect(container.querySelector(".gsl-app-layout__sidebar")).toBeInTheDocument();
    expect(container.querySelector(".gsl-app-layout__breadcrumb")).toBeInTheDocument();
    expect(container.querySelector(".gsl-app-layout__content")).toBeInTheDocument();
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

  it("passes component className to layout wrapper", () => {
    const { container } = render(
      <AppLayout>
        <AppHeader className="header-custom">H</AppHeader>
        <AppBody className="body-custom">B</AppBody>
      </AppLayout>,
    );
    const header = container.querySelector(".gsl-app-header");
    const content = container.querySelector(".gsl-app-layout__content");
    expect(header).toHaveClass("header-custom");
    expect(content).toHaveClass("body-custom");
  });

  it("passes extra props to layout wrapper", () => {
    const { container } = render(
      <AppLayout>
        <AppHeader id="main-header" data-test="x">H</AppHeader>
        <AppBody>B</AppBody>
      </AppLayout>,
    );
    const header = container.querySelector(".gsl-app-header");
    expect(header).toHaveAttribute("id", "main-header");
    expect(header).toHaveAttribute("data-test", "x");
  });
});

describe("AppSidebar", () => {
  it("renders children", () => {
    render(<AppSidebar>Nav</AppSidebar>);
    expect(screen.getByText("Nav")).toBeInTheDocument();
  });
});

describe("AppBody", () => {
  it("renders children", () => {
    render(<AppBody>Page</AppBody>);
    expect(screen.getByText("Page")).toBeInTheDocument();
  });
});
