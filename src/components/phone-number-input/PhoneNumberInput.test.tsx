import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { countries, getFlagEmoji } from "../../utils/countries";

describe("PhoneNumberInput", () => {
  it("renders prefix button with default country (US)", () => {
    render(<PhoneNumberInput />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders the US flag emoji by default", () => {
    render(<PhoneNumberInput />);
    expect(screen.getByText(getFlagEmoji("US"))).toBeInTheDocument();
  });

  it("renders a tel input with placeholder", () => {
    render(<PhoneNumberInput />);
    const input = screen.getByPlaceholderText("(555) 000-0000");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "tel");
  });

  it("forwards ref to the tel input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<PhoneNumberInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute("type", "tel");
  });

  it("applies invalid styling and aria-invalid", () => {
    render(<PhoneNumberInput invalid />);
    expect(
      document.querySelector(".gsl-phone-number-input--invalid"),
    ).toBeInTheDocument();
    expect(document.querySelector(".gsl-phone-number-input")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("applies disabled styling", () => {
    render(<PhoneNumberInput disabled />);
    expect(
      document.querySelector(".gsl-phone-number-input--disabled"),
    ).toBeInTheDocument();
  });

  it("disables prefix button and input when disabled", () => {
    render(<PhoneNumberInput disabled />);
    expect(screen.getByText("+1").closest("button")).toBeDisabled();
    expect(screen.getByPlaceholderText("(555) 000-0000")).toBeDisabled();
  });

  it("does not open dropdown when disabled", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput disabled />);
    await user.click(screen.getByText("+1").closest("button")!);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("merges classNames onto parts", () => {
    render(
      <PhoneNumberInput
        className="custom-classname"
        classNames={{
          root: "custom-root",
          prefix: "custom-prefix",
          input: "custom-input",
        }}
      />,
    );
    expect(
      document.querySelector(".gsl-phone-number-input"),
    ).toHaveClass("custom-root");
    expect(
      document.querySelector(".gsl-phone-number-input"),
    ).toHaveClass("custom-classname");
    expect(
      document.querySelector(".gsl-phone-number-input__prefix"),
    ).toHaveClass("custom-prefix");
    expect(
      document.querySelector(".gsl-phone-number-input__input"),
    ).toHaveClass("custom-input");
  });

  it("emits full international number when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PhoneNumberInput onChange={onChange} />,
    );

    const input = screen.getByPlaceholderText("(555) 000-0000");
    await user.type(input, "555");

    // onChange receives dial code + local number
    expect(onChange).toHaveBeenLastCalledWith("+1555");
  });

  it("strips non-digit chars but keeps dial code prefix", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PhoneNumberInput onChange={onChange} />,
    );

    const input = screen.getByPlaceholderText("(555) 000-0000");
    await user.type(input, "abc555def");

    expect(onChange).toHaveBeenLastCalledWith("+1555");
  });

  it("shows only local number in input for controlled value", () => {
    render(<PhoneNumberInput value="+44123456789" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("(555) 000-0000");
    // Input shows local number stripped of the +44 prefix
    expect(input).toHaveValue("123456789");
  });

  it("auto-selects country from controlled value dial code", () => {
    render(<PhoneNumberInput value="+233241234567" onChange={() => {}} />);
    // Ghana (+233) should be auto-detected
    expect(screen.getByText("+233")).toBeInTheDocument();
    expect(screen.getByText(getFlagEmoji("GH"))).toBeInTheDocument();
  });

  it("falls back to default country when value has no matching dial code", () => {
    render(<PhoneNumberInput value="5551234" onChange={() => {}} />);
    // No "+" prefix matches no country — stays on default US
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("(555) 000-0000")).toHaveValue(
      "5551234",
    );
  });

  it("opens dropdown on prefix click", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("shows expanded aria-expanded on prefix when open", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    const prefix = screen.getByText("+1").closest("button")!;
    expect(prefix).toHaveAttribute("aria-expanded", "false");
    await user.click(prefix);
    expect(prefix).toHaveAttribute("aria-expanded", "true");
  });

  it("closes dropdown on Escape key", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes dropdown on blur", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters countries when typing in search", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    const searchInput = await screen.findByPlaceholderText(
      "Search country...",
    );
    await user.type(searchInput, "afghan");
    expect(screen.getByText("Afghanistan")).toBeInTheDocument();
    expect(screen.queryByText("United States")).not.toBeInTheDocument();
  });

  it("filters countries by dial code", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    const searchInput = await screen.findByPlaceholderText(
      "Search country...",
    );
    await user.type(searchInput, "+44");
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
  });

  it("selects a different country from dropdown", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneNumberInput onChange={onChange} />);
    await user.click(screen.getByText("+1").closest("button")!);
    const gbOption = await screen.findByRole("option", {
      name: /United Kingdom/,
    });
    await user.click(gbOption);
    // Prefix updates
    expect(screen.getByText("+44")).toBeInTheDocument();
    expect(screen.getByText(getFlagEmoji("GB"))).toBeInTheDocument();
  });

  it("closes dropdown after selecting a country", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    const gbOption = await screen.findByRole("option", {
      name: /United Kingdom/,
    });
    await user.click(gbOption);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("emits full number when changing country with existing local number", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneNumberInput onChange={onChange} />);

    // Type a local number first
    const input = screen.getByPlaceholderText("(555) 000-0000");
    await user.type(input, "2025551234");
    expect(onChange).toHaveBeenLastCalledWith("+12025551234");

    // Now switch country
    await user.click(screen.getByText("+1").closest("button")!);
    const gbOption = await screen.findByRole("option", {
      name: /United Kingdom/,
    });
    await user.click(gbOption);

    expect(onChange).toHaveBeenLastCalledWith("+442025551234");
  });

  it("clears search after selecting a country", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    const searchInput = await screen.findByPlaceholderText(
      "Search country...",
    );
    await user.type(searchInput, "united");
    const gbOption = await screen.findByRole("option", {
      name: /United Kingdom/,
    });
    await user.click(gbOption);
    // Reopen
    await user.click(screen.getByText("+44").closest("button")!);
    const reopenedSearch = await screen.findByPlaceholderText(
      "Search country...",
    );
    expect(reopenedSearch).toHaveValue("");
  });

  it("uses custom defaultCountry", () => {
    render(<PhoneNumberInput defaultCountry="GB" />);
    expect(screen.getByText("+44")).toBeInTheDocument();
  });

  it("rotates chevron when open", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    expect(
      document.querySelector(".gsl-phone-number-input__chevron--open"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByText("+1").closest("button")!);
    await screen.findByRole("listbox");
    expect(
      document.querySelector(".gsl-phone-number-input__chevron--open"),
    ).toBeInTheDocument();
  });

  it("renders country options with flags and dial codes in dropdown", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput />);
    await user.click(screen.getByText("+1").closest("button")!);
    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(countries.length);
    expect(options[0].textContent).toContain(getFlagEmoji("AF"));
    expect(options[0].textContent).toContain("+93");
  });

  it("marks the selected country option", async () => {
    const user = userEvent.setup();
    render(<PhoneNumberInput defaultCountry="GB" />);
    await user.click(screen.getByText("+44").closest("button")!);
    const selectedOption = await screen.findByRole("option", {
      name: /United Kingdom/,
    });
    expect(selectedOption).toHaveAttribute("aria-selected", "true");
  });

  // Uncontrolled mode
  it("manages internal state in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneNumberInput onChange={onChange} />);

    const input = screen.getByPlaceholderText("(555) 000-0000");
    await user.type(input, "2025551234");

    expect(onChange).toHaveBeenLastCalledWith("+12025551234");
  });

  it("initializes country from defaultCountry in uncontrolled mode", () => {
    render(<PhoneNumberInput defaultCountry="GH" />);
    expect(screen.getByText("+233")).toBeInTheDocument();
  });

  it("preserves leading zero in local number when dialing with Ghana", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneNumberInput defaultCountry="GH" onChange={onChange} />);

    const input = screen.getByPlaceholderText("(555) 000-0000");
    await user.type(input, "02054321022");

    // Leading 0 is preserved in the local part; dial code is prepended
    expect(onChange).toHaveBeenLastCalledWith("+23302054321022");
  });

  it("displays controlled Ghana number without leading zero", () => {
    render(<PhoneNumberInput value="+2332054321022" onChange={() => {}} />);

    // Ghana flag and dial code
    expect(screen.getByText("+233")).toBeInTheDocument();
    // Input shows local number stripped of dial code (no leading 0)
    expect(screen.getByPlaceholderText("(555) 000-0000")).toHaveValue(
      "2054321022",
    );
  });

  // RHF integration
  it("works with react-hook-form controlled", async () => {
    const user = userEvent.setup();

    function Form() {
      const form = useForm<{ phone: string }>({
        defaultValues: { phone: "+12025551234" },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <PhoneNumberInput
            value={form.watch("phone")}
            onChange={(v) => form.setValue("phone", v ?? "")}
          />
          <span data-testid="value">{form.watch("phone")}</span>
        </form>
      );
    }

    render(<Form />);
    expect(screen.getByTestId("value")).toHaveTextContent("+12025551234");

    const input = screen.getByPlaceholderText("(555) 000-0000");
    await user.clear(input);
    await user.type(input, "5550000");

    expect(screen.getByTestId("value")).toHaveTextContent("+15550000");
  });
});
