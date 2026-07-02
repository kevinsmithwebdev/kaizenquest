import type { Goal } from "@/lib/goals/goal.types";
import { getEventCountOnDate } from "@/lib/streak/streak";

import type { CalendarDay, MonthRef } from "./calendar.types";

export const CALENDAR_WEEKDAY_LABELS = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
] as const;

const startOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getMondayWeekOffset = (date: Date): number => (date.getDay() + 6) % 7;

export const getMonthRef = (date = new Date()): MonthRef => ({
  year: date.getFullYear(),
  month: date.getMonth(),
});

export const addMonths = (
  { year, month }: MonthRef,
  offset: number,
): MonthRef => {
  const date = new Date(year, month + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
};

export const formatCalendarMonthLabel = (
  { year, month }: MonthRef,
  locale = "en-US",
): string =>
  new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

const getMonthBounds = ({ year, month }: MonthRef) => {
  const monthStart = startOfDay(new Date(year, month, 1));
  const monthEnd = startOfDay(new Date(year, month + 1, 0));
  return { monthStart, monthEnd };
};

export const buildCalendarMonth = (
  monthRef: MonthRef,
  goals: Goal[],
  now = new Date(),
): CalendarDay[] => {
  const { monthStart, monthEnd } = getMonthBounds(monthRef);
  const today = startOfDay(now);
  const gridStart = addDays(monthStart, -getMondayWeekOffset(monthStart));
  const gridEnd = addDays(monthEnd, 6 - getMondayWeekOffset(monthEnd));
  const days: CalendarDay[] = [];

  for (let date = gridStart; date <= gridEnd; date = addDays(date, 1)) {
    const isFuture = date > today;

    days.push({
      date: new Date(date),
      isCurrentMonth: date >= monthStart && date <= monthEnd,
      isToday: date.getTime() === today.getTime(),
      isFuture,
      eventCount: isFuture ? 0 : getEventCountOnDate(goals, date),
    });
  }

  return days;
};
