import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meteor NASA',
  description: 'Next.js App with React, Tailwind and i18n'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
