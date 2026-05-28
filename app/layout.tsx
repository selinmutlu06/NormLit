import type { Metadata } from 'next'
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: 'NormLit - Research Literature Assistant',
  description: 'AI-powered research assistant for cognitive neuroscience labs. Chat with your papers, compare findings, and accelerate your research.',
  generator: 'v0.app',
  openGraph: {
    title: 'NormLit - Research Literature Assistant',
    description: 'AI-powered research assistant for cognitive neuroscience labs. Chat with your papers, compare findings, and accelerate your research.',
    images: ['/brain-icon.svg'],
  },
  twitter: {
    card: 'summary',
    title: 'NormLit - Research Literature Assistant',
    description: 'AI-powered research assistant for cognitive neuroscience labs.',
    images: ['/brain-icon.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
