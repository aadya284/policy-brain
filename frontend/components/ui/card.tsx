"use client"

import * as React from "react"

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-gray-200 bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={["border-b border-gray-100 px-4 py-4 sm:px-6", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={["p-4 sm:p-6", className].filter(Boolean).join(" ")} {...props} />
  )
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3 className={["text-lg font-semibold leading-none tracking-tight", className]
      .filter(Boolean)
      .join(" ")} {...props} />
  )
}

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p className={["text-sm text-gray-500", className].filter(Boolean).join(" ")} {...props} />
  )
}
