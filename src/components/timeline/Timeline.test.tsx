import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
  Timeline,
  TimelineData,
  TimelineFooter,
  TimelineItem,
  TimelineTitle,
} from "./Timeline";

function renderTimeline({
  classNames,
  className,
}: {
  classNames?: { root?: string };
  className?: string;
} = {}) {
  return render(
    <Timeline classNames={classNames} className={className}>
      <TimelineItem data-testid="item-0">
        <p>First event</p>
      </TimelineItem>
      <TimelineItem status="current" data-testid="item-1">
        <p>Second event</p>
      </TimelineItem>
    </Timeline>,
  );
}

describe("Timeline", () => {
  it("renders an ordered list", () => {
    renderTimeline();

    const list = screen.getByRole("list");
    expect(list).toHaveClass("gsl-timeline");
  });

  it("renders all items as listitems", () => {
    renderTimeline();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("injects isLast on the last item", () => {
    renderTimeline();

    const items = screen.getAllByRole("listitem");
    const lastConnector = items[1].querySelector(".gsl-timeline__connector");
    expect(lastConnector).toBeNull();

    const firstConnector = items[0].querySelector(".gsl-timeline__connector");
    expect(firstConnector).toBeInTheDocument();
  });

  it("merges className and classNames on the root", () => {
    renderTimeline({
      classNames: { root: "custom-root" },
      className: "extra-root",
    });

    const list = screen.getByRole("list");
    expect(list).toHaveClass("gsl-timeline", "custom-root", "extra-root");
  });

  it("filters out non-TimelineItem children", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="valid">
          <p>Valid</p>
        </TimelineItem>
        <div data-testid="invalid">Not an item</div>
      </Timeline>,
    );

    expect(screen.getByTestId("valid")).toBeInTheDocument();
    expect(screen.queryByTestId("invalid")).not.toBeInTheDocument();
  });

  it("exposes forwardRef on Timeline", () => {
    const ref = createRef<HTMLOListElement>();

    render(
      <Timeline ref={ref}>
        <TimelineItem>
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    expect(ref.current).toBeInstanceOf(HTMLOListElement);
  });

  it("exposes forwardRef on TimelineItem", () => {
    const ref = createRef<HTMLLIElement>();

    render(
      <Timeline>
        <TimelineItem ref={ref}>
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    expect(ref.current).toBeInstanceOf(HTMLLIElement);
  });
});

describe("TimelineItem", () => {
  it("renders a neutral dot by default", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    const dot = screen
      .getByTestId("item")
      .querySelector(".gsl-timeline__dot");
    expect(dot).toBeInTheDocument();
    expect(dot).not.toHaveClass("gsl-timeline__dot--complete");
  });

  it("renders status variants on the dot", () => {
    const statuses = [
      "complete",
      "current",
      "warning",
      "error",
    ] as const;

    for (const status of statuses) {
      const { unmount } = render(
        <Timeline>
          <TimelineItem status={status} data-testid={`item-${status}`}>
            <p>{status}</p>
          </TimelineItem>
        </Timeline>,
      );

      const dot = screen
        .getByTestId(`item-${status}`)
        .querySelector(".gsl-timeline__dot");

      expect(dot).toHaveClass(`gsl-timeline__dot--${status}`);
      unmount();
    }
  });

  it("applies color prop as inline style on the dot", () => {
    render(
      <Timeline>
        <TimelineItem color="#ff6b6b" data-testid="item">
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    const dot = screen
      .getByTestId("item")
      .querySelector(".gsl-timeline__dot");
    expect(dot).toHaveStyle({
      backgroundColor: "#ff6b6b",
      borderColor: "#ff6b6b",
    });
  });

  it("color prop does not affect a status class", () => {
    render(
      <Timeline>
        <TimelineItem status="complete" color="#ff6b6b" data-testid="item">
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    const dot = screen
      .getByTestId("item")
      .querySelector(".gsl-timeline__dot");
    expect(dot).toHaveClass("gsl-timeline__dot--complete");
    expect(dot).toHaveStyle({
      backgroundColor: "#ff6b6b",
      borderColor: "#ff6b6b",
    });
  });

  it("renders an icon inside the dot", () => {
    render(
      <Timeline>
        <TimelineItem
          icon={<span data-testid="custom-icon">*</span>}
          data-testid="item"
        >
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    const dot = screen
      .getByTestId("item")
      .querySelector(".gsl-timeline__dot");
    expect(dot).toContainElement(screen.getByTestId("custom-icon"));
  });

  it("renders children in the content area", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <h3 data-testid="title">Case reported</h3>
          <p data-testid="date">12 Jun 2026</p>
        </TimelineItem>
      </Timeline>,
    );

    const content = screen
      .getByTestId("item")
      .querySelector(".gsl-timeline__content");
    expect(content).toContainElement(screen.getByTestId("title"));
    expect(content).toContainElement(screen.getByTestId("date"));
  });

  it("does not render content when children is empty", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item" />
      </Timeline>,
    );

    const item = screen.getByTestId("item");
    expect(item.querySelector(".gsl-timeline__content")).toBeNull();
  });

  it("merges classNames on sub-parts", () => {
    render(
      <Timeline>
        <TimelineItem
          data-testid="item"
          classNames={{
            root: "item-root",
            rail: "item-rail",
            dot: "item-dot",
            connector: "item-connector",
            content: "item-content",
          }}
        >
          <p>Event</p>
        </TimelineItem>
        <TimelineItem>
          <p>Second</p>
        </TimelineItem>
      </Timeline>,
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveClass("item-root");
    expect(item.querySelector(".gsl-timeline__rail")).toHaveClass("item-rail");
    expect(item.querySelector(".gsl-timeline__dot")).toHaveClass("item-dot");
    expect(item.querySelector(".gsl-timeline__connector")).toHaveClass(
      "item-connector",
    );
    expect(item.querySelector(".gsl-timeline__content")).toHaveClass(
      "item-content",
    );
  });

  it("does not render connector on the last item", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="first">
          <p>First</p>
        </TimelineItem>
        <TimelineItem data-testid="last">
          <p>Last</p>
        </TimelineItem>
      </Timeline>,
    );

    expect(
      screen.getByTestId("first").querySelector(".gsl-timeline__connector"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("last").querySelector(".gsl-timeline__connector"),
    ).toBeNull();
  });

  it("merges className on the item root", () => {
    render(
      <Timeline>
        <TimelineItem className="custom-item" data-testid="item">
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByTestId("item")).toHaveClass("custom-item");
  });

  it("marks the dot as aria-hidden", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <p>Event</p>
        </TimelineItem>
      </Timeline>,
    );

    const dot = screen
      .getByTestId("item")
      .querySelector(".gsl-timeline__dot");
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });
});

describe("TimelineTitle", () => {
  it("renders as h3 by default", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <TimelineTitle data-testid="title">Test</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    const title = screen.getByTestId("title");
    expect(title.tagName).toBe("H3");
    expect(title).toHaveClass("gsl-timeline__title");
  });

  it("renders as the specified heading level", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <TimelineTitle as="h1" data-testid="title">
            Test
          </TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByTestId("title").tagName).toBe("H1");
  });

  it("merges classNames and className", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <TimelineTitle
            classNames={{ title: "custom-title" }}
            className="extra-title"
            data-testid="title"
          >
            Test
          </TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    const title = screen.getByTestId("title");
    expect(title).toHaveClass("gsl-timeline__title", "custom-title", "extra-title");
  });

  it("exposes forwardRef", () => {
    const ref = createRef<HTMLHeadingElement>();

    render(
      <Timeline>
        <TimelineItem>
          <TimelineTitle ref={ref}>Test</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );

    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe("TimelineData", () => {
  it("renders a paragraph with the data class", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <TimelineData data-testid="data">12 Jun 2026</TimelineData>
        </TimelineItem>
      </Timeline>,
    );

    const el = screen.getByTestId("data");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("gsl-timeline__data");
  });

  it("merges classNames and className", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <TimelineData
            classNames={{ data: "custom-data" }}
            className="extra-data"
            data-testid="data"
          >
            Test
          </TimelineData>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByTestId("data")).toHaveClass(
      "gsl-timeline__data",
      "custom-data",
      "extra-data",
    );
  });

  it("exposes forwardRef", () => {
    const ref = createRef<HTMLParagraphElement>();

    render(
      <Timeline>
        <TimelineItem>
          <TimelineData ref={ref}>Test</TimelineData>
        </TimelineItem>
      </Timeline>,
    );

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe("TimelineFooter", () => {
  it("renders a div with the footer class", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <TimelineFooter data-testid="footer">Footer content</TimelineFooter>
        </TimelineItem>
      </Timeline>,
    );

    const el = screen.getByTestId("footer");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gsl-timeline__footer");
  });

  it("merges classNames and className", () => {
    render(
      <Timeline>
        <TimelineItem data-testid="item">
          <TimelineFooter
            classNames={{ footer: "custom-footer" }}
            className="extra-footer"
            data-testid="footer"
          >
            Test
          </TimelineFooter>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByTestId("footer")).toHaveClass(
      "gsl-timeline__footer",
      "custom-footer",
      "extra-footer",
    );
  });

  it("exposes forwardRef", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Timeline>
        <TimelineItem>
          <TimelineFooter ref={ref}>Test</TimelineFooter>
        </TimelineItem>
      </Timeline>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
