"use client"

import * as React from "react"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={[
        "min-h-[80px] w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  )
}
