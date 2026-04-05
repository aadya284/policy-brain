"use client"

import * as React from "react"

type ButtonVariant = "ghost" | "outline" | "destructive" | "secondary" | "icon"
type ButtonSize = "sm" | "lg" | "icon"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  icon: "bg-transparent text-gray-600 hover:bg-gray-100 p-2",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  lg: "px-5 py-3 text-base",
  icon: "p-2",
}

export function Button({
  className,
  variant = "ghost",
  size = "sm",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <button type={type} className={classes} {...props} />
}
