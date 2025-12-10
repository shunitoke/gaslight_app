"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const CardBase = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => {
    // Check if this is upload card - use slightly softer blur for readability
    const isUploadCard = (props as any)['data-upload-card'] !== undefined;
    const defaultOpacity = 0.85;
    
    // Use CSS media queries for mobile detection instead of JS to prevent hydration mismatch
    // Always use desktop defaults - mobile styles handled via CSS
    const blurAmount = isUploadCard ? 'blur(4px)' : 'blur(16px)';
    const saturation = isUploadCard ? 'saturate(100%)' : 'saturate(180%)';
    
    // Merge styles - all cards use same opacity now
    // Preserve custom backgroundColor from style if provided, otherwise use default
    // Use consistent transform format to prevent hydration mismatch
    const baseStyle: React.CSSProperties = {
      willChange: 'background-color, opacity, backdrop-filter, transform',
      backfaceVisibility: 'hidden',
      backgroundColor: style?.backgroundColor || `hsl(var(--card) / ${defaultOpacity})`,
      // GPU-accelerated backdrop blur - less blur and saturation for upload card
      backdropFilter: `${blurAmount} ${saturation}`,
      WebkitBackdropFilter: `${blurAmount} ${saturation}`,
      transform: 'translate3d(0px, 0px, 0px)', // Use consistent format with px units
    };
    
    // Merge with provided style, but ensure transform is consistent
    const mergedStyle: React.CSSProperties = {
      ...baseStyle,
      ...style,
      // Override transform to ensure consistency - always use px units to match React's normalization
      transform: style?.transform || baseStyle.transform,
    };
    
    // Normalize transform if it's a translate3d with unitless zeros
    if (typeof mergedStyle.transform === 'string' && mergedStyle.transform.includes('translate3d')) {
      mergedStyle.transform = mergedStyle.transform.replace(
        /translate3d\(([^)]+)\)/g,
        (match, values) => {
          const normalized = values.split(',').map((v: string) => {
            const trimmed = v.trim();
            // Convert unitless 0 to 0px for consistency
            return trimmed === '0' ? '0px' : trimmed;
          }).join(', ');
          return `translate3d(${normalized})`;
        }
      ) as any;
    }
    
    return (
      <div
        ref={ref}
        data-card="true"
        className={cn(
          "rounded-2xl border border-[color:var(--card-border-soft,hsla(var(--border),0.08))] shadow-lg backdrop-blur-lg transition-all duration-300 hover:shadow-xl hover:border-[color:var(--card-border-strong,hsla(var(--border),0.16))]",
          className
        )}
        style={mergedStyle}
        suppressHydrationWarning
        {...props}
      />
    );
  }
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
  style?: React.CSSProperties
} & React.HTMLAttributes<HTMLDivElement>

const Card: React.FC<LegacyCardProps> = ({ title, children, className, style, ...props }) => (
  <CardBase className={cn("p-4 sm:p-6", className)} style={style} {...props}>
    {title && <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>}
    <CardContent className="p-0">{children}</CardContent>
  </CardBase>
)
Card.displayName = "Card"

export { CardBase }
export { CardHeader }
export { CardFooter }
export { CardTitle }
export { CardDescription }
export { CardContent }
export { Card }
