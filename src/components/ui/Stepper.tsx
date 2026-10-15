"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function Stepper({ value, onChange, min = 1, max = 20, label = "Quantity", className }: StepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex h-11 items-center rounded-full border border-ink-700 bg-ink-900", className)}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-300 transition-colors hover:text-white disabled:opacity-30"
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-300 transition-colors hover:text-white disabled:opacity-30"
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
