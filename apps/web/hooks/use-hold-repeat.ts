"use client";

import { useCallback, useEffect, useRef } from "react";

const INITIAL_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 80;

type UseHoldRepeatOptions = {
  enabled?: boolean;
};

export const useHoldRepeat = (
  action: () => void,
  { enabled = true }: UseHoldRepeatOptions = {},
) => {
  const actionRef = useRef(action);
  const enabledRef = useRef(enabled);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const stop = useCallback(() => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!enabledRef.current) {
      return;
    }

    actionRef.current();
    stop();

    delayRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (!enabledRef.current) {
          stop();
          return;
        }

        actionRef.current();
      }, REPEAT_INTERVAL_MS);
    }, INITIAL_DELAY_MS);
  }, [stop]);

  useEffect(() => stop, [stop]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!enabledRef.current || event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      start();
    },
    [start],
  );

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  };
};
