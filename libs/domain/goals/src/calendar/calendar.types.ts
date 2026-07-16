export type MonthRef = {
  year: number;
  month: number;
};

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  eventCount: number;
};
