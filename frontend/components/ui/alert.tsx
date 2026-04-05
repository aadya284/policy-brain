"use client"

import * as React from "react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "destructive" | "default"
}

export function Alert({
  variant = "default",
  className,
  ...props
}: AlertProps) {
  const tone =
    variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-gray-200 bg-gray-50 text-gray-800"

  return (
    <div className={["flex items-start gap-3 rounded-2xl border px-4 py-3", tone, className]
      .filter(Boolean)
      .join(" ")} {...props} />
  )
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={["text-sm leading-relaxed", className].filter(Boolean).join(" ")} {...props} />
  )
}
