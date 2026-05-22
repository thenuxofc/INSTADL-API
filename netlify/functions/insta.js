const axios = require("axios");

exports.handler = async (event) => {
  const igUrl = event.queryStringParameters?.url;

  if (!igUrl) {
    return send({
      creator: "THENUX",
      success: false,
      error: "Missing url"
    });
  }

  try {
    const { data } = await axios.post(
      "https://sssreels.com/api/download",
      { url: igUrl },
      {
        timeout: 30000,
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
          origin: "https://sssreels.com",
          referer: "https://sssreels.com/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/148 Safari/537.36"
        }
      }
    );

    if (!data || data.code !== 200) {
      return send({
        creator: "THENUX",
        success: false,
        error: data?.message || "Download failed",
        raw: data
      });
    }

    const videoUrl = data.video || data.url || data.download || data.medias?.[0]?.url;
    const audioUrl = data.audio || data.mp3 || data.medias?.find(x => x.type === "mp3")?.url;
    const thumbnail = data.thumbnail || data.thumb || data.image || data.cover;

    return send({
      creator: "THENUX",
      success: true,
      source: igUrl,
      title: data.title || "Instagram Reel",
      username: data.username || data.author || null,
      thumbnail,
      best: videoUrl
        ? {
            type: "mp4",
            url: videoUrl
          }
        : null,
      downloads: [
        videoUrl && {
          type: "mp4",
          label: "Download Video MP4",
          url: videoUrl
        },
        audioUrl && {
          type: "mp3",
          label: "Download Audio MP3",
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
