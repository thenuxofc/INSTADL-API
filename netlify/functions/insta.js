const axios = require("axios");
const cheerio = require("cheerio");

const CREATOR = "THENUX";
const BASE = "https://en1.savefrom.net";
const PAGE = `${BASE}/25-instagram-reels-download-4GZ.html`;
const POST = `${BASE}/savefrom.php`;

exports.handler = async (event) => {
  const instaUrl = event.queryStringParameters?.url;

  if (!instaUrl) {
    return send(400, {
      creator: CREATOR,
      success: false,
      error: "Missing url parameter"
    });
  }

  try {
    const client = axios.create({
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true
    });

    const commonHeaders = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9,si;q=0.8",
      "sec-ch-ua": `"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"`,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": `"Windows"`
    };

    // 1. Warm request to get cookies
    const warm = await client.get(PAGE, {
      headers: {
        ...commonHeaders,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        referer: "https://www.google.com/"
      }
    });

    const cookies = warm.headers["set-cookie"]
      ? warm.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ")
      : "";

    const form = new URLSearchParams();
    form.append("sf_url", instaUrl);
    form.append("sf_submit", "");
    form.append("new", "2");
    form.append("lang", "en");
    form.append("app", "");
    form.append("country", "lk");
    form.append("os", "Windows");
    form.append("browser", "Chrome");
    form.append("channel", "article");

    // 2. Submit downloader form
    const res = await client.post(POST, form.toString(), {
      headers: {
        ...commonHeaders,
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded",
        origin: BASE,
        referer: PAGE,
        cookie: cookies,
        "x-requested-with": "XMLHttpRequest"
      }
    });

    if (res.status === 403) {
      return send(403, {
        creator: CREATOR,
        success: false,
        error:
          "SaveFrom blocked Netlify server IP. This is external site protection, not your code bug.",
        fix:
          "Try redeploy, use another backend like Cloudflare Worker/VPS, or use a real Instagram downloader provider."
      });
    }

    const html = String(res.data || "");
    const $ = cheerio.load(html);

    const title =
      $(".row.title").attr("title") ||
      $(".row.title").text().trim() ||
      "Instagram Video";

    const thumbnail = decode($("img.thumb").attr("src") || "");

    const downloads = [];

    $("a.link-download").each((i, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      downloads.push({
        quality:
          $(el).attr("data-quality") ||
          $(el).find(".subname").text().trim() ||
          "unknown",
        type: $(el).attr("data-type") || "mp4",
        url: decode(href)
      });
    });

    if (!downloads.length) {
      return send(404, {
        creator: CREATOR,
        success: false,
        error: "No video links found",
        status: res.status
      });
    }

    return send(200, {
      creator: CREATOR,
      success: true,
      title,
      thumbnail,
      total: downloads.length,
      best: downloads[0],
      downloads
    });
  } catch (err) {
    return send(500, {
      creator: CREATOR,
      success: false,
      error: err.message
    });
  }
};

function send(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body, null, 2)
  };
}

function decode(str = "") {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, `"`)
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
