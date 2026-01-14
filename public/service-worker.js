// Basic service worker for handling push notifications
// This file is intentionally simple and independent of backend logic.

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
  };

  event.waitUntil(self.registration.showNotification(title, options));
});


