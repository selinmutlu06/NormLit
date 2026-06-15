import type { Metadata } from 'next'
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://v0-normlit-research-assistant.vercel.app'),
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable}`}
    >
      <body className="font-sans antialiased">
        {/* Enable scroll-reveal only when JS is present, so content never
            stays hidden if JS is disabled or fails. Runs before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('reveal-ready')`,
          }}
        />
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
