// Netlify Edge Function: Serve system-settings based OG meta for crawlers
import type { Context } from "https://edge.netlify.com";

// 크롤러 정의 (사람 브라우저가 아닌 서버/봇들만)
const KNOWN_CRAWLERS = /(facebookexternalhit|twitterbot|slackbot|discordbot|googlebot|bingbot|yeti|naverbot|daum|baiduspider)/i;
// 카카오 썸네일 수집기
const KAKAO_SCRAPER = /\bkakaotalk-scrap\/\d/i;

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
  <!-- 루프 방지를 위해 JS 대신 메타 리프레시 -->
  <meta http-equiv="refresh" content="0; url=${url}">
  </head><body>
    <noscript><a href="${url}">Continue</a></noscript>
  </body></html>`;
}

export default async (request: Request, context: Context) => {
  const ua = request.headers.get("user-agent") || "";

  // 1) 카카오 인앱 브라우저: 무조건 SPA 렌더링
  const isKakaoInApp = /\bKAKAOTALK\b/i.test(ua) && !KAKAO_SCRAPER.test(ua);
  if (isKakaoInApp) return context.next();

  // 2) 실제 크롤러만 OG HTML 제공
  const isCrawler = KAKAO_SCRAPER.test(ua) || KNOWN_CRAWLERS.test(ua);
  if (!isCrawler) return context.next();

  const urlObj = new URL(request.url);
  const origin = `${urlObj.protocol}//${urlObj.host}`;
  const canonicalUrl = origin + urlObj.pathname + urlObj.search;

  // 기본값
  let siteName = "렌탈톡톡";
  let defaultTitle = "렌탈 톡톡 월간 혜택 [웹 카탈로그]";
  let defaultDescription = "최신 렌탈 정보와 프로모션을 확인하세요";
  let defaultImage = `${origin}/promotionViewTitle_resize.png`;
  let faviconUrl = `${origin}/favicon.ico`;

  // Firestore에서 시스템 설정 읽기
  try {
    const projectId =
      Deno.env.get("FIREBASE_PROJECT_ID") ||
      Deno.env.get("REACT_APP_FIREBASE_PROJECT_ID");
    if (projectId) {
      const sysRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/systemSettings/main`
      );
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
    // 실패 시 기본값 유지
  }

  // 절대 URL로 보정
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
