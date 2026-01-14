// VAPID Public Key sẽ được load từ API
let VAPID_PUBLIC_KEY = null;

// Simple global app state
const state = {
  isIOS: false,
  isStandalone: false,
  permission: typeof Notification !== "undefined" ? Notification.permission : "default",
  memoryMonthFilter: null, // null = all, "1".."12" = month
};

// Screen navigation function
function showScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show selected screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    
    // Scroll to top of the screen
    targetScreen.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL hash for bookmarking (optional)
    if (history.pushState) {
      history.pushState(null, null, `#${screenId}`);
    }
    
    // Render messages if navigating to memory screen
    if (screenId === 'screen-memory') {
      renderMonthFilters();
      renderMessages(state.memoryMonthFilter);
    }
  }
}

// Load VAPID Public Key from backend API
async function loadVAPIDPublicKey() {
  try {
    const response = await fetch("/api/vapid-public-key");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    VAPID_PUBLIC_KEY = data.publicKey;
    console.log("✅ VAPID Public Key loaded");
  } catch (error) {
    console.error("❌ Failed to load VAPID Public Key:", error);
    console.warn("⚠️ Push notifications will not work until VAPID keys are configured");
  }
}

// Handle enable push notification (user-initiated)
async function handleEnablePush() {
  try {
    // Check browser support
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Trình duyệt của bạn không hỗ trợ thông báo đẩy.");
      return;
    }

    // Check if VAPID key is loaded
    if (!VAPID_PUBLIC_KEY) {
      alert("Hệ thống đang khởi động, vui lòng thử lại sau vài giây.");
      // Try to load key again
      await loadVAPIDPublicKey();
      if (!VAPID_PUBLIC_KEY) {
        alert("Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.");
        return;
      }
    }

    // Request permission (must be from user gesture)
    const permission = await Notification.requestPermission();
    state.permission = permission;

    if (permission !== "granted") {
      alert("Không thể gửi tin nếu em chưa bật thông báo 💔");
      return;
    }

    // Service worker must be ready
    const reg = await navigator.serviceWorker.ready;

    // Convert base64 VAPID key to Uint8Array
    const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // Create push subscription
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    });

    // Send subscription to backend
    await fetch("/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });

    // UX: chuyển sang màn hình connected + thông báo nhẹ
    showScreen("screen-connected");
    try {
      alert("💖 Anh sẽ nhắn cho em mỗi ngày nhé");
    } catch {
      // ignore alert errors (some environments block)
    }
  } catch (error) {
    console.error("Error enabling push:", error);
    alert("Có lỗi xảy ra khi bật thông báo. Em thử lại sau nhé.");
  }
}

// Smart navigation from Home button:
// - Nếu đã bật thông báo -> vào thẳng screen-connected
// - Nếu chưa -> đi qua screen-enable để xin quyền
// (guide iOS giờ hiển thị inline trên Home, không còn màn hình riêng)
function goToNotificationsFlow() {
  // Điều hướng theo trạng thái permission
  const currentPermission =
    state.permission ||
    (typeof Notification !== "undefined" ? Notification.permission : "default");

  if (currentPermission === "granted") {
    showScreen("screen-connected");
  } else {
    showScreen("screen-enable");
  }
}

// Handle browser back button
window.addEventListener('popstate', (event) => {
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    showScreen(hash);
  } else {
    showScreen('screen-home');
  }
});

// Initialize - show home screen by default or restore from hash
document.addEventListener('DOMContentLoaded', () => {
  // STEP 4 – Detect platform & PWA state
  state.isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  state.isStandalone =
    window.matchMedia &&
    window.matchMedia('(display-mode: standalone)').matches;
  if (typeof Notification !== "undefined") {
    state.permission = Notification.permission;
  }

  // Inline iOS/Safari guide on Home: chỉ hiện khi chạy trên Safari (đặc biệt iOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const safariGuideEl = document.getElementById("safari-guide-inline");
  if (safariGuideEl) {
    if (isSafari && !state.isStandalone) {
      safariGuideEl.style.display = "block";
    } else {
      safariGuideEl.style.display = "none";
    }
  }

  // Check if there's a hash in URL
  const hash = window.location.hash.replace('#', '');
  const validScreens = ['screen-home', 'screen-enable', 'screen-connected', 'screen-memory'];
  
  if (hash && validScreens.includes(hash)) {
    showScreen(hash);
  } else {
    showScreen('screen-home');
  }

  // Start countdown on Home screen (22 months from now)
  initHomeCountdown(22);

  // Load VAPID Public Key from backend
  loadVAPIDPublicKey().catch((err) => {
    console.error("Failed to load VAPID key:", err);
  });

  // Register service worker for push notifications
  registerServiceWorker().catch((err) => {
    console.error("Failed to register service worker:", err);
  });

  // Ensure \"Tin nhắn hôm nay\" card navigates to Memory Vault
  const todayMessageCard = document.getElementById('today-message-card');
  if (todayMessageCard) {
    todayMessageCard.addEventListener('click', () => {
      showScreen('screen-memory');
    });
  }
  
  // Prevent zoom on double tap (mobile)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    // Small delay to let browser adjust
    setTimeout(() => {
      const activeScreen = document.querySelector('.screen.active');
      if (activeScreen) {
        activeScreen.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 100);
  });
  
  // Handle resize for responsive adjustments
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Adjust any layout if needed
      const activeScreen = document.querySelector('.screen.active');
      if (activeScreen) {
        // Force reflow if needed
        activeScreen.offsetHeight;
      }
    }, 250);
  });
});

// SERVICE WORKER REGISTRATION
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/service-worker.js");
    // console.log("Service worker registered");
  } catch (err) {
    console.error("Service worker registration failed:", err);
  }
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function addMonths(date, monthsToAdd) {
  // Create a target date "monthsToAdd" months from "date"
  // Handles month overflow by letting JS normalize dates.
  const d = new Date(date);
  const target = new Date(d);
  target.setMonth(d.getMonth() + monthsToAdd);
  return target;
}

function initHomeCountdown(monthsToCountDown = 22) {
  const elDays = document.getElementById('countdown-days');
  const elHours = document.getElementById('countdown-hours');
  const elMinutes = document.getElementById('countdown-minutes');
  if (!elDays || !elHours || !elMinutes) return;

  const start = new Date();
  const target = addMonths(start, monthsToCountDown);

  const tick = () => {
    const now = new Date();
    let diffMs = target.getTime() - now.getTime();
    if (diffMs < 0) diffMs = 0;

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    elDays.textContent = String(days);
    elHours.textContent = pad2(hours);
    elMinutes.textContent = pad2(minutes);
  };

  tick();
  // update every second for smoothness (minutes change is enough, but this keeps it fresh)
  window.setInterval(tick, 1000);
}

// Helper: VAPID key conversion
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Render messages from mockData
function renderMessages(monthFilter = null) {
  const container = document.getElementById('messages-container');
  if (!container || typeof mockMessages === 'undefined') {
    console.warn('Messages container or mockData not found');
    return;
  }
  
  // Get messages to display
  let messagesToRender = monthFilter !== null
    ? getMessagesByMonth(String(monthFilter))
    : mockMessages;
  
  // Clear container
  container.innerHTML = '';
  
  if (messagesToRender.length === 0) {
    container.innerHTML = `
      <div class="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
        <span class="material-symbols-outlined text-primary text-3xl">inbox</span>
        <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">Chưa có tin nhắn tháng này</p>
      </div>
    `;
    return;
  }
  
  // Render each message
  messagesToRender.forEach((message) => {
    const bgColor = message.bgColor === 'pink' 
      ? 'bg-[#F5E0E3] dark:bg-white/10' 
      : 'bg-[#F0EFE9] dark:bg-white/5';
    
    const dividerColor = message.bgColor === 'pink'
      ? 'bg-[#dcbabf]/30 dark:bg-white/10'
      : 'bg-[#d1d0c8]/40 dark:bg-white/10';
    
    const favoriteIcon = message.isFavorite
      ? '<span class="material-symbols-outlined text-[20px]">favorite</span>'
      : '<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: \'FILL\' 0;">favorite</span>';
    
    const favoriteColor = message.isFavorite
      ? 'text-primary'
      : 'text-gray-400 dark:text-gray-500';
    
    const messageCard = document.createElement('div');
    messageCard.className = `group relative flex flex-col gap-3 p-6 rounded-[24px] ${bgColor} border border-white/40 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1`;
    messageCard.setAttribute('data-message-id', message.id);
    
    messageCard.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-black/30 backdrop-blur-md">
          <span class="material-symbols-outlined text-[14px] text-gray-600 dark:text-gray-300">calendar_today</span>
          <span class="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wide">${message.date}</span>
        </div>
        <div class="size-8 flex items-center justify-center rounded-full bg-white/40 dark:bg-white/10 ${favoriteColor}">
          ${favoriteIcon}
        </div>
      </div>
      <div class="mt-1">
        <h3 class="text-lg font-bold text-[#2d2527] dark:text-white mb-1.5">${message.title}</h3>
        <p class="text-[#5d4a4d] dark:text-gray-300 text-[15px] leading-relaxed line-clamp-3">
          ${message.content}
        </p>
      </div>
      <div class="w-full h-px ${dividerColor} mt-2"></div>
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-[#83676c] dark:text-gray-400">${message.time}</span>
        <span class="material-symbols-outlined text-[#83676c] dark:text-gray-400 group-hover:translate-y-1 transition-transform">keyboard_arrow_down</span>
      </div>
    `;
    
    // Add click handler to show full message (optional - can be expanded later)
    messageCard.addEventListener('click', () => {
      // For now, just log. Can be expanded to show modal with fullContent
      console.log('Message clicked:', message);
      // Future: showMessageDetail(message);
    });
    
    container.appendChild(messageCard);
  });
  
  // Add decorative end of list
  const endMarker = document.createElement('div');
  endMarker.className = 'py-8 flex flex-col items-center justify-center gap-2 opacity-50';
  endMarker.innerHTML = `
    <span class="material-symbols-outlined text-primary text-3xl animate-bounce">volunteer_activism</span>
    <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">Hết kỷ niệm tháng này</p>
  `;
  container.appendChild(endMarker);
}

// Render month filters dynamically: "Tất cả" + Tháng 1..12
function renderMonthFilters() {
  const host = document.getElementById('month-filters');
  if (!host) return;

  // Avoid re-render if already rendered
  if (host.dataset.rendered === '1') return;
  host.dataset.rendered = '1';

  const makeBtn = ({ label, month }) => {
    const btn = document.createElement('button');
    btn.className =
      'flex shrink-0 items-center justify-center h-10 px-5 rounded-xl bg-white dark:bg-white/5 border border-[#e8e6e6] dark:border-white/10 text-[#5c5c5c] dark:text-gray-300 transition-colors transform active:scale-95';
    btn.innerHTML = `<span class="text-sm font-bold">${label}</span>`;
    btn.addEventListener('click', () => filterMessagesByMonth(month));
    btn.dataset.month = month === null ? '' : String(month);
    return btn;
  };

  host.innerHTML = '';
  host.appendChild(makeBtn({ label: 'Tất cả', month: null }));
  for (let m = 1; m <= 12; m++) {
    host.appendChild(makeBtn({ label: `Tháng ${m}`, month: String(m) }));
  }

  updateActiveMonthButton(state.memoryMonthFilter);
}

function updateActiveMonthButton(month) {
  const buttons = document.querySelectorAll('#month-filters button');
  buttons.forEach((btn) => {
    // trạng thái không active: giống thiết kế cũ trong index.html
    btn.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
    btn.classList.add(
      'bg-white',
      'dark:bg-white/5',
      'border',
      'border-[#e8e6e6]',
      'dark:border-white/10',
      'text-[#5c5c5c]',
      'dark:text-gray-300'
    );
  });

  const key = month === null ? '' : String(month);
  const active = Array.from(buttons).find((b) => (b.dataset.month ?? '') === key);
  if (active) {
    // trạng thái active: nền primary, chữ trắng, bóng nhẹ
    active.classList.remove(
      'bg-white',
      'dark:bg-white/5',
      'border',
      'border-[#e8e6e6]',
      'dark:border-white/10',
      'text-[#5c5c5c]',
      'dark:text-gray-300'
    );
    active.classList.add('bg-primary', 'text-white');
  }
}

// Filter messages by month
function filterMessagesByMonth(month) {
  state.memoryMonthFilter = month;
  updateActiveMonthButton(month);
  renderMessages(month);
}

// Scroll to top of memory vault list
function scrollToTopMemory() {
  const el = document.getElementById('memory-scroll');
  if (el) {
    el.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Utility function to detect if device is mobile
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Utility function to detect if device is iOS
function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showScreen, handleEnablePush, isMobileDevice, isIOSDevice };
}

