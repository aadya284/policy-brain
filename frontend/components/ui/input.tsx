"use client"

import * as React from "react"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={[
        "flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  )
}
