"use client"

import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "secondary" | "outline"
}

export function Badge({ variant, className, ...props }: BadgeProps) {
  const baseClass = "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
  const variantClass =
    variant === "secondary"
      ? "bg-gray-100 text-gray-800"
      : variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700"
      : "bg-blue-100 text-blue-800"

  return <span className={[baseClass, variantClass, className].filter(Boolean).join(" ")} {...props} />
}
