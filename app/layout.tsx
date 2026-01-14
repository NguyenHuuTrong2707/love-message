import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Noto_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const notoSans = Noto_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tin nhắn từ anh',
  description: 'Mỗi ngày xa nhau là một ngày gần hơn lúc gặp lại',
  manifest: '/manifest.json',
  themeColor: '#e7a2ae',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tin nhắn từ anh',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tin nhắn từ anh" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${plusJakarta.variable} ${notoSans.variable} font-display relative flex h-full min-h-screen w-full flex-col bg-[#F5F2F0] dark:bg-[#201c1e] overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}

