import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
  {
    variants: {
      variant: {
        accent: "bg-accent text-white",
        neutral: "bg-ink-800 text-ink-300",
        glass: "bg-black/60 text-white backdrop-blur-sm",
        gold: "bg-gold/15 text-gold",
        outline: "border border-ink-600 text-ink-300",
        success: "bg-whatsapp/15 text-whatsapp",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
