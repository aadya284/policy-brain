"use client"

import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  return (
    <div className={["h-2 w-full overflow-hidden rounded-full bg-gray-200", className]
      .filter(Boolean)
      .join(" ")} {...props}>
      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-300"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}
