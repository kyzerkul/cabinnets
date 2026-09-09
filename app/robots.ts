import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Deliberately minimal. Only the query-string search endpoint is blocked,
      // because `?q=…&page=…` is an unbounded crawl space with nothing unique in it.
      //
      // Everything else that must stay out of the index (/recherche itself,
      // /supprimer-ma-fiche, /revendiquer-ma-fiche) is handled by `noindex, follow`
      // in each page's metadata instead of by robots.txt. A page that is both
      // disallowed AND noindexed is the worst of both: the crawler never fetches
      // it, so it never sees the noindex — the URL can still surface in results
      // without a snippet, and the sitewide header/footer links into it become
      // crawl dead-ends. Letting Googlebot read the noindex drops the page
      // cleanly and lets link equity flow back out through it.
      //
      // Note: /recherche/expert-comptable-* (the 37 specialty landing pages) sit
      // under the same prefix and are in the sitemap. A blanket `Disallow: /recherche`
      // would cover them too; Google resolves that by longest-match against the
      // Allow rule, but other crawlers apply first-match. Blocking only the `?`
      // form removes the ambiguity entirely.
      disallow: ['/api/', '/recherche?'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
