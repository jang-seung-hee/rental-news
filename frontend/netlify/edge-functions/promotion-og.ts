// Netlify Edge Function: Serve system-settings based OG meta for crawlers
import type { Context } from "https://edge.netlify.com";

const CRAWLER_REGEX = /bot|crawler|spider|facebookexternalhit|Slackbot|Twitterbot|WhatsApp|TelegramBot|KAKAOTALK|kakaotalk|kakaostory|kakao|Line|Naver|Daum|Baiduspider|Yeti/i;

function renderHtml({
  title,
  description,
  image,
  url,
  siteName,
  favicon
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  favicon: string;
}) {
  return `<!doctype html><html lang="ko"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="icon" href="${favicon}" />
  <link rel="apple-touch-icon" href="${favicon}" />
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${siteName}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  </head><body>
    <script>location.replace(${JSON.stringify(url)});</script>
  </body></html>`;
}

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";
  const isCrawler = CRAWLER_REGEX.test(ua);
  if (!isCrawler) return context.next();

  const urlObj = new URL(request.url);
  const origin = `${urlObj.protocol}//${urlObj.host}`;
  const canonicalUrl = origin + urlObj.pathname + urlObj.search;

  // Defaults
  let siteName = "렌탈톡톡";
  let defaultTitle = "렌탈 톡톡 월간 혜택 [웹 카탈로그]";
  let defaultDescription = "최신 렌탈 정보와 프로모션을 확인하세요";
  let defaultImage = `${origin}/promotionViewTitle_resize.png`;
  let faviconUrl = `${origin}/favicon.ico`;

  // Fetch system settings from Firestore (public read)
  try {
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID") || Deno.env.get("REACT_APP_FIREBASE_PROJECT_ID");
    if (projectId) {
      const sysRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/systemSettings/main`);
      if (sysRes.ok) {
        const sys = await sysRes.json();
        const f = sys.fields || {};
        siteName = f.siteName?.stringValue || siteName;
        defaultTitle = f.defaultTitle?.stringValue || defaultTitle;
        defaultDescription = f.defaultDescription?.stringValue || defaultDescription;
        defaultImage = f.defaultImageUrl?.stringValue || defaultImage;
        faviconUrl = f.faviconUrl?.stringValue || faviconUrl;
      }
    }
  } catch (_) {
    // ignore and use defaults
  }

  // Resolve relative asset URLs
  const resolve = (v: string) => (v.startsWith("http") ? v : `${origin}${v}`);

  const html = renderHtml({
    title: defaultTitle,
    description: defaultDescription,
    image: resolve(defaultImage),
    url: canonicalUrl,
    siteName,
    favicon: resolve(faviconUrl)
  });

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=600"
    }
  });
};


