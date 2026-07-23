"use client";

import type { ComponentPropsWithoutRef } from "react";

import { useScrollOverflow } from "@/hooks/use-scroll-overflow";
import { cn } from "@/lib/utils";

type ScrollFadeProps = Readonly<ComponentPropsWithoutRef<"div">>;

export function ScrollFade({ children, className, ...props }: ScrollFadeProps) {
  const { ref, canScrollUp, canScrollDown } = useScrollOverflow();

  return (
    <div className={cn("relative", className)} {...props}>
      {canScrollUp ? (
        <div
          aria-hidden
          className="from-card pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b to-transparent shadow-[inset_0_6px_6px_-6px_rgba(0,0,0,0.08)]"
        />
      ) : null}
      {canScrollDown ? (
        <div
          aria-hidden
          className="from-card pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-t to-transparent shadow-[inset_0_-6px_6px_-6px_rgba(0,0,0,0.08)]"
        />
      ) : null}
      <div ref={ref} className="overflow-y-auto overscroll-contain lg:h-full">
        {children}
      </div>
    </div>
  );
}
