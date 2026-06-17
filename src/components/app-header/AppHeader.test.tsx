import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "./AppHeader";
import { AppHeaderActions } from "./AppHeader";
import { AppHeaderSearch } from "./AppHeaderSearch";
import { AppHeaderNotifications } from "./AppHeaderNotifications";
import { AppHeaderProfile } from "./AppHeaderProfile";

describe("AppHeader", () => {
  it("renders children", () => {
    render(<AppHeader>Hello</AppHeader>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AppHeader ref={ref}>Hi</AppHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges className", () => {
    const { container } = render(<AppHeader className="custom">Hi</AppHeader>);
    expect(container.firstElementChild).toHaveClass("custom");
    expect(container.firstElementChild).toHaveClass("gsl-app-header");
  });
});

describe("AppHeaderActions", () => {
  it("renders children", () => {
    render(<AppHeaderActions>Actions</AppHeaderActions>);
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AppHeaderActions ref={ref}>A</AppHeaderActions>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
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

describe("AppHeaderProfile", () => {
  const user = {
    name: "Kwame",
    role: "Admin",
    initials: "KA",
    email: "kwame@example.com",
  };

  it("renders user name and role in trigger", () => {
    render(<AppHeaderProfile user={user} />);
    expect(screen.getByText("Kwame")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AppHeaderProfile user={user} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("opens full popover with email on click", async () => {
    const userEvents = userEvent.setup();
    render(<AppHeaderProfile user={user} variant="full" />);

    await userEvents.click(screen.getByText("Kwame"));
    expect(screen.getByText("kwame@example.com")).toBeInTheDocument();
  });

  it("renders basic popover without email", async () => {
    const userEvents = userEvent.setup();
    render(<AppHeaderProfile user={user} variant="basic" />);

    await userEvents.click(screen.getByText("Kwame"));
    expect(screen.queryByText("kwame@example.com")).not.toBeInTheDocument();
    // Admin appears in both trigger and popover — verify at least 2 instances
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(2);
  });

  it("renders action buttons as children", async () => {
    const userEvents = userEvent.setup();
    render(
      <AppHeaderProfile user={user} variant="full">
        <button data-testid="action-btn">Settings</button>
      </AppHeaderProfile>,
    );

    await userEvents.click(screen.getByText("Kwame"));
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });
});
