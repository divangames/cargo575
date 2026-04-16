import fs from "node:fs/promises";

const counterId = process.env.METRIKA_COUNTER_ID;
const oauthToken = process.env.METRIKA_OAUTH_TOKEN;
const periodStart = process.env.METRIKA_PERIOD_START || "7daysAgo";
const periodEnd = process.env.METRIKA_PERIOD_END || "today";
const pageUrl = process.env.METRIKA_PAGE_URL || "";
const pageUrlsRaw = process.env.METRIKA_PAGE_URLS || "https://575cargo.ru/7-oshibok-pri-rabote-s-dostavkoy-iz-kitaya";
const outputFile = process.env.METRIKA_OUTPUT_FILE || "data/metrika-views.json";

if (!counterId || !oauthToken) {
  throw new Error("Missing METRIKA_COUNTER_ID or METRIKA_OAUTH_TOKEN");
}

const pageUrls = parsePageUrls(pageUrlsRaw, pageUrl);
const viewsByPage = {};

for (const url of pageUrls) {
  viewsByPage[url] = await fetchViewsForPage(url);
}

const totalViews = pageUrls.length
  ? Object.values(viewsByPage).reduce((acc, val) => acc + val, 0)
  : await fetchViewsForPage("");

const payload = {
  views: totalViews,
  pageUrl: pageUrls[0] || pageUrl || null,
  viewsByPage,
  periodStart,
  periodEnd,
  updatedAt: new Date().toISOString()
};

await fs.mkdir(outputFile.split("/").slice(0, -1).join("/"), { recursive: true });
await fs.writeFile(outputFile, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.log(`Updated ${outputFile}: ${totalViews}`);

function parsePageUrls(rawList, fallbackUrl) {
  const fromList = String(rawList || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  const list = fromList.length ? fromList : fallbackUrl ? [fallbackUrl] : [];
  return [...new Set(list)];
}

async function fetchViewsForPage(targetUrl) {
  const endpoint =
    "https://api-metrika.yandex.net/stat/v1/data" +
    `?ids=${encodeURIComponent(counterId)}` +
    "&metrics=ym:s:pageviews" +
    (targetUrl
      ? `&filters=${encodeURIComponent(
          `ym:pv:URL=='${String(targetUrl).replace(/'/g, "\\'")}'`
        )}`
      : "") +
    `&date1=${encodeURIComponent(periodStart)}` +
    `&date2=${encodeURIComponent(periodEnd)}` +
    "&accuracy=full";

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `OAuth ${oauthToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Metrika API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (
    data &&
    data.totals &&
    data.totals.length > 0 &&
    typeof data.totals[0] === "number"
  ) {
    return data.totals[0];
  }
  return 0;
}
