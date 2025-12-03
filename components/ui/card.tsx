"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"

const CardBase = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => {
    // Check if this is upload card - needs less blur for ripple visibility
    const isUploadCard = (props as any)['data-upload-card'] !== undefined;
    const defaultOpacity = 0.85;
    const [isMobile, setIsMobile] = useState(false);
    
    // Check if mobile on client side
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Upload card gets less blur, others get full blur
    // Same opacity for all cards, but less blur for upload card to see ripple
    // Upload card also gets less saturation to match visual appearance
    // On mobile, reduce blur significantly for performance
    const blurAmount = isUploadCard 
      ? (isMobile ? 'blur(2px)' : 'blur(4px)')
      : (isMobile ? 'blur(8px)' : 'blur(16px)');
    const saturation = isUploadCard ? 'saturate(100%)' : (isMobile ? 'saturate(120%)' : 'saturate(180%)');
    
    // Merge styles - all cards use same opacity now
    const mergedStyle: React.CSSProperties = {
      willChange: 'background-color, opacity, backdrop-filter',
      backfaceVisibility: 'hidden',
      ...style,
      backgroundColor: style?.backgroundColor || `hsl(var(--card) / ${defaultOpacity})`,
      // GPU-accelerated backdrop blur - less blur and saturation for upload card
      backdropFilter: `${blurAmount} ${saturation}`,
      WebkitBackdropFilter: `${blurAmount} ${saturation}`,
      transform: 'translate3d(0, 0, 0)',
    };
    
    return (
      <div
        ref={ref}
        data-card="true"
        className={cn(
          "rounded-2xl border border-primary/10 dark:border-primary/20 shadow-lg backdrop-blur-lg transition-all duration-300 hover:shadow-xl hover:border-primary/20",
          className
        )}
        style={{
          ...mergedStyle,
          transition: mergedStyle.transition || 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.5s cubic-bezier(0.4, 0, 0.2, 1), min-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
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

const Card = ({ title, children, className, style, ...props }: LegacyCardProps) => (
  <CardBase className={cn("p-4 sm:p-6", className)} style={style} {...props}>
    {title && <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>}
    <CardContent className="p-0">{children}</CardContent>
  </CardBase>
)

export { CardBase, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, Card }
