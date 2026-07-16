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
  ["--clet-tabs-indicator-offset" as string]: "0px",
  ["--clet-tabs-indicator-size" as string]: "0px",
  ["--clet-tabs-indicator-cross-offset" as string]: "0px",
  ["--clet-tabs-indicator-cross-size" as string]: "0px",
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
      '.clet-tabs__trigger[data-state="active"]',
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
          ["--clet-tabs-indicator-offset" as string]: `${triggerRect.top - listRect.top}px`,
          ["--clet-tabs-indicator-size" as string]: `${triggerRect.height}px`,
          ["--clet-tabs-indicator-cross-offset" as string]: `${triggerRect.left - listRect.left}px`,
          ["--clet-tabs-indicator-cross-size" as string]: `${triggerRect.width}px`,
        },
      });
      return;
    }

    setState({
      visible: true,
      style: {
        ["--clet-tabs-indicator-offset" as string]: `${triggerRect.left - listRect.left}px`,
        ["--clet-tabs-indicator-size" as string]: `${triggerRect.width}px`,
        ["--clet-tabs-indicator-cross-offset" as string]: `${triggerRect.top - listRect.top}px`,
        ["--clet-tabs-indicator-cross-size" as string]: `${triggerRect.height}px`,
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

      for (const trigger of list.querySelectorAll(".clet-tabs__trigger")) {
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
