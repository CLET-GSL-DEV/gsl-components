import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

function renderBasicTabs({
  onValueChange,
  defaultValue = "account",
}: {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
} = {}) {
  return render(
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="security">Security settings</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("shows the default panel and switches on click", async () => {
    const user = userEvent.setup();

    renderBasicTabs();

    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account settings");

    await user.click(screen.getByRole("tab", { name: "Security" }));

    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security settings");
  });

  it("calls onValueChange when a tab is selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderBasicTabs({ onValueChange });

    await user.click(screen.getByRole("tab", { name: "Security" }));

    expect(onValueChange).toHaveBeenCalledWith("security");
  });

  it("reflects controlled value", async () => {
    const user = userEvent.setup();

    function ControlledTabs() {
      const [value, setValue] = useState("account");

      return (
        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="account">Account settings</TabsContent>
          <TabsContent value="security">Security settings</TabsContent>
        </Tabs>
      );
    }

    render(<ControlledTabs />);

    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account settings");

    await user.click(screen.getByRole("tab", { name: "Security" }));

    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security settings");
  });

  it("applies line variant class on root", () => {
    render(
      <Tabs defaultValue="account" variant="line">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings</TabsContent>
      </Tabs>,
    );

    expect(document.querySelector(".gsl-tabs")).toHaveClass("gsl-tabs--line");
  });

  it("merges classNames onto list, trigger, and content", () => {
    render(
      <Tabs
        defaultValue="account"
        classNames={{ root: "custom-tabs" }}
      >
        <TabsList classNames={{ list: "custom-list" }}>
          <TabsTrigger
            value="account"
            classNames={{ trigger: "custom-trigger" }}
          >
            Account
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="account"
          classNames={{ content: "custom-content" }}
        >
          Account settings
        </TabsContent>
      </Tabs>,
    );

    expect(document.querySelector(".gsl-tabs")).toHaveClass("custom-tabs");
    expect(document.querySelector(".gsl-tabs__list")).toHaveClass(
      "custom-list",
    );
    expect(screen.getByRole("tab", { name: "Account" })).toHaveClass(
      "custom-trigger",
    );
    expect(screen.getByRole("tabpanel")).toHaveClass("custom-content");
  });

  it("does not activate a disabled trigger", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Tabs defaultValue="account" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security" disabled>
            Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings</TabsContent>
        <TabsContent value="security">Security settings</TabsContent>
      </Tabs>,
    );

    const securityTab = screen.getByRole("tab", { name: "Security" });
    expect(securityTab).toBeDisabled();

    await user.click(securityTab);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account settings");
  });

  it("renders a sliding indicator for horizontal line tabs", () => {
    render(
      <Tabs defaultValue="account" variant="line">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings</TabsContent>
        <TabsContent value="security">Security settings</TabsContent>
      </Tabs>,
    );

    const list = document.querySelector(".gsl-tabs__list");
    expect(list?.querySelector(".gsl-tabs__indicator")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Account" })).toHaveStyle({
      borderStyle: "none",
    });
  });

  it("renders a sliding indicator for vertical line tabs", () => {
    render(
      <Tabs defaultValue="account" variant="line" orientation="vertical">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings</TabsContent>
        <TabsContent value="security">Security settings</TabsContent>
      </Tabs>,
    );

    const list = document.querySelector(".gsl-tabs__list");
    expect(list).toHaveAttribute("data-orientation", "vertical");
    expect(list?.querySelector(".gsl-tabs__indicator")).toBeInTheDocument();
  });
});
