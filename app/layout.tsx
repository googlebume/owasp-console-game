import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Courier_Prime } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OWASP Terminal - Retro Cybersecurity Game",
  description: "Learn OWASP vulnerabilities in a retro 80s terminal game",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${courierPrime.className} antialiased bg-retro-black text-retro-green`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
