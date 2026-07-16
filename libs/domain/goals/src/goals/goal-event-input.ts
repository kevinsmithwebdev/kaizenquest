export const OCCURRENCE_MIN = 1;
export const OCCURRENCE_MAX = 1000;
export const HOURS_MIN = 0;
export const HOURS_MAX = 100;
export const MINUTES_MIN = 0;
export const MINUTES_MAX = 1000;
export const AMOUNT_MIN = 0;
export const AMOUNT_MAX = 1000;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const clampOccurrences = (value: number): number => {
  if (!Number.isFinite(value)) {
    return OCCURRENCE_MIN;
  }

  return clamp(Math.round(value), OCCURRENCE_MIN, OCCURRENCE_MAX);
};

export const clampHours = (value: number): number => {
  if (!Number.isFinite(value)) {
    return HOURS_MIN;
  }

  return clamp(Math.round(value), HOURS_MIN, HOURS_MAX);
};

export const clampMinutes = (value: number): number => {
  if (!Number.isFinite(value)) {
    return MINUTES_MIN;
  }

  return clamp(Math.round(value), MINUTES_MIN, MINUTES_MAX);
};

export const clampAmount = (value: number): number => {
  if (!Number.isFinite(value)) {
    return AMOUNT_MIN;
  }

  return clamp(value, AMOUNT_MIN, AMOUNT_MAX);
};

export const roundAmountToThirdDecimal = (value: number): number => {
  return Math.round(clampAmount(value) * 1000) / 1000;
};

export const getTotalMinutes = (hours: number, minutes: number): number => {
  return clampHours(hours) * 60 + clampMinutes(minutes);
};

export const getAdjustedTimeParts = (
  hours: number,
  minutes: number,
): { hours: number; minutes: number } => {
  const totalMinutes = getTotalMinutes(hours, minutes);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};

const formatUnit = (
  count: number,
  singular: string,
  plural: string,
): string => {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
};

export const formatAdjustedTimeDisplay = (
  hours: number,
  minutes: number,
): string => {
  const adjusted = getAdjustedTimeParts(hours, minutes);

  if (adjusted.hours === 0 && adjusted.minutes === 0) {
    return "0 min";
  }

  if (adjusted.hours === 0) {
    return formatUnit(adjusted.minutes, "min", "min");
  }

  if (adjusted.minutes === 0) {
    return formatUnit(adjusted.hours, "hr", "hr");
  }

  return `${formatUnit(adjusted.hours, "hr", "hr")} ${formatUnit(adjusted.minutes, "min", "min")}`;
};

export const minutesToIso8601Duration = (
  hours: number,
  minutes: number,
): string => {
  const adjusted = getAdjustedTimeParts(hours, minutes);

  if (adjusted.hours === 0 && adjusted.minutes === 0) {
    return "PT0M";
  }

  if (adjusted.hours === 0) {
    return `PT${adjusted.minutes}M`;
  }

  if (adjusted.minutes === 0) {
    return `PT${adjusted.hours}H`;
  }

  return `PT${adjusted.hours}H${adjusted.minutes}M`;
};

export const isPositiveOccurrenceValue = (value: number): boolean => {
  return (
    Number.isFinite(value) && value >= OCCURRENCE_MIN && value <= OCCURRENCE_MAX
  );
};

export const isPositiveTimeValue = (
  hours: number,
  minutes: number,
): boolean => {
  return getTotalMinutes(hours, minutes) > 0;
};

export const isPositiveAmountValue = (value: number): boolean => {
  return Number.isFinite(value) && value > AMOUNT_MIN && value <= AMOUNT_MAX;
};

export const sanitizeAmountInput = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...fraction] = cleaned.split(".");
  return fraction.length > 0 ? `${whole}.${fraction.join("")}` : whole;
};
