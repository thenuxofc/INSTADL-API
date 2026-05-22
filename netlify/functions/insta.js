const axios = require("axios");
const cheerio = require("cheerio");

const CREATOR = "THENUX";
const BASE = "https://en1.savefrom.net";
const PAGE = `${BASE}/25-instagram-reels-download-4GZ.html`;
const POST = `${BASE}/savefrom.php`;

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  if (!url || !url.includes("instagram.com")) {
    return json(headers, 400, {
      creator: CREATOR,
      success: false,
      error: "Instagram URL required. Example: /api/insta?url=https://www.instagram.com/reel/xxxx/"
    });
  }

  try {
    const form = new URLSearchParams();
    form.append("sf_url", url);
    form.append("sf_submit", "");
    form.append("new", "2");
    form.append("lang", "en");
    form.append("app", "");
    form.append("country", "lk");
    form.append("os", "Windows");
    form.append("browser", "Chrome");
    form.append("channel", "article");

    const { data: html } = await axios.post(POST, form.toString(), {
      timeout: 30000,
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9,si;q=0.8",
        "content-type": "application/x-www-form-urlencoded",
        "origin": BASE,
        "referer": PAGE,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
      }
    });

    const $ = cheerio.load(html);

    const title =
      $(".row.title").attr("title") ||
      $(".row.title").text().trim() ||
      "Instagram Video";

    const thumbnail = $(".thumb-box img.thumb").attr("src") || null;

    const downloads = [];

    $("a.link-download").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      downloads.push({
        quality: $(el).attr("data-quality") || $(el).find(".subname").text().trim() || "unknown",
        type: $(el).attr("data-type") || "mp4",
        url: decodeHtml(href),
        filename: cleanFileName($(el).attr("download") || `${title}.mp4`)
      });
    });

    if (!downloads.length) {
      return json(headers, 502, {
        creator: CREATOR,
        success: false,
        error: "No downloadable video found. Link may be private, expired, or SaveFrom blocked the request."
      });
    }

    return json(headers, 200, {
      creator: CREATOR,
      success: true,
      source: url,
      title,
      thumbnail: thumbnail ? decodeHtml(thumbnail) : null,
      total: downloads.length,
      best: downloads[0],
      downloads
    });
  } catch (err) {
    return json(headers, 500, {
      creator: CREATOR,
      success: false,
      error: err.message
    });
  }
};

function json(headers, statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body, null, 2)
  };
}

function decodeHtml(str = "") {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanFileName(name = "instagram-video.mp4") {
  return name
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}
