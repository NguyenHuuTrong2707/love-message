import express from "express";
import dotenv from "dotenv";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files từ thư mục public (dùng đường dẫn tuyệt đối)
app.use(express.static(path.join(__dirname, "public")));

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

// Lưu tất cả subscriptions trong bộ nhớ (sau này sẽ lưu DB)
let subscriptions = [];

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

  // Kiểm tra subscription hợp lệ
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  // Kiểm tra xem subscription đã tồn tại chưa (dựa vào endpoint)
  const existingIndex = subscriptions.findIndex(
    (sub) => sub.endpoint === subscription.endpoint
  );

  if (existingIndex >= 0) {
    // Cập nhật subscription nếu đã tồn tại
    subscriptions[existingIndex] = subscription;
    console.log(`📝 Updated existing subscription: ${subscription.endpoint}`);
  } else {
    // Thêm subscription mới
    subscriptions.push(subscription);
    console.log(`✅ Added new subscription. Total: ${subscriptions.length}`);
  }

  res.sendStatus(201);
});

// Gửi push test đến TẤT CẢ subscriptions
app.get("/test-push", async (req, res) => {
  if (subscriptions.length === 0) {
    res.status(400).send("Chưa có subscription nào. Hãy bật thông báo trên client trước.");
    return;
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    res
      .status(500)
      .send("VAPID keys chưa cấu hình. Thiết lập VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY trong .env.");
    return;
  }

  // Thêm tag unique để iOS không gộp các notification lại với nhau
  const notificationPayload = {
    title: "💌 Tin nhắn từ anh",
    body: "Anh chỉ muốn thử xem em có nhận được không.",
    tag: `push-${Date.now()}`, // Tag unique cho mỗi lần gửi
  };

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Gửi đến tất cả subscriptions
  const promises = subscriptions.map(async (subscription, index) => {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      );
      results.success++;
      console.log(`✅ Push sent successfully to subscription ${index + 1}`);
    } catch (err) {
      results.failed++;
      const errorMsg = `Subscription ${index + 1}: ${err.message}`;
      results.errors.push(errorMsg);
      console.error(`❌ Error sending to subscription ${index + 1}:`, err);

      // Tự động xóa subscription không hợp lệ (410 Gone, 404 Not Found)
      if (err.statusCode === 410 || err.statusCode === 404) {
        const removeIndex = subscriptions.findIndex(
          (sub) => sub.endpoint === subscription.endpoint
        );
        if (removeIndex >= 0) {
          subscriptions.splice(removeIndex, 1);
          console.log(`🗑️ Removed invalid subscription ${index + 1} (${err.statusCode})`);
        }
      }
    }
  });

  await Promise.all(promises);

  res.json({
    message: `Push sent to ${subscriptions.length} device(s)`,
    results: {
      total: subscriptions.length,
      success: results.success,
      failed: results.failed,
      errors: results.errors,
    },
  });
});

// API: Xem danh sách subscriptions hiện tại (để debug)
app.get("/api/subscriptions", (req, res) => {
  res.json({
    count: subscriptions.length,
    subscriptions: subscriptions.map((sub, index) => ({
      index: index + 1,
      endpoint: sub.endpoint,
      // Không gửi keys về client để bảo mật
    })),
  });
});

// Fallback: mọi route khác trả về index.html
// Đảm bảo GET "/" và các route front-end khác không bị "Cannot GET /"
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Export app cho Vercel sử dụng như 1 Serverless Function
export default app;

// Chỉ listen khi chạy local (không phải môi trường Vercel Serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}
