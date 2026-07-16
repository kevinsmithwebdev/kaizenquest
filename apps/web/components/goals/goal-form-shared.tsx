import { cn } from "@/lib/utils";

export const goalFormFieldClassName = cn(
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 aria-invalid:ring-3 md:text-sm",
);

export const shouldShowGoalFieldError = (
  field: string,
  touchedFields: ReadonlySet<string>,
  hasAttemptedSubmit: boolean,
): boolean => {
  return touchedFields.has(field) || hasAttemptedSubmit;
};

export function GoalFormFieldError({
  message,
}: Readonly<{
  message: string | undefined;
}>) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}
