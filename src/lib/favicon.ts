const cache = new Map<string, string | null>();

function absUrl(href: string, base: string): string | null {
  try {
    const clean = href
      .replace(/&/gi, "&")
      .replace(/"/gi, '"')
      .replace(/&#x2F;/gi, "/")
      .trim();
    if (clean.startsWith("data:")) return null;
    return new URL(clean, base).toString();
  } catch {
    return null;
  }
}

function scoreIcon(rel: string, href: string, sizes: string): number {
  const px = Math.max(0, ...sizes.split(/\s+/).map((part) => parseInt(part, 10) || 0));
  let score = px || 16;
  if (rel.includes("apple-touch")) score += 240;
  if (href.includes(".svg")) score += 80;
  if (href.includes(".png")) score += 40;
  if (href.endsWith(".ico")) score += 10;
  return score;
}

export async function scrapeFavicon(pageUrl: string): Promise<string | null> {
  let host = "";
  try {
    host = new URL(pageUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
  if (cache.has(host)) return cache.get(host) ?? null;

  const found = await scrapeOnce(pageUrl);
  cache.set(host, found);
  return found;
}

async function scrapeOnce(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "Mozilla/5.0 (compatible; mygirlfriendisfurious/1.0; +https://mygirlfriendisfurious.lol)",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return fallbackIco(res.url || pageUrl);
    const html = (await res.text()).slice(0, 160_000);
    const base = res.url || pageUrl;
    const icons: { href: string; score: number }[] = [];
    for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
      const raw = tag[0];
      const rel = raw.match(/\brel=["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
      if (!rel.includes("icon")) continue;
      const href = raw.match(/\bhref=["']([^"']+)["']/i)?.[1];
      if (!href) continue;
      const abs = absUrl(href, base);
      if (!abs) continue;
      const sizes = raw.match(/\bsizes=["']([^"']+)["']/i)?.[1] ?? "";
      icons.push({ href: abs, score: scoreIcon(rel, abs, sizes) });
    }
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i)?.[0];
    const ogHref = og?.match(/\bcontent=["']([^"']+)["']/i)?.[1];
    if (ogHref) {
      const abs = absUrl(ogHref, base);
      if (abs) icons.push({ href: abs, score: 30 });
    }
    icons.sort((a, b) => b.score - a.score);
    return icons[0]?.href ?? fallbackIco(base);
  } catch {
    return fallbackIco(pageUrl);
  }
}

function fallbackIco(pageUrl: string): string | null {
  try {
    return new URL("/favicon.ico", pageUrl).toString();
  } catch {
    return null;
  }
}
