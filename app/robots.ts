import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/recherche/expert-comptable-'],
      disallow: ['/api/', '/recherche', '/supprimer-ma-fiche', '/revendiquer-ma-fiche'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
