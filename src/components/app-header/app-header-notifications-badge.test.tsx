import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppHeaderNotificationItem } from "./AppHeaderNotificationItem";
import { AppHeaderNotifications } from "./AppHeaderNotifications";

const badgeOf = (container: HTMLElement) =>
  container.querySelector(".clet-app-header__notif-badge");

describe("AppHeaderNotifications badge", () => {
  it("counts unread items by default", () => {
    const { container } = render(
      <AppHeaderNotifications>
        <AppHeaderNotificationItem text="One" unread />
        <AppHeaderNotificationItem text="Two" unread />
        <AppHeaderNotificationItem text="Three" />
      </AppHeaderNotifications>,
    );
    expect(badgeOf(container)).toHaveTextContent("2");
  });

  it("keeps the accessible name and describes the count", () => {
    render(
      <AppHeaderNotifications>
        <AppHeaderNotificationItem text="One" unread />
      </AppHeaderNotifications>,
    );
    const bell = screen.getByRole("button", { name: "Notifications" });
    expect(bell).toHaveAttribute("aria-description", "1 unread");
  });

  it("renders no badge when nothing is unread", () => {
    const { container } = render(
      <AppHeaderNotifications>
        <AppHeaderNotificationItem text="Read" />
      </AppHeaderNotifications>,
    );
    expect(badgeOf(container)).toBeNull();
  });

  it("prefers an explicit count and caps the display at 99+", () => {
    const { container } = render(<AppHeaderNotifications count={150} />);
    expect(badgeOf(container)).toHaveTextContent("99+");
  });

  it("hides the badge while loading or when showBadge is false", () => {
    const { container, rerender } = render(<AppHeaderNotifications count={3} loading />);
    expect(badgeOf(container)).toBeNull();
    rerender(<AppHeaderNotifications count={3} showBadge={false} />);
    expect(badgeOf(container)).toBeNull();
  });

  it("takes a title, width and alignment for the panel", async () => {
    const user = userEvent.setup();
    render(
      <AppHeaderNotifications title="Alerts" width={420} align="start">
        <AppHeaderNotificationItem text="One" unread />
      </AppHeaderNotifications>,
    );
    await user.click(screen.getByRole("button", { name: "Notifications" }));

    const panel = document.querySelector(".clet-notif-popover") as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.querySelector(".clet-notif-popover__title")).toHaveTextContent("Alerts");
    expect(panel.style.getPropertyValue("--clet-notif-popover-width")).toBe("420px");
    expect(panel).toHaveAttribute("data-align", "start");
  });
});
