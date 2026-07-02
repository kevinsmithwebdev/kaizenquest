"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  CALENDAR_WEEKDAY_LABELS,
  addMonths,
  buildCalendarMonth,
  formatCalendarMonthLabel,
  getMonthRef,
  type MonthRef,
} from "@/lib/calendar";
import type { Goal } from "@/lib/goals/goal.types";
import { cn } from "@/lib/utils";

type CalendarCardProps = {
  goals: Goal[];
};

export function CalendarCard({ goals }: CalendarCardProps) {
  const [visibleMonth, setVisibleMonth] = useState<MonthRef>(() =>
    getMonthRef(),
  );

  const days = useMemo(
    () => buildCalendarMonth(visibleMonth, goals),
    [visibleMonth, goals],
  );

  const monthLabel = formatCalendarMonthLabel(visibleMonth);

  return (
    <Card>
      <CardHeader className="pb-0">
        <h2 className="font-heading text-sm leading-snug font-semibold">
          {monthLabel}
        </h2>
        <CardAction className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Previous month"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Next month"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          >
            <ChevronRight aria-hidden />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div
          className="grid grid-cols-7 gap-y-2"
          role="grid"
          aria-label={monthLabel}
        >
          {CALENDAR_WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              role="columnheader"
              className="text-muted-foreground text-center text-[10px] font-medium uppercase"
            >
              {label}
            </div>
          ))}

          {days.map((day) => {
            const dayNumber = day.date.getDate();
            const hasEvents = day.eventCount > 0;

            return (
              <div
                key={day.date.toISOString()}
                role="gridcell"
                className="flex flex-col items-center gap-1"
                aria-current={day.isToday ? "date" : undefined}
                title={
                  day.isFuture
                    ? undefined
                    : hasEvents
                      ? `${dayNumber}: ${day.eventCount} event${day.eventCount === 1 ? "" : "s"}`
                      : `${dayNumber}: no events`
                }
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                    day.isToday && "bg-action text-action-foreground",
                    !day.isToday && day.isCurrentMonth && "text-foreground",
                    !day.isToday &&
                      !day.isCurrentMonth &&
                      "text-muted-foreground",
                  )}
                >
                  {dayNumber}
                </span>
                {!day.isFuture ? (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      hasEvents ? "bg-success" : "bg-foreground",
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
