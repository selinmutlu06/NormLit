import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://v0-normlit-research-assistant.vercel.app'),
  title: 'NormLit',
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} ${newsreader.variable}`}
    >
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
