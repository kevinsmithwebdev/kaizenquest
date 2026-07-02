export type DayActivity = {
  date: Date;
  dayLabel: string;
  eventCount: number;
};

export type UserStreak = {
  currentStreak: number;
  bestStreak: number;
  weeklyActivity: DayActivity[];
};
