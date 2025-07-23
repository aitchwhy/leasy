import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/client/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 hover:shadow-glow-sm',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
        outline: 'text-foreground border-border',
        success:
          'border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
        warning:
          'border-transparent bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }