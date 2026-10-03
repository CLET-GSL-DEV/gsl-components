import { render, screen } from "@testing-library/react";
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
});
