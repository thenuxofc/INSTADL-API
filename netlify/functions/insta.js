const axios = require("axios");

exports.handler = async (event) => {
  const igUrl = event.queryStringParameters?.url;

  if (!igUrl) {
    return send({
      creator: "THENUX",
      success: false,
      error: "Missing Instagram URL"
    });
  }

  try {
    const { data } = await axios.post(
      "https://sssreels.com/api/download",
      {
        url: igUrl
      },
      {
        timeout: 30000,
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          "origin": "https://sssreels.com",
          "referer": "https://sssreels.com/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
          "sec-ch-ua":
            `"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"`,
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": `"Windows"`
        }
      }
    );

    if (!data || data.code !== 200) {
      return send({
        creator: "THENUX",
        success: false,
        error: data?.message || "Failed to fetch reel",
        raw: data
      });
    }

    const BASE = "https://sssreels.com";

    // FULL LINKS
    const videoUrl = data.originalVideoUrl
      ? `${BASE}${data.originalVideoUrl}`
      : null;

    const audioUrl = data.linkMp3
      ? `${BASE}${data.linkMp3}`
      : null;

    const thumbnail = data.coverUrl
      ? `${BASE}${data.coverUrl}`
      : null;

    return send({
      creator: "THENUX",
      success: true,

      source: igUrl,

      title: data.title || "Instagram Reel",

      username: data.authorName || null,

      thumbnail,

      best: videoUrl,

      downloads: [
        videoUrl && {
          type: "mp4",
          quality: "HD",
          label: "Download Video",
          url: videoUrl
        },

        audioUrl && {
          type: "mp3",
          quality: "Audio",
          label: "Download Audio",
          url: audioUrl
        }
      ].filter(Boolean),

      raw: data
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
