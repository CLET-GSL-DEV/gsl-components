import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../button/Button";
import {
  Popup,
  PopupBody,
  PopupClose,
  PopupContent,
  PopupDescription,
  PopupFooter,
  PopupHeader,
  PopupTitle,
  PopupTrigger,
} from "./Popup";

describe("Popup", () => {
  it("opens content when the trigger is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Popup>
        <PopupTrigger asChild>
          <Button>Open</Button>
        </PopupTrigger>
        <PopupContent>
          <PopupHeader>
            <PopupTitle>Title</PopupTitle>
            <PopupDescription>Description text</PopupDescription>
          </PopupHeader>
        </PopupContent>
      </Popup>,
    );

    expect(screen.queryByText("Title")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Popup>
          <PopupTrigger asChild>
            <Button>Open</Button>
          </PopupTrigger>
          <PopupContent>
            <PopupTitle>Title</PopupTitle>
          </PopupContent>
        </Popup>
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Title")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("closes when a PopupClose action is activated", async () => {
    const user = userEvent.setup();

    render(
      <Popup>
        <PopupTrigger asChild>
          <Button>Open</Button>
        </PopupTrigger>
        <PopupContent>
          <PopupTitle>Title</PopupTitle>
          <PopupFooter>
            <PopupClose asChild>
              <Button variant="outline">Cancel</Button>
            </PopupClose>
            <Button variant="primary">Confirm</Button>
          </PopupFooter>
        </PopupContent>
      </Popup>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Title")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("renders a stacked footer layout", async () => {
    const user = userEvent.setup();

    render(
      <Popup>
        <PopupTrigger asChild>
          <Button>Open</Button>
        </PopupTrigger>
        <PopupContent>
          <PopupBody>Body content</PopupBody>
          <PopupFooter layout="stack">
            <Button variant="primary">Confirm</Button>
            <Button variant="outline">Cancel</Button>
          </PopupFooter>
        </PopupContent>
      </Popup>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Body content").closest(".clet-popup__body")).not.toBeNull();
    expect(screen.getByText("Confirm").closest(".clet-popup__footer")).toHaveClass(
      "clet-popup__footer--stack",
    );
  });

  it("shows a close button when showCloseButton is set", async () => {
    const user = userEvent.setup();

    render(
      <Popup>
        <PopupTrigger asChild>
          <Button>Open</Button>
        </PopupTrigger>
        <PopupContent showCloseButton>
          <PopupTitle>Title</PopupTitle>
        </PopupContent>
      </Popup>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("merges classNames onto content", async () => {
    const user = userEvent.setup();

    render(
      <Popup>
        <PopupTrigger asChild>
          <Button>Open</Button>
        </PopupTrigger>
        <PopupContent classNames={{ content: "custom-popup" }}>
          <PopupTitle>Title</PopupTitle>
        </PopupContent>
      </Popup>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Title").closest(".clet-popup")).toHaveClass(
      "clet-popup",
      "custom-popup",
    );
  });
});
