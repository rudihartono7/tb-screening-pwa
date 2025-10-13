import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import AuthInitializer from '@/components/AuthInitializer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'TB Screening PWA',
  description: 'Progressive Web App for Tuberculosis Screening and Management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TB Screening PWA',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'TB Screening PWA',
    title: 'TB Screening PWA',
    description: 'Progressive Web App for Tuberculosis Screening and Management',
  },
  twitter: {
    card: 'summary',
    title: 'TB Screening PWA',
    description: 'Progressive Web App for Tuberculosis Screening and Management',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthInitializer />
          {children}
          <InstallPrompt />
        </QueryProvider>
      </body>
    </html>
  );
}
