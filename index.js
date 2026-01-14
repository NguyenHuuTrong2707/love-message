import express from "express";
import dotenv from "dotenv";
import webpush from "web-push";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static("public"));

// --- VAPID CONFIG ---
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:test@example.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn("⚠️ VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY chưa được cấu hình. Push test sẽ không hoạt động.");
}

// Tạm thời lưu subscription cuối cùng trong bộ nhớ
let lastSubscription = null;

// --- ROUTES ---

// Health check
app.get("/health", (req, res) => {
  res.send("OK");
});

// API: Lấy VAPID Public Key cho frontend
app.get("/api/vapid-public-key", (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    res.status(500).json({ error: "VAPID_PUBLIC_KEY chưa được cấu hình" });
    return;
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Nhận subscription từ frontend
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  console.log("SUBSCRIPTION:", JSON.stringify(subscription, null, 2));

  // Lưu tạm vào biến (sau này sẽ lưu DB)
  lastSubscription = subscription;

  res.sendStatus(201);
});

// Gửi push test đến subscription cuối cùng
app.get("/test-push", async (req, res) => {
  if (!lastSubscription) {
    res.status(400).send("Chưa có subscription nào. Hãy bật thông báo trên client trước.");
    return;
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    res
      .status(500)
      .send("VAPID keys chưa cấu hình. Thiết lập VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY trong .env.");
    return;
  }

  try {
    await webpush.sendNotification(
      lastSubscription,
      JSON.stringify({
        title: "💌 Tin nhắn từ anh",
        body: "Anh chỉ muốn thử xem em có nhận được không.",
      })
    );

    res.send("Push sent");
  } catch (err) {
    console.error("Error sending push:", err);
    res.status(500).send("Lỗi khi gửi push");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
