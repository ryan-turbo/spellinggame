import * as React from "react"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef(({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full h-[5px] overflow-hidden rounded-[3px] bg-bg-deep shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-[3px] transition-all duration-400 ease-out bg-primary",
          indicatorClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
