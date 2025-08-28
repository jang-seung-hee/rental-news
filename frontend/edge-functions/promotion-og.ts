// Netlify Edge Function: Static OG meta for crawlers (KakaoTalk, SMS, etc.)
// This function serves server-rendered HTML with Open Graph tags when user-agents
// that don't execute JS (or prefetchers) request /view/* URLs.

import type { Context } from "https://edge.netlify.com";

const CRAWLER_REGEX = /bot|crawler|spider|facebookexternalhit|Slackbot|Twitterbot|WhatsApp|TelegramBot|KAKAOTALK|kakaotalk|kakaostory|kakao|Line|Naver|Daum|Baiduspider|Yeti/i;

// Minimal HTML template with OG tags
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
  return `<!DOCTYPE html>
  <html lang="ko"><head>
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
  const urlObj = new URL(request.url);
  const isCrawler = CRAWLER_REGEX.test(ua);

  // Identifier (slug or id) is the last path segment if under /view/*, otherwise empty
  const isView = urlObj.pathname.startsWith('/view/');
  const identifier = isView ? (urlObj.pathname.split("/").pop() || "") : "";

  // Default values – will be overridden by Firestore data if available
  const origin = `${urlObj.protocol}//${urlObj.host}`;
  let siteName = "렌탈톡톡";
  let defaultTitle = "렌탈 톡톡 월간 혜택 [웹 카탈로그]";
  let defaultDescription = "최신 렌탈 정보와 프로모션을 확인하세요";
  let defaultImage = `${origin}/promotionViewTitle_resize.png`;
  let faviconUrl = `${origin}/promotionViewTitle_resize.png`;
  const canonicalUrl = `${origin}/view/${identifier}`;

  if (!isCrawler) {
    // Let SPA handle normal users
    return context.next();
  }

  // Try to hydrate values from Firestore (public-read collections)
  try {
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID") || Deno.env.get("REACT_APP_FIREBASE_PROJECT_ID");
    if (projectId) {
      // systemSettings/main
      const sysRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/systemSettings/main`);
      if (sysRes.ok) {
        const sys = await sysRes.json();
        const f = sys.fields || {};
        siteName = (f.siteName?.stringValue as string) || siteName;
        defaultTitle = (f.defaultTitle?.stringValue as string) || defaultTitle;
        defaultDescription = (f.defaultDescription?.stringValue as string) || defaultDescription;
        defaultImage = (f.defaultImageUrl?.stringValue as string) || defaultImage;
        faviconUrl = (f.faviconUrl?.stringValue as string) || faviconUrl;
      }

      // promotions by id/slug only when /view/*
      let promoTitle: string | undefined;
      let promoDescription: string | undefined;
      let promoImage: string | undefined;

      if (isView && identifier) {
        const promoById = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/promotions/${identifier}`);
        if (promoById.ok) {
          const p = await promoById.json();
          const pf = p.fields || {};
          promoTitle = pf.title?.stringValue;
          // Strip HTML and clamp to 160
          const rawContent = pf.content?.stringValue as string | undefined;
          if (rawContent) {
            promoDescription = rawContent.replace(/<[^>]*>/g, '').substring(0, 160);
          }
          promoImage = pf.imageUrl?.stringValue;
        } else {
          // query by slug
          const query = {
            structuredQuery: {
              from: [{ collectionId: "promotions" }],
              where: {
                fieldFilter: {
                  field: { fieldPath: "slug" },
                  op: "EQUAL",
                  value: { stringValue: identifier }
                }
              },
              limit: 1
            }
          };
          const qRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(query)
          });
          if (qRes.ok) {
            const rows = await qRes.json();
            const doc = rows?.find((r: any) => r.document)?.document;
            if (doc?.fields) {
              const pf = doc.fields;
              promoTitle = pf.title?.stringValue;
              const raw = pf.content?.stringValue as string | undefined;
              if (raw) promoDescription = raw.replace(/<[^>]*>/g, '').substring(0, 160);
              promoImage = pf.imageUrl?.stringValue;
            }
          }
        }
      }

      // 일원화 요구사항: 시스템 설정 기반으로 통일 (프로모션 상세여도 시스템값 사용)
      const finalTitle = defaultTitle;
      const finalDesc = defaultDescription;
      const finalImage = defaultImage;

      const html = renderHtml({
        title: finalTitle,
        description: finalDesc,
        image: finalImage.startsWith('http') ? finalImage : `${origin}${finalImage}`,
        url: canonicalUrl,
        siteName,
        favicon: faviconUrl.startsWith('http') ? faviconUrl : `${origin}${faviconUrl}`
      });

      return new Response(html, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=600"
        }
      });
    }
  } catch (_) {
    // fall through to default
  }

  const fallbackHtml = renderHtml({
    title: defaultTitle,
    description: defaultDescription,
    image: defaultImage,
    url: canonicalUrl,
    siteName,
    favicon: faviconUrl
  });

  return new Response(fallbackHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};


