import { forwardRef } from "react"
import { cn } from "@/lib/tiptap-utils"
import { Input } from "@/components/tiptap-ui-primitive/input"
import { Button, type ButtonProps } from "@/components/tiptap-ui-primitive/button"

export const InputGroup = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="tiptap-input-group"
    className={cn("tiptap-input-group flex items-center rounded-md border border-input bg-background", className)}
    {...props}
  >
    {children}
  </div>
))
InputGroup.displayName = "InputGroup"

export const InputGroupInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, _ref) => (
  <Input
    className={cn("flex-1 border-0 bg-transparent px-3 py-2 outline-none", className)}
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

type Align = "inline-start" | "inline-end"

export const InputGroupAddon = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: Align }
>(({ className, align = "inline-end", children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="tiptap-input-group-addon"
    data-align={align}
    className={cn("flex items-center", align === "inline-end" && "pl-1", align === "inline-start" && "pr-1", className)}
    {...props}
  >
    {children}
  </div>
))
InputGroupAddon.displayName = "InputGroupAddon"

export type InputGroupButtonSize = ButtonProps["size"] | "icon-xs"

export const InputGroupButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "size"> & { size?: InputGroupButtonSize }
>(({ className, size = "small", ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size={size === "icon-xs" ? "small" : size}
    className={cn("h-7 w-7 shrink-0 p-0", className)}
    {...props}
  />
))
InputGroupButton.displayName = "InputGroupButton"
