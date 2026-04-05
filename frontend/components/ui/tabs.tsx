"use client"

import * as React from "react"

interface TabsContextValue {
  value: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

interface TabsProps {
  defaultValue: string
  className?: string
  children: React.ReactNode
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={["space-y-4", className].filter(Boolean).join(" ")}>{children}</div>
    </TabsContext.Provider>
  )
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>
export function TabsList({ className, ...props }: TabsListProps) {
  return <div className={["flex items-center", className].filter(Boolean).join(" ")} {...props} />
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}
export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value

  return (
    <button
      type="button"
      className={[
        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        isActive ? "bg-white text-blue-600 shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => context?.onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}
export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context || context.value !== value) {
    return null
  }
  return <div className={["pt-4", className].filter(Boolean).join(" ")} {...props}>{children}</div>
}
