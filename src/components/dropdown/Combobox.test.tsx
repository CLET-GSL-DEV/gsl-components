import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DropdownOption } from "../../types/dropdown";
import { Combobox } from "./Combobox";

const users: DropdownOption[] = [
  { value: "u1", label: "Ada Lovelace" },
  { value: "u2", label: "Grace Hopper" },
];

function ControlledCombobox({
  initialValue = null,
  onChange = vi.fn(),
  loadOptions,
  debounceMs = 300,
  minSearchLength = 0,
  clearable = false,
}: {
  initialValue?: string | null;
  onChange?: (value: string | null) => void;
  loadOptions: (query: string) => Promise<DropdownOption[]>;
  debounceMs?: number;
  minSearchLength?: number;
  clearable?: boolean;
}) {
  const [value, setValue] = useState<string | null>(initialValue);

  return (
    <Combobox
      ariaLabel="User"
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
      loadOptions={loadOptions}
      debounceMs={debounceMs}
      minSearchLength={minSearchLength}
      clearable={clearable}
      getOptionLabel={(id) => users.find((user) => user.value === id)?.label}
    />
  );
}

describe("Combobox", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholder when empty", () => {
    const loadOptions = vi.fn().mockResolvedValue([]);

    render(<ControlledCombobox loadOptions={loadOptions} />);

    expect(screen.getByRole("combobox", { name: "User" })).toHaveAttribute(
      "placeholder",
      "Search...",
    );
  });

  it("debounces loadOptions calls", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn().mockResolvedValue(users);

    render(<ControlledCombobox loadOptions={loadOptions} debounceMs={300} />);

    await user.click(screen.getByRole("combobox", { name: "User" }));
    await user.type(screen.getByRole("combobox", { name: "User" }), "ada");

    expect(loadOptions).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(loadOptions).toHaveBeenCalledWith("ada");
  });

  it("shows loading then results", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(
      () =>
        new Promise<DropdownOption[]>((resolve) => {
          window.setTimeout(() => resolve(users), 100);
        }),
    );

    render(<ControlledCombobox loadOptions={loadOptions} debounceMs={100} />);

    await user.click(screen.getByRole("combobox", { name: "User" }));
    await user.type(screen.getByRole("combobox", { name: "User" }), "a");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(screen.getByRole("status", { name: "Loading..." })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Ada Lovelace" })).toBeInTheDocument();
    });
  });

  it("selects an option and closes the menu", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const loadOptions = vi.fn().mockResolvedValue(users);

    render(
      <ControlledCombobox loadOptions={loadOptions} onChange={onChange} debounceMs={100} />,
    );

    await user.click(screen.getByRole("combobox", { name: "User" }));
    await user.type(screen.getByRole("combobox", { name: "User" }), "ada");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Ada Lovelace" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("option", { name: "Ada Lovelace" }));

    expect(onChange).toHaveBeenCalledWith("u1");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "User" })).toHaveValue(
      "Ada Lovelace",
    );
  });

  it("ignores stale responses", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn((query: string) => {
      const delay = query === "a" ? 200 : 50;
      return new Promise<DropdownOption[]>((resolve) => {
        window.setTimeout(() => {
          resolve(
            users.filter((user) =>
              user.label.toLowerCase().includes(query.toLowerCase()),
            ),
          );
        }, delay);
      });
    });

    render(<ControlledCombobox loadOptions={loadOptions} debounceMs={50} />);

    const input = screen.getByRole("combobox", { name: "User" });
    await user.click(input);
    await user.type(input, "a");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    await user.clear(input);
    await user.type(input, "grace");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Grace Hopper" })).toBeInTheDocument();
    });

    expect(screen.queryByRole("option", { name: "Ada Lovelace" })).not.toBeInTheDocument();
  });

  it("does not search below minSearchLength", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn().mockResolvedValue(users);

    render(
      <ControlledCombobox
        loadOptions={loadOptions}
        debounceMs={100}
        minSearchLength={2}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "User" }));
    await user.type(screen.getByRole("combobox", { name: "User" }), "a");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(loadOptions).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn().mockResolvedValue(users);

    render(<ControlledCombobox loadOptions={loadOptions} debounceMs={100} />);

    await user.click(screen.getByRole("combobox", { name: "User" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clears the value when clearable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const loadOptions = vi.fn().mockResolvedValue(users);

    render(
      <ControlledCombobox
        initialValue="u1"
        loadOptions={loadOptions}
        onChange={onChange}
        clearable
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(onChange).toHaveBeenCalledWith(null);
    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "User" })).toHaveValue("");
    });
  });
});
