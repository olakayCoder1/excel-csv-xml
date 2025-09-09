// app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Karantashi - Convert CSV/Excel to XML Instantly',
  description: 'Easily convert CSV or Excel files to XML format online with Karantashi. Fast, free, and secure file conversion for developers and data professionals.',
  keywords: ['CSV to XML', 'Excel to XML', 'convert CSV XML', 'CSV converter', 'Excel converter', 'Karantashi'],
  authors: [{ name: 'Karantashi' }],
  viewport: 'width=device-width, initial-scale=1.0',
  openGraph: {
    title: 'Karantashi - Convert CSV/Excel to XML Instantly',
    description: 'Fast and secure file conversion from CSV/Excel to XML. Built for developers, analysts, and data teams.',
    url: 'https://excel-csv-xml.vercel.app', 
    siteName: 'Karantashi',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karantashi - Convert CSV/Excel to XML Instantly',
    description: 'Fast and secure file conversion from CSV/Excel to XML. Built for developers, analysts, and data teams.',
    creator: '@olakayCoder1', 
  },
  icons: {
    icon: '/favicon.ico', 
  },
  metadataBase: new URL('https://www.linkedin.com/in/olanrewaju-abdulkabeer'), 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head />
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
