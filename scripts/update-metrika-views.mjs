import fs from "node:fs/promises";

const counterId = process.env.METRIKA_COUNTER_ID;
const oauthToken = process.env.METRIKA_OAUTH_TOKEN;
const periodStart = process.env.METRIKA_PERIOD_START || "7daysAgo";
const periodEnd = process.env.METRIKA_PERIOD_END || "today";
const outputFile = process.env.METRIKA_OUTPUT_FILE || "data/metrika-views.json";

if (!counterId || !oauthToken) {
  throw new Error("Missing METRIKA_COUNTER_ID or METRIKA_OAUTH_TOKEN");
}

const endpoint =
  "https://api-metrika.yandex.net/stat/v1/data" +
  `?ids=${encodeURIComponent(counterId)}` +
  "&metrics=ym:s:pageviews" +
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
const views =
  data &&
  data.totals &&
  data.totals.length > 0 &&
  typeof data.totals[0] === "number"
    ? data.totals[0]
    : 0;

const payload = {
  views,
  periodStart,
  periodEnd,
  updatedAt: new Date().toISOString()
};

await fs.mkdir(outputFile.split("/").slice(0, -1).join("/"), { recursive: true });
await fs.writeFile(outputFile, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.log(`Updated ${outputFile}: ${views}`);
