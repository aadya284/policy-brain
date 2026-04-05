"use client"

import * as React from "react"

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue>({})

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export function Select({ value, onValueChange, disabled, className, children }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      <div className={["relative inline-flex w-full flex-col", className].filter(Boolean).join(" ")}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const context = React.useContext(SelectContext)
  return (
    <button
      type="button"
      disabled={context.disabled}
      className={[
        "inline-flex h-12 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 text-left text-sm text-gray-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}

type SelectContentProps = React.HTMLAttributes<HTMLDivElement>

export function SelectContent({ className, ...props }: SelectContentProps) {
  return (
    <div className={["mt-2 rounded-xl border border-gray-200 bg-white shadow-sm", className]
      .filter(Boolean)
      .join(" ")} {...props} />
  )
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function SelectItem({ value, className, children, ...props }: SelectItemProps) {
  const context = React.useContext(SelectContext)
  return (
    <button
      type="button"
      className={["w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100", className]
        .filter(Boolean)
        .join(" ")}
      onClick={() => context.onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
}

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

export function SelectValue({ placeholder, className, ...props }: SelectValueProps) {
  const context = React.useContext(SelectContext)
  return (
    <span className={["text-sm text-gray-700", className].filter(Boolean).join(" ")} {...props}>
      {context.value || placeholder || "Select..."}
    </span>
  )
}
