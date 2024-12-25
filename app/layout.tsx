import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { ProgressBar } from '@/components/progress-bar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '神秘实验室 | Mystery AI Lab',
  description: '探索人工智能的未来，分享前沿科技见解，展示创新项目成果。',
  keywords: '人工智能, 机器学习, 深度学习, 技术博客, AI研究, 科技创新',
  authors: [{ name: 'Hope', url: 'https://7hope.us.kg' }],
  creator: 'Hope',
  publisher: 'Mystery AI Lab',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://7hope.us.kg',
    siteName: '神秘实验室',
    title: '神秘实验室 | Mystery AI Lab',
    description: '探索人工智能的未来，分享前沿科技见解，展示创新项目成果。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '神秘实验室 | Mystery AI Lab',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '神秘实验室 | Mystery AI Lab',
    description: '探索人工智能的未来，分享前沿科技见解，展示创新项目成果。',
    images: ['/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ProgressBar />
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}

