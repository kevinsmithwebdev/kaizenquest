import { Flame } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  MAX_ACTIVITY_EVENTS,
  getCappedActivityLevel,
  type UserStreak,
} from "@/lib/streak";

type StreakCardProps = {
  streak: UserStreak;
};

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <h2 className="font-heading text-sm leading-snug font-semibold">
          Your Streak
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div className="shrink-0">
            <div className="flex items-end gap-2">
              <Flame className="text-brand mb-1 size-7 shrink-0" aria-hidden />
              <div className="flex items-end gap-1">
                <span className="text-foreground text-4xl leading-none font-bold tracking-tight">
                  {streak.currentStreak}
                </span>
                <span className="text-muted-foreground mb-1 text-sm">
                  {streak.currentStreak === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Best: {streak.bestStreak}{" "}
              {streak.bestStreak === 1 ? "day" : "days"}
            </p>
          </div>

          <div
            className="flex min-w-0 flex-1 items-end justify-between gap-1"
            aria-label="Weekly activity"
          >
            {streak.weeklyActivity.map((day) => {
              const cappedCount = getCappedActivityLevel(day.eventCount);
              const heightPercent =
                cappedCount > 0 ? (cappedCount / MAX_ACTIVITY_EVENTS) * 100 : 0;

              return (
                <div
                  key={day.date.toISOString()}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div className="flex h-16 w-full items-end justify-center">
                    {heightPercent > 0 ? (
                      <div
                        className="from-brand to-energy w-full max-w-3 rounded-full bg-linear-to-t"
                        style={{ height: `${heightPercent}%` }}
                        title={`${day.eventCount} event${day.eventCount === 1 ? "" : "s"} logged`}
                      />
                    ) : null}
                  </div>
                  <span className="text-muted-foreground text-[10px] font-medium uppercase">
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
