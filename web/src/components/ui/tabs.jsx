import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ className, ...props }) => (
  <div className={cn("flex gap-1 p-1 bg-bg-deep rounded-[10px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]", className)} {...props} />
)

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex gap-1", className)}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, active, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-150 border-0",
      active
        ? "bg-surface text-text shadow-[0_0_0_1px_var(--color-border)]"
        : "bg-transparent text-text-light hover:bg-surface-hover hover:text-text-soft",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4", className)}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
