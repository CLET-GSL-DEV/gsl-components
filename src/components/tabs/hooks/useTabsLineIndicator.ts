import {
  useCallback,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

interface TabsLineIndicatorState {
  style: CSSProperties;
  visible: boolean;
}

const hiddenStyle: CSSProperties = {
  ["--gsl-tabs-indicator-offset" as string]: "0px",
  ["--gsl-tabs-indicator-size" as string]: "0px",
  ["--gsl-tabs-indicator-cross-offset" as string]: "0px",
  ["--gsl-tabs-indicator-cross-size" as string]: "0px",
};

export function useTabsLineIndicator(
  listRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): TabsLineIndicatorState {
  const [state, setState] = useState<TabsLineIndicatorState>({
    style: hiddenStyle,
    visible: false,
  });

  const updateIndicator = useCallback(() => {
    const list = listRef.current;

    if (!enabled || !list) {
      setState({ style: hiddenStyle, visible: false });
      return;
    }

    const activeTrigger = list.querySelector<HTMLElement>(
      '.gsl-tabs__trigger[data-state="active"]',
    );

    if (!activeTrigger) {
      setState({ style: hiddenStyle, visible: false });
      return;
    }

    const orientation =
      list.getAttribute("data-orientation") === "vertical"
        ? "vertical"
        : "horizontal";
    const listRect = list.getBoundingClientRect();
    const triggerRect = activeTrigger.getBoundingClientRect();

    if (orientation === "vertical") {
      setState({
        visible: true,
        style: {
          ["--gsl-tabs-indicator-offset" as string]: `${triggerRect.top - listRect.top}px`,
          ["--gsl-tabs-indicator-size" as string]: `${triggerRect.height}px`,
          ["--gsl-tabs-indicator-cross-offset" as string]: `${triggerRect.left - listRect.left}px`,
          ["--gsl-tabs-indicator-cross-size" as string]: `${triggerRect.width}px`,
        },
      });
      return;
    }

    setState({
      visible: true,
      style: {
        ["--gsl-tabs-indicator-offset" as string]: `${triggerRect.left - listRect.left}px`,
        ["--gsl-tabs-indicator-size" as string]: `${triggerRect.width}px`,
        ["--gsl-tabs-indicator-cross-offset" as string]: `${triggerRect.top - listRect.top}px`,
        ["--gsl-tabs-indicator-cross-size" as string]: `${triggerRect.height}px`,
      },
    });
  }, [enabled, listRef]);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    updateIndicator();

    const list = listRef.current;
    if (!list) {
      return;
    }

    let disconnectResizeObserver: (() => void) | undefined;

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateIndicator);
      resizeObserver.observe(list);

      for (const trigger of list.querySelectorAll(".gsl-tabs__trigger")) {
        resizeObserver.observe(trigger);
      }

      disconnectResizeObserver = () => resizeObserver.disconnect();
    }

    const mutationObserver = new MutationObserver(updateIndicator);
    mutationObserver.observe(list, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
      childList: true,
    });

    window.addEventListener("resize", updateIndicator);

    return () => {
      disconnectResizeObserver?.();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [enabled, listRef, updateIndicator]);

  return state;
}
