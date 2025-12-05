import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 hover:scale-105",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 hover:scale-105",
        outline: "text-foreground hover:scale-105",
      },
      tone: {
        neutral:
          "border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100",
        success:
          "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500",
        warning:
          "border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400",
        danger:
          "border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500",
        info:
          "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500",
      },
      size: {
        sm: "px-1.5 py-0 text-[11px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        tone: "neutral",
        class: "border-slate-400 text-slate-900 dark:border-slate-500 dark:text-slate-100",
      },
    ],
    defaultVariants: {
      variant: "default",
      tone: undefined,
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, tone, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, tone, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
