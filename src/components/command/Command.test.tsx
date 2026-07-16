import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./Command";
import {
  formatCommandShortcutLabels,
  matchesCommandShortcut,
  parseCommandShortcut,
} from "./hooks/parseCommandShortcut";

function renderInlineCommand({
  onSelectEmail,
  onSelectName,
}: {
  onSelectEmail?: () => void;
  onSelectName?: () => void;
} = {}) {
  return render(
    <Command label="Field picker">
      <CommandInput placeholder="Search fields..." aria-label="Search fields" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Fields">
          <CommandItem value="email" onSelect={onSelectEmail}>
            Email
          </CommandItem>
          <CommandItem value="name" onSelect={onSelectName}>
            Full name
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  );
}

describe("Command", () => {
  it("renders input wrapper, icon, and items", async () => {
    const user = userEvent.setup();
    renderInlineCommand();

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(document.querySelector(".clet-command__input-wrapper")).toBeInTheDocument();
    expect(document.querySelector(".clet-command__input-icon")).toBeInTheDocument();

    // Focus to open the popover so items are mounted
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Full name")).toBeInTheDocument();
  });

  it("renders inline list as a floating popover", async () => {
    const user = userEvent.setup();
    renderInlineCommand();

    // Focus to open the popover
    await user.click(screen.getByRole("combobox"));

    const popover = document.querySelector(".clet-command__popover");
    expect(popover).toBeInTheDocument();
    const list = popover?.querySelector(".clet-command__list");
    expect(list).toBeInTheDocument();
  });

  it("filters items when typing in the input", async () => {
    const user = userEvent.setup();

    renderInlineCommand();

    await user.type(screen.getByRole("combobox"), "email");

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.queryByText("Full name")).not.toBeInTheDocument();
  });

  it("calls onSelect when an item is clicked", async () => {
    const user = userEvent.setup();
    const onSelectEmail = vi.fn();

    renderInlineCommand({ onSelectEmail });

    // Focus the input to open the popover
    await user.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Email"));

    expect(onSelectEmail).toHaveBeenCalledWith("email");
  });

  it("merges classNames onto command parts", () => {
    render(
      <Command classNames={{ root: "custom-command" }}>
        <CommandInput
          classNames={{ wrapper: "custom-wrapper", input: "custom-input" }}
        />
        <CommandList>
          <CommandItem classNames={{ item: "custom-item" }} value="one">
            One
          </CommandItem>
        </CommandList>
      </Command>,
    );

    expect(document.querySelector(".clet-command")).toHaveClass("custom-command");
    expect(document.querySelector(".clet-command__input-wrapper")).toHaveClass(
      "custom-wrapper",
    );
    expect(screen.getByRole("combobox")).toHaveClass("custom-input");
    expect(document.querySelector('[data-value="one"]')).toHaveClass("custom-item");
  });

  it("shows input shortcut badge when CommandDialog shortcut is set", () => {
    render(
      <CommandDialog open shortcut label="Command menu">
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandItem value="dashboard">Dashboard</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    const shortcut = document.querySelector("kbd.clet-command__input-shortcut");
    expect(shortcut).toBeInTheDocument();
    expect(
      shortcut?.querySelectorAll(".clet-command__shortcut-key").length,
    ).toBeGreaterThan(0);
  });

  it("hides input shortcut badge when CommandInput shortcut is false", () => {
    render(
      <CommandDialog open shortcut label="Command menu">
        <CommandInput placeholder="Type a command..." shortcut={false} />
        <CommandList>
          <CommandItem value="dashboard">Dashboard</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    expect(
      document.querySelector(".clet-command__input-shortcut"),
    ).not.toBeInTheDocument();
  });

  it("shows empty state when no items match", async () => {
    const user = userEvent.setup();

    renderInlineCommand();

    await user.type(screen.getByRole("combobox"), "zzzz");

    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("shows group loading state and hides children", () => {
    render(
      <Command label="Field picker">
        <CommandList>
          <CommandGroup heading="Fields" loading loadingLabel="Loading fields">
            <CommandItem value="email">Email</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(document.querySelector(".clet-command__group-loading")).toBeInTheDocument();
    expect(document.querySelector(".clet-command__skeleton-line")).toBeInTheDocument();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
    expect(document.querySelector('[role="status"][aria-label="Loading fields"]')).toBeInTheDocument();
  });

  it("renders group children when not loading", () => {
    render(
      <Command label="Field picker">
        <CommandList>
          <CommandGroup heading="Fields">
            <CommandItem value="email">Email</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(document.querySelector(".clet-command__group-loading")).not.toBeInTheDocument();
    expect(document.querySelector('[data-value="email"]')).toBeInTheDocument();
  });

  it("shows group loading inside CommandDialog", () => {
    render(
      <CommandDialog open label="Command menu">
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandGroup heading="Navigation" loading>
            <CommandItem value="dashboard">Dashboard</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>,
    );

    expect(document.querySelector(".clet-command__group-loading")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("shows dialog content when open", () => {
    render(
      <CommandDialog open label="Command menu">
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandItem value="dashboard">Dashboard</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("hides dialog content when closed", () => {
    render(
      <CommandDialog open={false} label="Command menu">
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandItem value="dashboard">Dashboard</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders CommandShortcut inside an item", () => {
    render(
      <Command label="Actions">
        <CommandList>
          <CommandItem value="sign-out">
            Sign out
            <CommandShortcut>
              <span>⌘</span>
              <span>Q</span>
            </CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );

    const shortcut = document.querySelector(".clet-command__shortcut");
    expect(shortcut).toBeInTheDocument();
  });

  it("toggles CommandDialog when shortcut is pressed", () => {
    const onOpenChange = vi.fn();

    render(
      <CommandDialog
        open={false}
        onOpenChange={onOpenChange}
        shortcut
        label="Command menu"
      >
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandItem value="dashboard">Dashboard</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    fireEvent.keyDown(document, {
      key: "k",
      ctrlKey: true,
      metaKey: false,
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("ignores shortcut while focus is in an input", () => {
    const onOpenChange = vi.fn();

    render(
      <>
        <input data-testid="other-input" aria-label="Other input" />
        <CommandDialog
          open={false}
          onOpenChange={onOpenChange}
          shortcut
          label="Command menu"
        >
          <CommandInput placeholder="Type a command..." />
          <CommandList>
            <CommandItem value="dashboard">Dashboard</CommandItem>
          </CommandList>
        </CommandDialog>
      </>,
    );

    screen.getByTestId("other-input").focus();

    fireEvent.keyDown(document, {
      key: "k",
      ctrlKey: true,
      metaKey: false,
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("parseCommandShortcut", () => {
  it("parses mod+k with platform-appropriate modifier", () => {
    const parsed = parseCommandShortcut("mod+k");
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

    expect(parsed.key).toBe("k");
    expect(parsed.metaKey).toBe(isMac);
    expect(parsed.ctrlKey).toBe(!isMac);
  });

  it("matches keyboard events for a parsed shortcut", () => {
    const event = new KeyboardEvent("keydown", {
      key: "p",
      ctrlKey: true,
      shiftKey: true,
    });

    expect(matchesCommandShortcut(event, "ctrl+shift+p")).toBe(true);
    expect(matchesCommandShortcut(event, "ctrl+p")).toBe(false);
  });

  it("formats shortcut labels for display", () => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

    expect(formatCommandShortcutLabels("mod+k")).toEqual(
      isMac ? ["⌘", "K"] : ["Ctrl", "K"],
    );
    expect(formatCommandShortcutLabels("ctrl+shift+p")).toEqual([
      "Ctrl",
      "Shift",
      "P",
    ]);
  });
});
