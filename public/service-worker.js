// Basic service worker for handling push notifications
// This file is intentionally simple and independent of backend logic.

// Install event - skip waiting để activate ngay
self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("Service Worker: Install event");
});

// Activate event - claim clients ngay
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control of all pages immediately
      // Clean up old service workers if needed
    ])
  );
  console.log("Service Worker: Activate event");
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    // Fallback if data is plain text
    data = {
      title: "💌 Tin nhắn từ anh",
      body: event.data.text(),
    };
  }

  const title = data.title || "💌 Tin nhắn từ anh";
  const options = {
    body: data.body || "Anh chỉ muốn chắc rằng em vẫn nhận được những lời yêu thương này.",
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-192.png",
    data: data.data || {},
    // Thêm tag để iOS không gộp notification - mỗi notification có tag unique
    tag: data.tag || `notification-${Date.now()}`,
    // Thêm timestamp để đảm bảo mỗi notification là unique
    timestamp: Date.now(),
    // iOS cần requireInteraction để hiển thị notification ngay cả khi app đang mở
    requireInteraction: false, // Set true nếu muốn notification không tự đóng
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// QUAN TRỌNG: Thêm handler cho notificationclick - iOS cần cái này để notification hoạt động đúng
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Mở app khi click vào notification
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Kiểm tra linh hoạt hơn - tìm client có cùng origin
      const currentOrigin = self.location.origin;
      
      // Nếu đã có window mở, focus vào đó
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Kiểm tra origin thay vì URL chính xác để tương thích với cả iOS và Android
        if (client.url.startsWith(currentOrigin) && "focus" in client) {
          return client.focus();
        }
      }
      // Nếu chưa có window, mở window mới
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    }).catch((error) => {
      // Xử lý lỗi để không làm gián đoạn notification
      console.error("Error handling notification click:", error);
    })
  );
});

