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
  type CalendarDay,
  type MonthRef,
} from "@/lib/calendar";
import type { Goal } from "@/lib/goals/goal.types";
import { cn } from "@/lib/utils";

type CalendarCardProps = {
  goals: Goal[];
};

const getDayTitle = (
  day: CalendarDay,
  dayNumber: number,
): string | undefined => {
  if (day.isFuture) {
    return undefined;
  }

  if (day.eventCount > 0) {
    const eventLabel = day.eventCount === 1 ? "event" : "events";
    return `${dayNumber}: ${day.eventCount} ${eventLabel}`;
  }

  return `${dayNumber}: no events`;
};

const getDayNumberClassName = (day: CalendarDay): string => {
  if (day.isToday) {
    return "flex size-7 items-center justify-center rounded-full text-xs font-medium bg-action text-action-foreground";
  }

  if (day.isCurrentMonth) {
    return "flex size-7 items-center justify-center rounded-full text-xs font-medium text-foreground";
  }

  return "flex size-7 items-center justify-center rounded-full text-xs font-medium text-muted-foreground";
};

export function CalendarCard({ goals }: Readonly<CalendarCardProps>) {
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
                title={getDayTitle(day, dayNumber)}
              >
                <span className={cn(getDayNumberClassName(day))}>
                  {dayNumber}
                </span>
                {day.isFuture ? null : (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      hasEvents ? "bg-success" : "bg-foreground",
                    )}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
