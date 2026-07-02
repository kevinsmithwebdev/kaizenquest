import { cn } from "@/lib/utils";

type GoalProgressRingProps = {
  value: number;
  label: string;
  percent: number;
  color: string;
  className?: string;
};

const SIZE = 52;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function GoalProgressRing({
  value,
  label,
  percent,
  color,
  className,
}: GoalProgressRingProps) {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative size-[52px] shrink-0">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="text-foreground absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {value}
        </span>
      </div>
      <span className="text-muted-foreground text-sm">{label}</span>
    </div>
  );
}
