import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "./AppHeader";
import { AppHeaderActions } from "./AppHeader";
import { AppHeaderBranding } from "./AppHeader";
import { AppHeaderSearch } from "./AppHeaderSearch";
import { AppHeaderNotifications } from "./AppHeaderNotifications";
import { AppHeaderNotificationItem } from "./AppHeaderNotificationItem";
import { AppSwitcher } from "../app-switcher/AppSwitcher";
import { SystemAppIcon } from "../app-switcher/SystemAppIcon";
import { ProfilePopover } from "../profile-popover/ProfilePopover";
import { SidebarProvider } from "../sidebar/SidebarContext";

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

function renderFullHeader() {
  return render(
    <SidebarProvider>
      <AppHeader variant="plain">
        <AppHeaderBranding title="GSL PORTAL" />
        <AppHeaderActions>
          <AppSwitcher apps={[{ id: "a", name: "App A", icon: <SystemAppIcon name="App A" /> }]} />
          <AppHeaderNotifications />
          <ProfilePopover
            user={{ name: "Kwame Asante", role: "Admin", initials: "KA" }}
            variant="avatar"
          />
        </AppHeaderActions>
      </AppHeader>
    </SidebarProvider>,
  );
}

describe("AppHeader", () => {
  it("renders children", () => {
    render(<AppHeader>Hello</AppHeader>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders standalone without a SidebarProvider", () => {
    render(<AppHeader>Hello</AppHeader>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders full children on desktop", () => {
    mockMatchMedia(false);
    renderFullHeader();

    expect(screen.getByText("GSL PORTAL")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open app switcher" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open menu" })).not.toBeInTheDocument();
  });

  it("collapses to menu + app switcher + profile on mobile", () => {
    mockMatchMedia(true);
    renderFullHeader();

    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open app switcher" }),
    ).toBeInTheDocument();
    expect(screen.getByText("KA")).toBeInTheDocument();

    // Dropped on mobile
    expect(screen.queryByText("GSL PORTAL")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Notifications" }),
    ).not.toBeInTheDocument();
  });
});

describe("AppHeaderActions", () => {
  it("renders children", () => {
    render(<AppHeaderActions>Actions</AppHeaderActions>);
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders with right-side class", () => {
    const { container } = render(<AppHeaderActions>X</AppHeaderActions>);
    expect(container.firstElementChild).toHaveClass("gsl-app-header__right");
  });
});

describe("AppHeaderSearch", () => {
  it("renders search input", () => {
    render(<AppHeaderSearch />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Search...",
    );
  });

  it("forwards ref to input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<AppHeaderSearch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("renders custom placeholder", () => {
    render(<AppHeaderSearch placeholder="Find..." />);
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Find...",
    );
  });

  it("fires debounced onSearch when typing", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<AppHeaderSearch onSearch={onSearch} />);
    await user.type(screen.getByRole("combobox"), "test");

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith("test");
      },
      { timeout: 500 },
    );
  });

  it("shows data groups when search has text", async () => {
    const user = userEvent.setup();
    const data = [
      {
        heading: "Results",
        items: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }],
      },
    ];

    render(<AppHeaderSearch data={data} />);

    await user.type(screen.getByRole("combobox"), "a");
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("shows empty state when showEmpty is true", async () => {
    const user = userEvent.setup();
    render(<AppHeaderSearch data={[]} showEmpty emptyLabel="Nothing found" />);

    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });

  it("renders children inside CommandList", async () => {
    const user = userEvent.setup();
    render(
      <AppHeaderSearch data={[{ heading: "G", items: [] }]}>
        <span data-testid="custom">Custom child</span>
      </AppHeaderSearch>,
    );

    await user.type(screen.getByRole("combobox"), "x");
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  // RHF integration
  it("works with react-hook-form via onSearch callback", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ query: string }>({ defaultValues: { query: "" } });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <AppHeaderSearch
            onSearch={(v) => form.setValue("query", v)}
          />
          <span data-testid="query">{form.watch("query")}</span>
        </form>
      );
    }

    render(<Form />);
    await user.type(screen.getByRole("combobox"), "hello");

    await waitFor(
      () => {
        expect(screen.getByTestId("query")).toHaveTextContent("hello");
      },
      { timeout: 500 },
    );
  });
});

describe("AppHeaderNotifications", () => {
  it("renders bell button", () => {
    render(<AppHeaderNotifications />);
    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
  });

  it("forwards ref to button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<AppHeaderNotifications ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("opens popover on click", async () => {
    const user = userEvent.setup();
    render(
      <AppHeaderNotifications>
        <span data-testid="item">New notification</span>
      </AppHeaderNotifications>,
    );

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByTestId("item")).toBeInTheDocument();
  });

  it("shows loading skeleton", async () => {
    const user = userEvent.setup();
    render(<AppHeaderNotifications loading />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    // Popover renders in portal — query document for skeleton class
    expect(document.querySelector(".gsl-notif-popover__skeleton")).toBeInTheDocument();
  });
});

describe("AppHeaderNotificationItem", () => {
  it("renders text and time", () => {
    render(<AppHeaderNotificationItem text="New comment" time="2m ago" />);
    expect(screen.getByText("New comment")).toBeInTheDocument();
    expect(screen.getByText("2m ago")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AppHeaderNotificationItem ref={ref} text="Hi" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("shows the unread dot only when unread", () => {
    const { rerender, container } = render(
      <AppHeaderNotificationItem text="Hi" unread />,
    );
    expect(container.querySelector(".gsl-notif-popover__dot")).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveClass(
      "gsl-notif-popover__item--read",
    );

    rerender(<AppHeaderNotificationItem text="Hi" />);
    expect(container.querySelector(".gsl-notif-popover__dot")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(
      "gsl-notif-popover__item--read",
    );
  });

  it("is not focusable/clickable without onClick", () => {
    render(<AppHeaderNotificationItem text="Hi" />);
    const row = screen.getByText("Hi").closest(".gsl-notif-popover__item");
    expect(row).not.toHaveAttribute("role");
    expect(row).not.toHaveAttribute("tabindex");
  });

  it("calls onClick when clicked or activated via keyboard", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<AppHeaderNotificationItem text="Hi" onClick={onClick} />);

    const row = screen.getByRole("button");
    await user.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);

    row.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);

    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});
