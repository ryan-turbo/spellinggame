import * as React from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  default: "bg-primary-light text-primary",
  secondary: "bg-surface text-text-soft",
  success: "bg-accent-bg text-accent",
  destructive: "bg-danger-bg text-danger",
  outline: "border border-border text-text-light",
  coral: "bg-coral-bg text-coral",
  muted: "bg-bg-deep text-text-muted",
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.4px] transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
