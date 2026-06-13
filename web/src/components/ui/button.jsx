import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
  default: "bg-muted-purple text-white border border-muted-purple-border shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] hover:bg-[#8a759e] hover:shadow-[0_4px_12px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_3px_rgba(0,0,0,0.1)]",
  secondary: "bg-surface text-text shadow-[0_0_0_1px_var(--color-border)] hover:bg-surface-hover hover:shadow-[0_0_0_1px_var(--color-border-hover)]",
  ghost: "bg-transparent hover:bg-surface-hover text-text-soft",
  outline: "border border-border bg-transparent hover:bg-surface-hover text-text-soft",
  destructive: "bg-danger-bg text-danger shadow-[0_0_0_1px_rgba(250,127,170,0.25)] hover:bg-[rgba(250,127,170,0.2)]",
  gold: "bg-accent-bg text-accent shadow-[0_0_0_1px_rgba(194,239,78,0.25)] hover:bg-[rgba(194,239,78,0.18)]",
  coral: "bg-coral-bg text-coral shadow-[0_0_0_1px_rgba(255,178,135,0.25)] hover:bg-[rgba(255,178,135,0.2)]",
  primaryLight: "bg-primary-light text-primary shadow-[0_0_0_1px_rgba(106,95,193,0.2)] hover:bg-[rgba(106,95,193,0.25)]",
}

const buttonSizes = {
  default: "px-[18px] py-[10px] text-[13px]",
  sm: "px-3 py-1.5 text-xs",
  lg: "px-6 py-4 text-sm",
  icon: "p-1.5 text-lg",
}

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? "span" : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold cursor-pointer transition-all duration-150 uppercase tracking-[0.3px] leading-[1.4] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-inherit",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
