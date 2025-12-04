"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => {
  // Extract indicatorClassName to prevent it from being passed to DOM
  // The destructuring above already removes it from props, but we'll be explicit
  
  // Create a clean props object without indicatorClassName
  const rootProps = { ...props };
  // Explicitly remove indicatorClassName if it somehow got through
  if ('indicatorClassName' in rootProps) {
    delete (rootProps as any).indicatorClassName;
  }
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 shadow-inner",
        className
      )}
      value={value}
      {...rootProps}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out relative overflow-hidden",
          indicatorClassName || "bg-gradient-to-r from-primary via-primary/90 to-primary"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
