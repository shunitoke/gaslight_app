import * as React from "react"

import { cn } from "@/lib/utils"

const CardBase = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-primary/10 bg-white/70 dark:bg-neutral-900/70 dark:border-primary/20 shadow-lg backdrop-blur-lg",
        className
      )}
      {...props}
    />
  )
)
CardBase.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight text-text", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-text/80", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 sm:p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

type LegacyCardProps = {
  title?: string
  children: React.ReactNode
  className?: string
}

const Card = ({ title, children, className }: LegacyCardProps) => (
  <CardBase className={cn("p-4 sm:p-6", className)}>
    {title && <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>}
    <CardContent className="p-0">{children}</CardContent>
  </CardBase>
)

export { CardBase, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, Card }
