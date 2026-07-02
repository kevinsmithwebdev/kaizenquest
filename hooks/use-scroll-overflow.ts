"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ScrollOverflowState = {
  canScrollUp: boolean;
  canScrollDown: boolean;
};

export function useScrollOverflow<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [overflow, setOverflow] = useState<ScrollOverflowState>({
    canScrollUp: false,
    canScrollDown: false,
  });

  const update = useCallback(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = element;
    const threshold = 1;

    setOverflow({
      canScrollUp: scrollTop > threshold,
      canScrollDown: scrollTop + clientHeight < scrollHeight - threshold,
    });
  }, []);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    update();

    element.addEventListener("scroll", update, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(element, { childList: true, subtree: true });

    return () => {
      element.removeEventListener("scroll", update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [update]);

  return { ref, update, ...overflow };
}
