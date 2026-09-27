import type React from "react"
import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import "./globals.css"

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Policy Brain - Intelligent Document Analysis",
  description: "AI-powered document analysis for seamless policy management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${openSans.className} antialiased`}>{children}</body>
    </html>
  )
}


