# 🚀 THENUX Instagram Downloader API

🔥 Fast Instagram Reels / Video Downloader API built with Node.js, Axios, Cheerio & Netlify Functions.

Download Instagram Reels videos in HD quality directly using a simple GET API.

---

## ✨ Features

* 📥 Download Instagram Reels
* ⚡ Fast API Response
* 🖼 Fetch Thumbnail
* 🎬 Get Video Quality
* 📄 Returns Clean JSON
* 🌐 Deployable on Netlify
* 🔥 Axios + Cheerio Based
* 🛡 Error Handling Included
* 💻 Beginner Friendly

---

## 📦 Installation

```bash
git clone https://github.com/thenuxofc/instagram-downloader-api.git

cd instagram-downloader-api

npm install
```

---

## 🚀 Run Locally

```bash
npm run dev
```

---

## 🌍 Deploy To Netlify

1. Push project to GitHub
2. Import repository to Netlify
3. Deploy 🚀

---

## 📂 Project Structure

```bash
netlify/
 └── functions/
      └── insta.js

package.json
netlify.toml
```

---

## 🔗 API Endpoint

```bash
/.netlify/functions/insta?url=INSTAGRAM_URL
```

---

## 📌 Example Request

```bash
https://your-site.netlify.app/.netlify/functions/insta?url=https://www.instagram.com/reel/xxxx/
```

---

## ✅ Example Response

```json
{
  "creator": "THENUX",
  "success": true,
  "title": "Instagram Reel",
  "thumbnail": "https://...",
  "best": {
    "quality": "720p",
    "type": "mp4",
    "url": "https://..."
  }
}
```

---

## 🛠 Technologies Used

* Node.js
* Axios
* Cheerio
* Netlify Functions

---

## 👑 Creator

Made with ❤️ by THENUX

🌐 Website: [www.thenuxofc.store](http://www.thenuxofc.store)
📸 Instagram: @thenux_ofc

---

## ⚠ Disclaimer

This project is for educational purposes only.
Please respect Instagram's Terms of Service and content ownership.

---
