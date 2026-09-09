import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { buildHomepageTitle, siteUrl, SITE_NAME } from '@/lib/seo'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  // siteUrl() throws on a production build when NEXT_PUBLIC_SITE_URL is unset,
  // rather than silently falling back to localhost and emitting
  // `http://localhost:3000/...` canonicals on every page.
  metadataBase: new URL(siteUrl()),
  title: {
    default: buildHomepageTitle(),
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Annuaire indépendant des cabinets d'expertise comptable en France. Trouvez un expert-comptable près de chez vous : coordonnées, horaires, spécialités.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="main-content" className="flex-1 scroll-mt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
