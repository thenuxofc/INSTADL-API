const axios = require("axios");
const cheerio = require("cheerio");

exports.handler = async (event) => {
  const igUrl = event.queryStringParameters?.url;

  if (!igUrl) {
    return send({
      creator: "THENUX",
      success: false,
      error: "Missing url. Use ?url=INSTAGRAM_URL"
    });
  }

  try {
    const { data } = await axios.post(
      "https://sssreels.com/api/download",
      { url: igUrl },
      {
        timeout: 30000,
        headers: {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/json",
          "origin": "https://sssreels.com",
          "referer": "https://sssreels.com/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
          "sec-ch-ua": `"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"`,
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": `"Windows"`
        }
      }
    );

    const html = typeof data === "string" ? data : data?.html || JSON.stringify(data);
    const $ = cheerio.load(html);

    const username = $("h2").first().text().trim() || null;
    const caption = $("b").first().text().trim() || null;

    const thumbnailPath =
      $("img.result_author").attr("src") ||
      $(".result_overlay").css("background-image")?.match(/url\(["']?(.*?)["']?\)/)?.[1];

    const downloads = [];

    $("a.download_link").each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      if (!href) return;

      const fullUrl = absolute(href);

      downloads.push({
        label: text,
        type: text.toLowerCase().includes("mp3") ? "mp3" : "mp4",
        proxy_url: fullUrl,
        direct_url: decodeCdn(fullUrl)
      });
    });

    if (!downloads.length) {
      return send({
        creator: "THENUX",
        success: false,
        error: "No download links found",
        raw: html.slice(0, 500)
      });
    }

    return send({
      creator: "THENUX",
      success: true,
      source: igUrl,
      username,
      caption,
      thumbnail: thumbnailPath ? absolute(thumbnailPath) : null,
      thumbnail_direct: thumbnailPath ? decodeCdn(absolute(thumbnailPath)) : null,
      best: downloads.find(x => x.type === "mp4") || downloads[0],
      downloads
    });

  } catch (e) {
    return send({
      creator: "THENUX",
      success: false,
      error: e.message
    });
  }
};

function send(data) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data, null, 2)
  };
}

function absolute(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://sssreels.com${url.startsWith("/") ? "" : "/"}${url}`;
}

function decodeCdn(url) {
  try {
    const u = new URL(url);
    const encoded = u.searchParams.get("url");
    if (!encoded) return url;

    return Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return url;
  }
}
