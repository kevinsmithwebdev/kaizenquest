import type { PeriodProgressSegment } from "@/lib/goals/period-progress";
import { cn } from "@/lib/utils";

type SegmentedProgressBarProps = {
  segments: PeriodProgressSegment[];
  percent?: number;
  className?: string;
};

export function SegmentedProgressBar({
  segments,
  percent,
  className,
}: SegmentedProgressBarProps) {
  return (
    <div
      className={cn(
        "bg-muted flex h-2.5 w-full overflow-hidden rounded-full",
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      {segments.map((segment) => {
        const filledWidth = (segment.widthPercent * segment.fillPercent) / 100;

        if (filledWidth <= 0) {
          return null;
        }

        return (
          <div
            key={segment.categoryKey}
            className="h-full shrink-0"
            style={{
              width: `${filledWidth}%`,
              backgroundColor: segment.color,
            }}
          />
        );
      })}
    </div>
  );
}
