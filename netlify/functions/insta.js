const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async (event) => {
  const instaUrl = event.queryStringParameters?.url;

  if (!instaUrl) {
    return response({
      success: false,
      error: "Instagram URL required"
    });
  }

  try {
    const BASE = "https://en1.savefrom.net";
    const PAGE = `${BASE}/25-instagram-reels-download-4GZ.html`;

    // REAL BROWSER HEADERS
    const browserHeaders = {
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "priority": "u=0, i",
      "sec-ch-ua":
        `"Google Chrome";v="148", "Chromium";v="148", "Not/A)Brand";v="99"`,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": `"Windows"`,
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
    };

    // 1. OPEN PAGE FIRST
    const warm = await axios.get(PAGE, {
      headers: browserHeaders,
      withCredentials: true,
      validateStatus: () => true
    });

    // GET COOKIES
    const cookies = warm.headers["set-cookie"]
      ? warm.headers["set-cookie"]
          .map(c => c.split(";")[0])
          .join("; ")
      : "";

    // 2. CREATE FORM
    const form = new URLSearchParams();
    form.append("sf_url", instaUrl);
    form.append("sf_submit", "");
    form.append("new", "2");
    form.append("lang", "en");
    form.append("app", "");
    form.append("country", "lk");
    form.append("os", "Windows");
    form.append("browser", "Chrome");
    form.append("channel", "main");

    // 3. SEND REAL FORM REQUEST
    const res = await axios.post(
      `${BASE}/savefrom.php`,
      form.toString(),
      {
        headers: {
          ...browserHeaders,
          "content-type": "application/x-www-form-urlencoded",
          "origin": BASE,
          "referer": PAGE,
          "cookie": cookies,
          "x-requested-with": "XMLHttpRequest"
        },
        maxRedirects: 5,
        validateStatus: () => true
      }
    );

    if (res.status === 403) {
      return response({
        success: false,
        error: "Still blocked by SaveFrom anti-bot protection",
        status: 403
      });
    }

    const html = res.data;
    const $ = cheerio.load(html);

    const title =
      $(".row.title").attr("title") ||
      $(".row.title").text().trim();

    const thumbnail = $("img.thumb").attr("src");

    const downloads = [];

    $("a.link-download").each((i, el) => {
      downloads.push({
        quality: $(el).attr("data-quality"),
        type: $(el).attr("data-type"),
        url: decode($(el).attr("href"))
      });
    });

    return response({
      creator: "THENUX",
      success: true,
      title,
      thumbnail,
      downloads
    });

  } catch (e) {
    return response({
      success: false,
      error: e.message
    });
  }
};

function response(data) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data, null, 2)
  };
}

function decode(str = "") {
  return str.replace(/&amp;/g, "&");
}
