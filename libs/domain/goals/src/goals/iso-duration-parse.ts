type Iso8601DurationParts = {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const UNIT_PATTERN = /^(\d+(?:\.\d+)?)(Y|M|W|D|H|S)/;

const DATE_UNITS = new Set(["Y", "M", "W", "D"]);
const TIME_UNITS = new Set(["H", "M", "S"]);

const parseSection = (
  section: string,
  allowedUnits: ReadonlySet<string>,
): Record<string, number> | null => {
  if (!section) {
    return {};
  }

  const parts: Record<string, number> = {};
  let remaining = section;

  while (remaining.length > 0) {
    const match = UNIT_PATTERN.exec(remaining);
    if (!match || !allowedUnits.has(match[2]!)) {
      return null;
    }

    parts[match[2]!] = Number(match[1]);
    remaining = remaining.slice(match[0].length);
  }

  return parts;
};

export const parseIso8601DurationParts = (
  value: string,
): Iso8601DurationParts | null => {
  if (!value.startsWith("P")) {
    return null;
  }

  const withoutP = value.slice(1);
  const timeDelimiter = withoutP.indexOf("T");
  const dateSection =
    timeDelimiter === -1 ? withoutP : withoutP.slice(0, timeDelimiter);
  const timeSection =
    timeDelimiter === -1 ? "" : withoutP.slice(timeDelimiter + 1);

  const dateParts = parseSection(dateSection, DATE_UNITS);
  if (!dateParts) {
    return null;
  }

  const timeParts = parseSection(timeSection, TIME_UNITS);
  if (!timeParts) {
    return null;
  }

  if (
    Object.keys(dateParts).length === 0 &&
    Object.keys(timeParts).length === 0
  ) {
    return null;
  }

  return {
    years: dateParts.Y ?? 0,
    months: dateParts.M ?? 0,
    weeks: dateParts.W ?? 0,
    days: dateParts.D ?? 0,
    hours: timeParts.H ?? 0,
    minutes: timeParts.M ?? 0,
    seconds: timeParts.S ?? 0,
  };
};

export const isIso8601Duration = (value: string): boolean => {
  return parseIso8601DurationParts(value) !== null;
};

export const parseIso8601DurationToMinutes = (value: string): number => {
  const parts = parseIso8601DurationParts(value);
  if (!parts) {
    return 0;
  }

  return (
    parts.weeks * 7 * 24 * 60 +
    parts.days * 24 * 60 +
    parts.hours * 60 +
    parts.minutes +
    Math.round(parts.seconds / 60)
  );
};
