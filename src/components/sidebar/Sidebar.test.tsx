import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  Sidebar,
  SidebarBadge,
  SidebarCollapse,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarOverlay,
  SidebarProvider,
  SidebarTrigger,
} from "./Sidebar";

function mockMatchMedia(isMobile: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isMobile,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderSidebar({
  onOpenChange,
  onCollapsedChange,
  defaultOpen = false,
}: {
  onOpenChange?: (open: boolean) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultOpen?: boolean;
} = {}) {
  return render(
    <SidebarProvider
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onCollapsedChange={onCollapsedChange}
    >
      <SidebarTrigger>Open menu</SidebarTrigger>
      <SidebarOverlay />
      <Sidebar>
        <SidebarHeader>
          GSL Admin
          <SidebarCollapse />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav aria-label="Main">
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarItem>
                <SidebarLink active>
                  Dashboard
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink>Settings</SidebarLink>
              </SidebarItem>
            </SidebarGroup>
          </SidebarNav>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>,
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it("toggles open state from the mobile trigger", async () => {
    const user = userEvent.setup();

    renderSidebar();

    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".gsl-sidebar")).toHaveClass(
      "gsl-sidebar--mobile-open",
    );
  });

  it("calls onOpenChange when toggled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderSidebar({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderSidebar({ defaultOpen: true, onOpenChange });

    await user.click(screen.getByRole("button", { name: "Close sidebar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies active styles to SidebarLink", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveClass(
      "gsl-sidebar__link--active",
    );
  });

  it("merges classNames onto sidebar parts", () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider classNames={{ root: "custom-provider" }}>
        <Sidebar classNames={{ root: "custom-sidebar" }}>
          <SidebarHeader classNames={{ header: "custom-header" }}>
            Brand
          </SidebarHeader>
          <SidebarContent classNames={{ content: "custom-content" }}>
            <SidebarNav classNames={{ nav: "custom-nav" }} aria-label="Main">
              <SidebarGroup classNames={{ group: "custom-group" }}>
                <SidebarGroupLabel classNames={{ groupLabel: "custom-label" }}>
                  General
                </SidebarGroupLabel>
                <SidebarItem classNames={{ item: "custom-item" }}>
                  <SidebarLink classNames={{ link: "custom-link" }}>
                    Home
                  </SidebarLink>
                </SidebarItem>
              </SidebarGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(document.querySelector(".custom-provider")).toBeInTheDocument();
    expect(document.querySelector(".gsl-sidebar")).toHaveClass("custom-sidebar");
    expect(screen.getByText("Brand")).toHaveClass("custom-header");
    expect(document.querySelector(".custom-content")).toBeInTheDocument();
    expect(document.querySelector(".custom-nav")).toBeInTheDocument();
    expect(document.querySelector(".custom-group")).toBeInTheDocument();
    expect(screen.getByText("General")).toHaveClass("custom-label");
    expect(document.querySelector(".custom-item")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("custom-link");
  });

  it("merges classes onto child when SidebarLink uses asChild", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink asChild active>
                  <a className="child-link">
                    Reports
                  </a>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const link = screen.getByRole("link", { name: "Reports" });
    expect(link).toHaveClass("gsl-sidebar__link");
    expect(link).toHaveClass("gsl-sidebar__link--active");
    expect(link).toHaveClass("child-link");
  });

  it("renders icon and label wrappers when SidebarLink has icon", () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="users-icon" />}>
                  Users
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId("users-icon").parentElement).toHaveClass(
      "gsl-sidebar__link-icon",
    );
    expect(screen.getByText("Users")).toHaveClass("gsl-sidebar__link-label");
  });

  it("toggles collapsed state from SidebarCollapse on desktop", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();

    renderSidebar();

    const collapse = screen.getByRole("button", { name: "Toggle sidebar" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".gsl-sidebar")).not.toHaveClass(
      "gsl-sidebar--collapsed",
    );

    await user.click(collapse);

    expect(collapse).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelector(".gsl-sidebar")).toHaveClass(
      "gsl-sidebar--collapsed",
    );
  });

  it("calls onCollapsedChange when SidebarCollapse is clicked", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();

    renderSidebar({ onCollapsedChange });

    await user.click(screen.getByRole("button", { name: "Toggle sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("does not render SidebarCollapse on mobile", () => {
    mockMatchMedia(true);

    renderSidebar();

    expect(
      screen.queryByRole("button", { name: "Toggle sidebar" }),
    ).not.toBeInTheDocument();
  });

  it("renders SidebarBadge inside SidebarLink", () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>
                  Notifications
                  <SidebarBadge>New</SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const badge = screen.getByText("New");
    expect(badge).toHaveClass("gsl-sidebar__link-badge");
    expect(screen.getByRole("link", { name: /Notifications/ })).toContainElement(
      badge,
    );
  });

  it("hides SidebarBadge when sidebar is collapsed", () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>
                  Audit Logs
                  <SidebarBadge>12</SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText("12")).not.toBeVisible();
  });

  it("merges classNames onto SidebarBadge", () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink>
                  Items
                  <SidebarBadge classNames={{ badge: "custom-badge" }}>
                    3
                  </SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText("3")).toHaveClass("custom-badge");
  });

  it("throws when SidebarBadge is used outside SidebarLink", () => {
    expect(() => render(<SidebarBadge>New</SidebarBadge>)).toThrow(
      "SidebarBadge must be used within a SidebarLink.",
    );
  });

  it("shows tooltip on SidebarLink when sidebar is collapsed", async () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="dash-icon" />}>
                  Dashboard
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("dash-icon"));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Dashboard");
    });
  });

  it("does not show tooltip on SidebarLink when sidebar is expanded", () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider defaultCollapsed={false}>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="dash-icon" />}>
                  Dashboard
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      document.querySelector('[role="tooltip"]'),
    ).not.toBeInTheDocument();
  });

  it("extracts label text from nested children for tooltip", async () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="bell-icon" />}>
                  Notification <strong>Templates</strong>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("bell-icon"));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toHaveTextContent("Notification Templates");
    });
  });

  it("wraps asChild link in tooltip when collapsed", async () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink asChild>
                  <a>Reports</a>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    fireEvent.mouseEnter(screen.getByRole("link", { name: "Reports" }));
    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Reports");
    });
  });

  it("does not render tooltip when link has no label text", () => {
    mockMatchMedia(false);

    render(
      <SidebarProvider defaultCollapsed>
        <Sidebar>
          <SidebarContent>
            <SidebarNav aria-label="Main">
              <SidebarItem>
                <SidebarLink icon={<span data-testid="icon-only" />}>
                  <SidebarBadge>1</SidebarBadge>
                </SidebarLink>
              </SidebarItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(
      document.querySelector('[role="tooltip"]'),
    ).not.toBeInTheDocument();
  });
});
