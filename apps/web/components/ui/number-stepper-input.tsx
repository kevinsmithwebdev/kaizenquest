"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHoldRepeat } from "@/hooks/use-hold-repeat";
import { cn } from "@/lib/utils";

type NumberStepperInputProps = {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  allowDecimal?: boolean;
  onBlurClamp?: (value: number) => number;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
};

const sanitizeNumericInput = (value: string, allowDecimal: boolean): string => {
  if (allowDecimal) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const [whole = "", ...fraction] = cleaned.split(".");
    return fraction.length > 0 ? `${whole}.${fraction.join("")}` : whole;
  }

  return value.replace(/\D/g, "");
};

const parseNumericValue = (value: string): number => {
  if (value === "" || value === ".") {
    return Number.NaN;
  }

  return Number(value);
};

export function NumberStepperInput({
  value,
  onChange,
  min,
  max,
  allowDecimal = false,
  onBlurClamp,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: Readonly<NumberStepperInputProps>) {
  const numericValue = parseNumericValue(value);
  const hasNumericValue = Number.isFinite(numericValue);
  const effectiveValue = hasNumericValue ? numericValue : min;
  const canDecrement = hasNumericValue ? effectiveValue > min : false;
  const canIncrement = hasNumericValue ? effectiveValue < max : true;
  const step = allowDecimal ? 0.1 : 1;

  const applyClampedValue = React.useCallback(
    (nextValue: number) => {
      const clamped = onBlurClamp ? onBlurClamp(nextValue) : nextValue;
      const bounded = Math.min(max, Math.max(min, clamped));
      onChange(String(bounded));
    },
    [max, min, onBlurClamp, onChange],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(sanitizeNumericInput(event.target.value, allowDecimal));
  };

  const handleBlur = () => {
    if (!hasNumericValue) {
      onChange(String(min));
      return;
    }

    applyClampedValue(numericValue);
  };

  const handleDecrement = React.useCallback(() => {
    if (!canDecrement) {
      return;
    }

    const baseValue = hasNumericValue ? numericValue : min;
    applyClampedValue(baseValue - step);
  }, [
    applyClampedValue,
    canDecrement,
    hasNumericValue,
    min,
    numericValue,
    step,
  ]);

  const handleIncrement = React.useCallback(() => {
    if (!canIncrement) {
      return;
    }

    const baseValue = hasNumericValue ? numericValue : min;
    applyClampedValue(baseValue + step);
  }, [
    applyClampedValue,
    canIncrement,
    hasNumericValue,
    min,
    numericValue,
    step,
  ]);

  const decrementRepeat = useHoldRepeat(handleDecrement, {
    enabled: canDecrement,
  });
  const incrementRepeat = useHoldRepeat(handleIncrement, {
    enabled: canIncrement,
  });

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={!canDecrement}
        aria-label={`Decrease ${ariaLabel ?? "value"}`}
        {...decrementRepeat}
      >
        <ChevronDown />
      </Button>

      <Input
        id={id}
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        className="text-center tabular-nums"
      />

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={!canIncrement}
        aria-label={`Increase ${ariaLabel ?? "value"}`}
        {...incrementRepeat}
      >
        <ChevronUp />
      </Button>
    </div>
  );
}
