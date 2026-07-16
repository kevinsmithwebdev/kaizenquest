export const startOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const endOfDay = (date: Date): Date => addDays(startOfDay(date), 1);

export const getMondayWeekOffset = (date: Date): number =>
  (date.getDay() + 6) % 7;

export const getWeekStartMonday = (date: Date): Date => {
  const start = startOfDay(date);
  start.setDate(start.getDate() - getMondayWeekOffset(start));
  return start;
};
