import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllSubscriptions, removeSubscription } from '@/lib/subscriptions';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

// Initialize VAPID
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:test@example.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn("⚠️ VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY chưa được cấu hình. Push test sẽ không hoạt động.");
}

export async function GET() {
  const subscriptions = getAllSubscriptions();

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: "Chưa có subscription nào. Hãy bật thông báo trên client trước." },
      { status: 400 }
    );
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "VAPID keys chưa cấu hình. Thiết lập VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY trong .env." },
      { status: 500 }
    );
  }

  const notificationPayload = {
    title: "💌 Tin nhắn từ anh",
    body: "Anh chỉ muốn thử xem em có nhận được không.",
    tag: `push-${Date.now()}`,
  };

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  const promises = subscriptions.map(async (subscription, index) => {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      );
      results.success++;
      console.log(`✅ Push sent successfully to subscription ${index + 1}`);
    } catch (err: any) {
      results.failed++;
      const errorMsg = `Subscription ${index + 1}: ${err.message}`;
      results.errors.push(errorMsg);
      console.error(`❌ Error sending to subscription ${index + 1}:`, err);

      // Tự động xóa subscription không hợp lệ
      if (err.statusCode === 410 || err.statusCode === 404) {
        removeSubscription(subscription.endpoint);
        console.log(`🗑️ Removed invalid subscription ${index + 1} (${err.statusCode})`);
      }
    }
  });

  await Promise.all(promises);

  return NextResponse.json({
    message: `Push sent to ${subscriptions.length} device(s)`,
    results: {
      total: subscriptions.length,
      success: results.success,
      failed: results.failed,
      errors: results.errors,
    },
  });
}

