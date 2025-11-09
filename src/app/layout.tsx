import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

// Using system font stack instead of Google Fonts to avoid network dependency
const fontClass = 'font-sans'

export const metadata: Metadata = {
  title: 'Amrita Vidyalayam - School Management System',
  description: 'Comprehensive school management system for Amrita Vidyalayam',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={fontClass}>{children}</body>
    </html>
  )
}
