import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs/Tabs";
import { useTabsState } from "./useTabsState";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="search">{location.search}</span>;
}

function renderUrlTabs({
  paramKey = "tab",
  defaultValue = "account",
  entries = ["/"],
}: {
  paramKey?: string;
  defaultValue?: string;
  entries?: string[];
} = {}) {
  function UrlTabs() {
    const [tab, setTab] = useTabsState(paramKey, defaultValue);
    return (
      <>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="account">Account settings</TabsContent>
          <TabsContent value="security">Security settings</TabsContent>
        </Tabs>
        <LocationProbe />
      </>
    );
  }

  return render(
    <MemoryRouter initialEntries={entries}>
      <UrlTabs />
    </MemoryRouter>,
  );
}

describe("useTabsState", () => {
  it("falls back to the default value with no param", () => {
    renderUrlTabs();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account settings");
  });

  it("restores the tab from the URL (shared links)", () => {
    renderUrlTabs({ entries: ["/?tab=security"] });
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security settings");
  });

  it("writes the param and updates the panel on change", async () => {
    const user = userEvent.setup();
    renderUrlTabs();

    await user.click(screen.getByRole("tab", { name: "Security" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Security settings");
    expect(screen.getByTestId("search")).toHaveTextContent("tab=security");
  });

  it("drops the param when the default tab is selected", async () => {
    const user = userEvent.setup();
    renderUrlTabs({ entries: ["/?tab=security"] });

    await user.click(screen.getByRole("tab", { name: "Account" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account settings");
    expect(screen.getByTestId("search")).toHaveTextContent("");
  });

  it("keeps tab sets independent by param key", () => {
    function TwoSets() {
      const [a, setA] = useTabsState("team-a", "account");
      const [b, setB] = useTabsState("team-b", "security");
      return (
        <>
          <span data-testid="a">{a}</span>
          <span data-testid="b">{b}</span>
          <Tabs value={a} onValueChange={setA}>
            <TabsList>
              <TabsTrigger value="account">A</TabsTrigger>
            </TabsList>
            <TabsContent value="account">a</TabsContent>
          </Tabs>
          <Tabs value={b} onValueChange={setB}>
            <TabsList>
              <TabsTrigger value="security">B</TabsTrigger>
            </TabsList>
            <TabsContent value="security">b</TabsContent>
          </Tabs>
        </>
      );
    }

    render(
      <MemoryRouter initialEntries={["/?team-a=security"]}>
        <TwoSets />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("a")).toHaveTextContent("security");
    expect(screen.getByTestId("b")).toHaveTextContent("security");
  });
});
