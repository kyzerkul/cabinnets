/**
 * Vérificateur d'indexabilité — à lancer depuis votre machine, contre le site EN LIGNE.
 *
 *   npm run seo:check
 *   npm run seo:check -- https://www.cabinetscomptables.online
 *
 * Il répond aux questions qu'on ne peut pas trancher depuis le code :
 *   1. Quel hôte est servi sans redirection (apex ou www) ?
 *   2. NEXT_PUBLIC_SITE_URL en production correspond-il à cet hôte ?
 *   3. Le robots.txt et les sitemaps sont-ils valides et sur le bon hôte ?
 *   4. Les canonicals des pages pointent-ils vers l'URL réellement servie ?
 *
 * Aucune dépendance : fetch natif de Node 18+.
 */

const DEFAULT_DOMAIN = 'cabinetscomptables.online'
const SAMPLE_SIZE = 8

const RESET = '\x1b[0m'
const paint = (code: string, s: string) => `${code}${s}${RESET}`
const red = (s: string) => paint('\x1b[31m', s)
const green = (s: string) => paint('\x1b[32m', s)
const yellow = (s: string) => paint('\x1b[33m', s)
const bold = (s: string) => paint('\x1b[1m', s)

let failures = 0
let warnings = 0

function pass(msg: string) {
  console.log(`  ${green('✓')} ${msg}`)
}
function fail(msg: string) {
  failures++
  console.log(`  ${red('✗')} ${red(msg)}`)
}
function warn(msg: string) {
  warnings++
  console.log(`  ${yellow('!')} ${msg}`)
}
function head(msg: string) {
  console.log(`\n${bold(msg)}`)
}

type Hop = { url: string; status: number; location: string | null }

/** Follows redirects manually so the chain itself can be reported. */
async function trace(url: string, maxHops = 6): Promise<{ hops: Hop[]; finalUrl: string }> {
  const hops: Hop[] = []
  let current = url
  for (let i = 0; i < maxHops; i++) {
    let res: Response
    try {
      res = await fetch(current, { redirect: 'manual', headers: { 'user-agent': UA } })
    } catch (err) {
      hops.push({ url: current, status: 0, location: null })
      console.log(`    (échec réseau sur ${current}: ${(err as Error).message})`)
      return { hops, finalUrl: current }
    }
    const location = res.headers.get('location')
    hops.push({ url: current, status: res.status, location })
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).toString()
      continue
    }
    return { hops, finalUrl: current }
  }
  return { hops, finalUrl: current }
}

const UA =
  'Mozilla/5.0 (compatible; seo-check/1.0; +https://github.com/) AppleWebKit/537.36 Chrome/120 Safari/537.36'

async function getText(url: string): Promise<{ status: number; body: string; finalUrl: string }> {
  const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA } })
  return { status: res.status, body: await res.text(), finalUrl: res.url || url }
}

function tag(html: string, re: RegExp): string | null {
  const m = html.match(re)
  return m ? m[1].trim() : null
}

const CANONICAL_RE = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
const CANONICAL_RE_ALT = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i
const ROBOTS_META_RE = /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i

// ─── 1. Quel hôte est canonique ? ─────────────────────────────────

async function detectCanonicalHost(target: {
  domain: string
  explicitOrigin: string | null
}): Promise<string | null> {
  head("1. Résolution de l'hôte (apex vs www)")
  // A local or IP target has no www sibling to arbitrate — probe it as given.
  const candidates =
    target.explicitOrigin && !target.domain.includes('.')
      ? [`${target.explicitOrigin}/`]
      : [`https://${target.domain}/`, `https://www.${target.domain}/`]
  const results: { start: string; finalUrl: string; hops: Hop[] }[] = []

  for (const c of candidates) {
    const { hops, finalUrl } = await trace(c)
    results.push({ start: c, finalUrl, hops })
    const chain = hops.map((h) => `${h.status}`).join(' → ')
    const last = hops[hops.length - 1]
    if (last && last.status === 200 && hops.length === 1) {
      pass(`${c} → 200 sans redirection`)
    } else if (last && last.status === 200) {
      console.log(`  ${yellow('→')} ${c} → ${chain} → ${finalUrl}`)
    } else {
      fail(`${c} → ${chain} (dernier statut ${last?.status ?? 'n/a'})`)
    }
  }

  const direct = results.filter((r) => r.hops.length === 1 && r.hops[0].status === 200)
  if (direct.length === 1) {
    const host = new URL(direct[0].start).origin
    pass(`Hôte canonique détecté : ${bold(host)}`)
    return host
  }
  if (direct.length === 2) {
    fail(
      'Les DEUX hôtes répondent 200 sans redirection. Google voit alors deux copies ' +
        'complètes du site. Dans Vercel, définissez un domaine principal et laissez ' +
        "l'autre rediriger vers lui.",
    )
    return new URL(results[0].start).origin
  }
  const ok = results.find((r) => r.hops[r.hops.length - 1]?.status === 200)
  if (ok) {
    const host = new URL(ok.finalUrl).origin
    warn(`Aucun hôte ne répond directement en 200 ; destination finale : ${host}`)
    return host
  }
  fail('Aucun des deux hôtes ne répond. Site injoignable ?')
  return null
}

// ─── 2. robots.txt ────────────────────────────────────────────────

async function checkRobots(origin: string): Promise<string | null> {
  head('2. robots.txt')
  const { status, body } = await getText(`${origin}/robots.txt`)
  if (status !== 200) {
    fail(`GET /robots.txt → ${status}`)
    return null
  }
  console.log(
    body
      .trim()
      .split('\n')
      .map((l) => `    │ ${l}`)
      .join('\n'),
  )

  if (/^\s*Disallow:\s*\/\s*$/im.test(body)) {
    fail('robots.txt contient « Disallow: / » — tout le site est bloqué au crawl.')
  } else {
    pass('Aucun blocage global (« Disallow: / »)')
  }

  const sitemapLine = body.match(/^\s*Sitemap:\s*(\S+)/im)
  if (!sitemapLine) {
    fail('Aucune directive Sitemap dans robots.txt')
    return null
  }
  const sitemapUrl = sitemapLine[1]
  if (!/^https?:\/\//i.test(sitemapUrl)) {
    fail(
      `La directive Sitemap est relative (« ${sitemapUrl} ») — elle doit être une URL absolue. ` +
        'Cause typique : NEXT_PUBLIC_SITE_URL non défini au moment du build.',
    )
    return null
  }
  if (new URL(sitemapUrl).origin !== origin) {
    fail(
      `Le sitemap déclaré est sur ${new URL(sitemapUrl).origin} alors que le site est servi ` +
        `sur ${origin}. NEXT_PUBLIC_SITE_URL ne correspond pas au domaine principal.`,
    )
  } else {
    pass(`Sitemap déclaré : ${sitemapUrl}`)
  }
  return sitemapUrl
}

// ─── 3. Sitemaps ──────────────────────────────────────────────────

function extract(xml: string, tagName: 'loc'): string[] {
  const re = new RegExp(`<${tagName}>([^<]+)</${tagName}>`, 'gi')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim())
  return out
}

async function checkSitemaps(sitemapUrl: string, origin: string): Promise<string[]> {
  head('3. Sitemaps')
  const { status, body } = await getText(sitemapUrl)
  if (status !== 200) {
    fail(`GET ${sitemapUrl} → ${status}`)
    return []
  }

  const isIndex = /<sitemapindex/i.test(body)
  const children = isIndex ? extract(body, 'loc') : [sitemapUrl]
  if (isIndex) pass(`Index de sitemaps : ${children.length} fichiers`)

  const relative = children.filter((u) => !/^https?:\/\//i.test(u))
  if (relative.length > 0) {
    fail(
      `${relative.length} entrée(s) relative(s) dans l'index (ex. « ${relative[0]} »). ` +
        'Un sitemap DOIT contenir des URLs absolues — Google rejette le fichier entier.',
    )
  }

  const allUrls: string[] = []
  for (const child of children) {
    if (!/^https?:\/\//i.test(child)) continue
    const res = await getText(child)
    if (res.status !== 200) {
      fail(`GET ${child} → ${res.status}`)
      continue
    }
    const urls = extract(res.body, 'loc')
    const wrongHost = urls.filter((u) => {
      try {
        return new URL(u).origin !== origin
      } catch {
        return true
      }
    })
    const name = child.split('/').pop()
    if (urls.length === 0) {
      fail(`${name} : 0 URL — sitemap vide.`)
    } else if (wrongHost.length > 0) {
      fail(
        `${name} : ${urls.length} URLs, dont ${wrongHost.length} sur un autre hôte ` +
          `(ex. « ${wrongHost[0]} » au lieu de ${origin}/…).`,
      )
    } else {
      pass(`${name} : ${urls.length} URLs, toutes sur ${origin}`)
    }
    allUrls.push(...urls)
  }
  console.log(`  ${bold(`Total : ${allUrls.length} URLs déclarées`)}`)
  return allUrls
}

// ─── 4. Échantillon de pages ──────────────────────────────────────

async function checkPages(urls: string[], origin: string) {
  head(`4. Échantillon de ${Math.min(SAMPLE_SIZE, urls.length)} pages`)
  if (urls.length === 0) {
    fail('Aucune URL à tester (sitemap vide ou illisible).')
    return
  }

  const step = Math.max(1, Math.floor(urls.length / SAMPLE_SIZE))
  const sample = Array.from({ length: Math.min(SAMPLE_SIZE, urls.length) }, (_, i) => urls[i * step])

  for (const url of sample) {
    const short = url.replace(origin, '') || '/'
    const { hops, finalUrl } = await trace(url)
    const last = hops[hops.length - 1]

    if (!last || last.status !== 200) {
      fail(`${short} → ${hops.map((h) => h.status).join(' → ')}`)
      continue
    }
    if (hops.length > 1) {
      fail(`${short} → redirigée vers ${finalUrl} alors qu'elle est déclarée telle quelle au sitemap`)
      continue
    }

    const { body } = await getText(url)
    const canonical = tag(body, CANONICAL_RE) ?? tag(body, CANONICAL_RE_ALT)
    const robotsMeta = tag(body, ROBOTS_META_RE)
    const title = tag(body, TITLE_RE)

    const problems: string[] = []
    if (!canonical) {
      problems.push('aucun <link rel="canonical">')
    } else {
      let canonOrigin = ''
      try {
        canonOrigin = new URL(canonical, url).origin
      } catch {
        /* ignore */
      }
      // Only a defect when the *served* host is not itself localhost — otherwise
      // this is just someone running the check against `next start` locally.
      if (/localhost|127\.0\.0\.1/.test(canonical) && !/localhost|127\.0\.0\.1/.test(origin)) {
        problems.push(
          `canonical = « ${canonical} » → NEXT_PUBLIC_SITE_URL n'était pas défini au build`,
        )
      } else if (canonOrigin !== origin) {
        problems.push(`canonical sur ${canonOrigin} au lieu de ${origin}`)
      } else if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
        problems.push(`canonical (${canonical}) ≠ URL servie`)
      }
    }
    if (robotsMeta && /noindex/i.test(robotsMeta)) problems.push(`meta robots = « ${robotsMeta} »`)
    if (!title) problems.push('aucun <title>')

    if (problems.length === 0) pass(`${short} — 200, canonical auto-référent`)
    else fail(`${short} — ${problems.join(' ; ')}`)

    if (title) {
      const parts = title.split('|').map((s) => s.trim())
      const dupes = parts.filter((p, i) => p && parts.indexOf(p) !== i)
      if (dupes.length > 0) warn(`    titre dupliqué : « ${title} »`)
    }
  }
}

// ─── main ─────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2]
  const parsed = arg ? new URL(arg.startsWith('http') ? arg : `https://${arg}`) : null
  const domain = parsed ? parsed.hostname.replace(/^www\./, '') : DEFAULT_DOMAIN
  const explicitOrigin = parsed ? parsed.origin : null

  console.log(bold(`\nVérification SEO — ${parsed ? parsed.origin : domain}\n${'─'.repeat(40)}`))

  const origin = await detectCanonicalHost({ domain, explicitOrigin })
  if (!origin) {
    console.log(red('\nArrêt : site injoignable.\n'))
    process.exit(1)
  }

  const sitemapUrl = await checkRobots(origin)
  const urls = sitemapUrl ? await checkSitemaps(sitemapUrl, origin) : []
  await checkPages(urls, origin)

  head('Résumé')
  if (failures === 0) {
    console.log(
      `  ${green('Aucun blocage technique détecté.')}` +
        (warnings > 0 ? ` (${warnings} avertissement(s))` : ''),
    )
    console.log(
      `\n  Valeur à mettre dans NEXT_PUBLIC_SITE_URL : ${bold(origin)}\n`,
    )
  } else {
    console.log(`  ${red(`${failures} problème(s) bloquant(s)`)}, ${warnings} avertissement(s).`)
    console.log(
      `\n  Dans la quasi-totalité des cas le correctif est le même :\n` +
        `  définir NEXT_PUBLIC_SITE_URL = ${bold(origin)} dans Vercel\n` +
        `  (Production + Preview + Development), puis redéployer.\n`,
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(red(`\nErreur : ${err.message}\n`))
  process.exit(1)
})
