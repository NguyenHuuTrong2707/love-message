'use client'

import { useEffect, useState, useRef } from 'react'
import { mockMessages, getMessagesByMonth, type Message } from '@/data/mockData'
import { urlBase64ToUint8Array, pad2, addMonths } from '@/lib/utils'

// VAPID Public Key sẽ được load từ API
let VAPID_PUBLIC_KEY: string | null = null

interface AppState {
  isIOS: boolean
  isStandalone: boolean
  permission: NotificationPermission
  memoryMonthFilter: string | null
  currentScreen: string
}

export default function Home() {
  const [state, setState] = useState<AppState>({
    isIOS: false,
    isStandalone: false,
    permission: typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default',
    memoryMonthFilter: null,
    currentScreen: 'screen-home',
  })

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 })
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load VAPID Public Key
  useEffect(() => {
    loadVAPIDPublicKey()
  }, [])

  // Initialize app state
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
    const permission = 'Notification' in window ? Notification.permission : 'default'

    setState(prev => ({
      ...prev,
      isIOS,
      isStandalone,
      permission,
    }))

    // Check Safari guide visibility
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const safariGuideEl = document.getElementById('safari-guide-inline')
    if (safariGuideEl) {
      safariGuideEl.style.display = isSafari && !isStandalone ? 'block' : 'none'
    }

    // Initialize countdown
    initHomeCountdown(22)

    // Register service worker
    registerServiceWorker()

    // Handle browser back button
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '')
      const validScreens = ['screen-home', 'screen-enable', 'screen-connected', 'screen-memory']
      if (hash && validScreens.includes(hash)) {
        showScreen(hash)
      } else {
        showScreen('screen-home')
      }
    }

    window.addEventListener('popstate', handlePopState)

    // Check URL hash on mount
    const hash = window.location.hash.replace('#', '')
    const validScreens = ['screen-home', 'screen-enable', 'screen-connected', 'screen-memory']
    if (hash && validScreens.includes(hash)) {
      showScreen(hash)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  async function loadVAPIDPublicKey() {
    try {
      const response = await fetch('/api/vapid-public-key')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      VAPID_PUBLIC_KEY = data.publicKey
      console.log('✅ VAPID Public Key loaded')
    } catch (error) {
      console.error('❌ Failed to load VAPID Public Key:', error)
    }
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      })
      console.log('✅ Service Worker registered:', registration.scope)
      
      // Đảm bảo service worker đã activated
      if (registration.installing) {
        console.log('Service Worker installing...')
      } else if (registration.waiting) {
        console.log('Service Worker waiting...')
        // Force activate nếu đang waiting
        await registration.update()
      } else if (registration.active) {
        console.log('Service Worker active')
      }
    } catch (err) {
      console.error('❌ Service worker registration failed:', err)
    }
  }

  function showScreen(screenId: string) {
    const screens = document.querySelectorAll('.screen')
    screens.forEach(screen => screen.classList.remove('active'))
    
    const targetScreen = document.getElementById(screenId)
    if (targetScreen) {
      targetScreen.classList.add('active')
      targetScreen.scrollTo({ top: 0, behavior: 'smooth' })
      
      if (history.pushState) {
        history.pushState(null, '', `#${screenId}`)
      }

      setState(prev => ({ ...prev, currentScreen: screenId }))

      if (screenId === 'screen-memory') {
        renderMonthFilters()
        renderMessages(state.memoryMonthFilter)
      }
    }
  }

  function initHomeCountdown(monthsToCountDown: number) {
    const start = new Date()
    const target = addMonths(start, monthsToCountDown)

    const tick = () => {
      const now = new Date()
      let diffMs = target.getTime() - now.getTime()
      if (diffMs < 0) diffMs = 0

      const totalMinutes = Math.floor(diffMs / (1000 * 60))
      const days = Math.floor(totalMinutes / (60 * 24))
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
      const minutes = totalMinutes % 60

      setCountdown({ days, hours, minutes })
    }

    tick()
    countdownIntervalRef.current = setInterval(tick, 1000)
  }

  async function handleEnablePush() {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        alert('Trình duyệt của bạn không hỗ trợ thông báo đẩy.')
        return
      }

      if (!VAPID_PUBLIC_KEY) {
        alert('Hệ thống đang khởi động, vui lòng thử lại sau vài giây.')
        await loadVAPIDPublicKey()
        if (!VAPID_PUBLIC_KEY) {
          alert('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.')
          return
        }
      }

      const permission = await Notification.requestPermission()
      setState(prev => ({ ...prev, permission }))

      if (permission !== 'granted') {
        alert('Không thể gửi tin nếu em chưa bật thông báo 💔')
        return
      }

      // Đảm bảo service worker đã ready
      let reg = await navigator.serviceWorker.ready
      
      // Nếu service worker chưa ready, đợi thêm một chút (iOS cần thời gian)
      if (!reg.active) {
        console.log('Waiting for service worker to activate...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        reg = await navigator.serviceWorker.ready
      }
      
      const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey as any,
      })
      
      console.log('✅ Push subscription created:', sub.endpoint)    

      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })

      showScreen('screen-connected')
      try {
        alert('💖 Anh sẽ nhắn cho em mỗi ngày nhé')
      } catch {
        // ignore alert errors
      }
    } catch (error) {
      console.error('Error enabling push:', error)
      alert('Có lỗi xảy ra khi bật thông báo. Em thử lại sau nhé.')
    }
  }

  function goToNotificationsFlow() {
    const currentPermission = state.permission || 
      (typeof window !== 'undefined' && 'Notification' in window 
        ? Notification.permission 
        : 'default')

    if (currentPermission === 'granted') {
      showScreen('screen-connected')
    } else {
      showScreen('screen-enable')
    }
  }

  function renderMessages(monthFilter: string | null = null) {
    const container = document.getElementById('messages-container')
    if (!container) return

    let messagesToRender = monthFilter !== null
      ? getMessagesByMonth(String(monthFilter))
      : mockMessages

    container.innerHTML = ''

    if (messagesToRender.length === 0) {
      container.innerHTML = `
        <div class="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
          <span class="material-symbols-outlined text-primary text-3xl">inbox</span>
          <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">Chưa có tin nhắn tháng này</p>
        </div>
      `
      return
    }

    messagesToRender.forEach((message) => {
      const bgColor = message.bgColor === 'pink' 
        ? 'bg-[#F5E0E3] dark:bg-white/10' 
        : 'bg-[#F0EFE9] dark:bg-white/5'
      
      const dividerColor = message.bgColor === 'pink'
        ? 'bg-[#dcbabf]/30 dark:bg-white/10'
        : 'bg-[#d1d0c8]/40 dark:bg-white/10'
      
      const favoriteIcon = message.isFavorite
        ? '<span class="material-symbols-outlined text-[20px]">favorite</span>'
        : '<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: \'FILL\' 0;">favorite</span>'
      
      const favoriteColor = message.isFavorite
        ? 'text-primary'
        : 'text-gray-400 dark:text-gray-500'
      
      const messageCard = document.createElement('div')
      messageCard.className = `group relative flex flex-col gap-3 p-6 rounded-[24px] ${bgColor} border border-white/40 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1`
      messageCard.setAttribute('data-message-id', String(message.id))
      
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
      `
      
      messageCard.addEventListener('click', () => {
        console.log('Message clicked:', message)
      })
      
      container.appendChild(messageCard)
    })

    const endMarker = document.createElement('div')
    endMarker.className = 'py-8 flex flex-col items-center justify-center gap-2 opacity-50'
    endMarker.innerHTML = `
      <span class="material-symbols-outlined text-primary text-3xl animate-bounce">volunteer_activism</span>
      <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">Hết kỷ niệm tháng này</p>
    `
    container.appendChild(endMarker)
  }

  function renderMonthFilters() {
    const host = document.getElementById('month-filters')
    if (!host) return

    if (host.dataset.rendered === '1') return
    host.dataset.rendered = '1'

    const makeBtn = ({ label, month }: { label: string; month: string | null }) => {
      const btn = document.createElement('button')
      btn.className = 'flex shrink-0 items-center justify-center h-10 px-5 rounded-xl bg-white dark:bg-white/5 border border-[#e8e6e6] dark:border-white/10 text-[#5c5c5c] dark:text-gray-300 transition-colors transform active:scale-95'
      btn.innerHTML = `<span class="text-sm font-bold">${label}</span>`
      btn.addEventListener('click', () => filterMessagesByMonth(month))
      btn.dataset.month = month === null ? '' : String(month)
      return btn
    }

    host.innerHTML = ''
    host.appendChild(makeBtn({ label: 'Tất cả', month: null }))
    for (let m = 1; m <= 12; m++) {
      host.appendChild(makeBtn({ label: `Tháng ${m}`, month: String(m) }))
    }

    updateActiveMonthButton(state.memoryMonthFilter)
  }

  function updateActiveMonthButton(month: string | null) {
    const buttons = document.querySelectorAll('#month-filters button')
    buttons.forEach((btn) => {
      btn.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30')
      btn.classList.add('bg-white', 'dark:bg-white/5', 'border', 'border-[#e8e6e6]', 'dark:border-white/10', 'text-[#5c5c5c]', 'dark:text-gray-300')
    })

    const key = month === null ? '' : String(month)
    const active = Array.from(buttons).find((b) => (b as HTMLElement).dataset.month === key)
    if (active) {
      active.classList.remove('bg-white', 'dark:bg-white/5', 'border', 'border-[#e8e6e6]', 'dark:border-white/10', 'text-[#5c5c5c]', 'dark:text-gray-300')
      active.classList.add('bg-primary', 'text-white')
    }
  }

  function filterMessagesByMonth(month: string | null) {
    setState(prev => ({ ...prev, memoryMonthFilter: month }))
    updateActiveMonthButton(month)
    renderMessages(month)
  }

  function scrollToTopMemory() {
    const el = document.getElementById('memory-scroll')
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Render JSX - tiếp tục ở phần tiếp theo do giới hạn độ dài
  return (
    <>
      {/* SCREEN 1: HOME */}
      <section id="screen-home" className="screen active">
        <div className="relative flex h-full min-h-screen w-full flex-col justify-center items-center py-4 sm:py-8 px-4">
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFD1DC]/30 rounded-full blur-[120px]"></div>
          </div>
          <div className="relative z-10 flex flex-col w-full max-w-[420px] h-[850px] max-h-[90vh] bg-background-light dark:bg-background-dark rounded-[40px] sm:rounded-[40px] shadow-2xl border-[8px] border-white/40 dark:border-white/5 overflow-hidden ring-1 ring-black/5">
            <header className="flex items-center justify-between px-6 pt-8 pb-4">
              <div className="flex items-center justify-center gap-x-2 rounded-full bg-primary/10 pl-3 pr-4 py-1.5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                <p className="text-warm-gray dark:text-white text-sm font-bold leading-normal">Ngày thứ 45</p>
              </div>
              <button className="flex items-center justify-center size-10 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-warm-gray dark:text-white">
                <span className="material-symbols-outlined text-[24px]">settings</span>
              </button>
            </header>
            <main className="flex-1 flex flex-col items-center px-6 overflow-y-auto no-scrollbar">
              <div className="h-4 shrink-0"></div>
              <div className="@container w-full aspect-[4/5] max-h-[380px] rounded-[32px] overflow-hidden relative group mb-8 shadow-soft">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent mix-blend-overlay z-10 pointer-events-none"></div>
                <div 
                  className="w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVru9xiFjmnm07R-h9Fx2cB2poeLE1PZ2BbjZP5d-e5mFzOliZ2qKDEvuneS1bU2jZl6wP_hJsjCFaqPf88PLnWRxekx4am0yQwAYvd7CONzgbw2evATqwnGlJMbH17nuHoUDsLS_EUt32D3am2kG4uKotTHgm0bcNrfsy16LLH6oIyICZTSn04bLJa6HYHLY8QSkAu6EnIKWfwD24TMozhJ_4cBoltnWTCifHr-AkZNr0kFDaHleKClvRtENdebptTYMMTq_KieAO")' }}
                ></div>
                <div className="absolute bottom-4 right-4 z-20 bg-white/90 dark:bg-black/60 backdrop-blur-md p-3 rounded-full shadow-lg">
                  <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
                </div>
              </div>
              <div className="flex flex-col items-center w-full max-w-[320px] text-center gap-3">
                <h1 className="text-warm-gray dark:text-white text-[32px] font-bold leading-[1.1] tracking-tight">
                  Tin nhắn từ anh
                </h1>
                <p className="text-[#8A8185] dark:text-[#dcd1d5] text-base font-normal leading-relaxed px-2">
                  Mỗi ngày xa nhau là một ngày gần hơn lúc gặp lại
                </p>
              </div>
            </main>
            <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark w-full z-20">
              <div className="w-full mb-5 bg-soft-pink/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/50 dark:border-white/5 shadow-sm">
                <div className="flex flex-col items-center">
                  <p className="text-warm-gray/70 dark:text-white/70 text-xs font-bold tracking-widest uppercase mb-2">Đếm ngược ngày anh về</p>
                  <div className="flex items-baseline gap-4">
                    <div className="flex flex-col items-center min-w-[3.5rem]">
                      <span className="text-3xl font-black text-primary tabular-nums leading-none">{countdown.days}</span>
                      <span className="text-[10px] text-warm-gray/50 dark:text-white/40 font-bold uppercase tracking-wide mt-1">Ngày</span>
                    </div>
                    <span className="text-primary/30 text-xl font-light self-center pb-4">:</span>
                    <div className="flex flex-col items-center min-w-[3.5rem]">
                      <span className="text-3xl font-black text-primary tabular-nums leading-none">{pad2(countdown.hours)}</span>
                      <span className="text-[10px] text-warm-gray/50 dark:text-white/40 font-bold uppercase tracking-wide mt-1">Giờ</span>
                    </div>
                    <span className="text-primary/30 text-xl font-light self-center pb-4">:</span>
                    <div className="flex flex-col items-center min-w-[3.5rem]">
                      <span className="text-3xl font-black text-primary tabular-nums leading-none">{pad2(countdown.minutes)}</span>
                      <span className="text-[10px] text-warm-gray/50 dark:text-white/40 font-bold uppercase tracking-wide mt-1">Phút</span>
                    </div>
                  </div>
                </div>
              </div>
              <div id="safari-guide-inline" className="w-full mb-4 bg-white/90 dark:bg-background-dark/80 border border-primary/20 rounded-2xl p-4 shadow-soft" style={{ display: 'none' }}>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">ios_share</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-main dark:text-white mb-1">Để nhận được tin mỗi ngày trên iPhone</p>
                    <ol className="text-xs text-text-muted dark:text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Chạm vào nút <strong>Chia sẻ</strong> ở thanh dưới Safari</li>
                      <li>Chọn <strong>&quot;Thêm vào MH chính&quot;</strong></li>
                      <li>Mở app từ icon vừa thêm rồi bấm <strong>&quot;Nhận tin nhắn&quot;</strong> để bật thông báo</li>
                    </ol>
                  </div>
                </div>
              </div>
              <button 
                onClick={goToNotificationsFlow}
                className="relative w-full overflow-hidden rounded-full h-[64px] bg-primary text-white shadow-lg shadow-primary/40 transition-all hover:shadow-primary/60 hover:-translate-y-0.5 active:scale-[0.98] group"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-center gap-3 w-full h-full">
                  <span className="text-lg font-bold tracking-wide">Nhận tin nhắn</span>
                  <span className="material-symbols-outlined text-[22px] animate-pulse">volunteer_activism</span>
                </div>
              </button>
              <div className="mt-5 flex items-center justify-center gap-2 opacity-60">
                <span className="material-symbols-outlined text-warm-gray dark:text-white text-[16px]">add_to_home_screen</span>
                <p className="text-warm-gray dark:text-white text-xs font-medium text-center">
                  Thêm vào màn hình chính để nhận tin mỗi ngày
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCREEN 2: ENABLE PUSH */}
      <section id="screen-enable" className="screen">
        <div className="relative flex min-h-screen w-full flex-col justify-center items-center p-4 sm:p-8">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#FDFBF8] to-[#FBEDEF] dark:from-[#312b2e] dark:to-[#1a1618] opacity-90"></div>
          <div className="absolute inset-0 z-0 opacity-30 bg-pattern pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-[420px] bg-card-light dark:bg-card-dark rounded-2xl shadow-soft dark:shadow-none flex flex-col overflow-hidden border border-[#f4f1f1] dark:border-[#4a3f43] transform transition-all">
            <header className="flex items-center justify-between px-6 py-5 border-b border-[#f4f1f1] dark:border-[#4a3f43] bg-white/50 dark:bg-black/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => showScreen('screen-home')} className="text-text-main dark:text-white/80 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold text-text-main dark:text-white tracking-tight">Cài đặt thông báo</h2>
              </div>
              <button className="text-text-main dark:text-white/80 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">more_horiz</span>
              </button>
            </header>
            <div className="flex flex-col items-center px-8 pt-10 pb-10 text-center">
              <div className="relative mb-8 group">
                <div className="w-32 h-32 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-primary/20 scale-110"></div>
                  <div className="absolute inset-0 rounded-full border border-primary/10 scale-125"></div>
                  <span className="material-symbols-outlined text-[64px] text-primary dark:text-primary-hover drop-shadow-sm rotate-[-10deg]">notifications</span>
                </div>
                <div className="absolute top-2 right-2 bg-white dark:bg-card-dark p-1.5 rounded-full shadow-md border border-primary/10">
                  <span className="material-symbols-outlined text-[24px] text-[#ff6b6b] fill-current">favorite</span>
                </div>
              </div>
              <div className="space-y-4 mb-10">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  Đừng bỏ lỡ <br/> <span className="text-primary">lời yêu thương</span>
                </h1>
                <p className="text-text-sub dark:text-gray-300 text-base font-medium leading-relaxed max-w-[300px] mx-auto">
                  Anh đã chuẩn bị rất nhiều lời yêu thương, hãy bật thông báo để nhận mỗi ngày nhé.
                </p>
              </div>
              <button 
                onClick={handleEnablePush}
                className="group relative w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white font-bold text-lg h-14 rounded-full shadow-glow transition-all active:scale-[0.98]"
              >
                <span>Bật thông báo</span>
                <span className="material-symbols-outlined text-xl animate-none group-hover:animate-bounce">notifications_active</span>
              </button>
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="h-px w-12 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                <p className="text-[#83676c] dark:text-gray-400 text-xs font-medium">
                  Bạn có thể tắt bất cứ lúc nào trong cài đặt
                </p>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>
          </div>
        </div>
      </section>

      {/* SCREEN 3: CONNECTED */}
      <section id="screen-connected" className="screen">
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main h-screen w-full overflow-hidden flex items-center justify-center relative">
          <div className="absolute inset-0 z-0 bg-romantic-gradient dark:bg-none dark:bg-background-dark">
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 w-full max-w-[420px] h-full max-h-[90vh] flex flex-col bg-white/80 dark:bg-[#3d3639] backdrop-blur-md rounded-2xl shadow-soft border border-white/50 dark:border-white/5 overflow-hidden mx-4">
            <div className="relative h-64 w-full shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 dark:to-[#3d3639] z-10"></div>
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCqmhoRVdY1XawyRpHJ4Oe9rfcsydMH-VviTG7j28d732RPR5NfXfxRmXSgiVL3ESSZX53lufRarlfCW302yRfRjTCV4JlQGBWuNeboNcQ7Wzj6-T_slvY4hEiJGdNOpZylZWAqUrBUMKOdDqz8ZxJujMeNhiC6A78nj1pH51OvHI4IFRhHYvnAfWvq3pQHEZBgFcu1Mx_SGt6bqA66M-aoweOG8akXPbfBLD_HXYXFSZaMXP8An9zLhn07RjHnHindx8SdJe_RXYYe")' }}
              ></div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white dark:bg-[#4a4245] p-2 rounded-full shadow-lg animate-breathe">
                  <div className="bg-primary/10 rounded-full p-4 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-5xl fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pt-12 pb-6 flex flex-col items-center text-center">
              <div className="space-y-2 mb-8 animate-fade-in-up">
                <h1 className="text-2xl font-bold text-[#171213] dark:text-white leading-tight">
                  Đã kết nối trái tim!
                </h1>
                <p className="text-text-sub text-sm font-medium px-4">
                  Mọi thứ đã sẵn sàng. Tin nhắn sẽ đến bên bạn vào <span className="text-primary font-bold">08:00</span> mỗi sáng.
                </p>
              </div>
              <div className="w-full bg-[#f8f5f5] dark:bg-white/5 rounded-2xl p-5 mb-6 border border-white dark:border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-text-sub text-lg">calendar_month</span>
                    <span className="text-sm font-semibold text-text-main dark:text-gray-200">Hành trình yêu xa</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">7%</span>
                </div>
                <div className="w-full h-3 bg-white dark:bg-white/10 rounded-full overflow-hidden shadow-inner-glow mb-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: '7%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-text-sub">
                  <span>Đã gửi: 12</span>
                  <span>Tổng: 180 ngày</span>
                </div>
              </div>
              <div 
                id="today-message-card"
                onClick={() => showScreen('screen-memory')}
                className="w-full relative group cursor-pointer mb-6"
              >
                <div className="absolute top-2 left-2 w-full h-full bg-primary/20 rounded-2xl -z-10 rotate-2 transition-transform group-hover:rotate-3"></div>
                <div className="bg-white dark:bg-[#453e41] border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4 text-left transition-transform group-hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-text-main dark:text-white truncate">Tin nhắn hôm nay</h3>
                      <span className="text-[10px] text-text-sub bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">Mới</span>
                    </div>
                    <p className="text-xs text-text-sub truncate dark:text-gray-400">Nhấn để mở thư từ anh...</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-2 bg-white/50 dark:bg-transparent shrink-0">
              <button 
                onClick={() => showScreen('screen-home')}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <span>Về màn hình chính</span>
                <span className="material-symbols-outlined text-sm">home</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SCREEN 4: MEMORY VAULT */}
      <section id="screen-memory" className="screen">
        <div className="bg-background-light dark:bg-background-dark text-text-grey font-display antialiased overflow-hidden w-full h-screen flex justify-center">
          <div className="relative flex h-screen w-full justify-center bg-[#fdfbfb] dark:bg-[#121418]">
            <div className="relative flex flex-col w-full max-w-[480px] h-full bg-gradient-pastel dark:bg-gradient-to-b dark:from-background-dark dark:to-[#1a1c22] shadow-[0_0_40px_rgba(0,0,0,0.05)] border-x border-white/50 dark:border-white/5 overflow-hidden">
              <header className="flex items-center justify-between px-6 py-4 pt-6 shrink-0 z-20 backdrop-blur-md bg-white/30 dark:bg-black/30 sticky top-0">
                <button onClick={() => showScreen('screen-connected')} className="flex items-center justify-center size-10 rounded-full bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Online</span>
                </div>
                <button className="flex items-center justify-center size-10 rounded-full bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
              </header>
              <div id="memory-scroll" className="flex-1 overflow-y-auto hide-scrollbar pb-20">
                <div className="px-6 py-6">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-[#171213] dark:text-white leading-[1.1] tracking-tight">
                      Kho lưu trữ<br/>
                      <span className="text-primary relative inline-block">
                        kỷ niệm
                        <svg className="absolute -bottom-1 left-0 w-full h-2 text-primary/30" preserveAspectRatio="none" viewBox="0 0 100 10">
                          <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        </svg>
                      </span>
                    </h1>
                    <p className="text-[#83676c] dark:text-gray-400 text-base font-medium mt-2">
                      Những dòng thư gửi em từ nơi xa
                    </p>
                  </div>
                </div>
                <div className="sticky top-0 z-10 pl-6 py-4 bg-gradient-to-b from-[#F9F7F5] via-[#F9F7F5]/90 to-transparent dark:from-background-dark dark:via-background-dark/90 backdrop-blur-sm">
                  <div id="month-filters" className="flex gap-3 overflow-x-auto hide-scrollbar pr-6 pb-2">
                    {/* Month filter buttons will be rendered here dynamically */}
                  </div>
                </div>
                <div id="messages-container" className="px-5 flex flex-col gap-5 mt-2">
                  {/* Messages will be rendered here dynamically */}
                </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
                <button 
                  onClick={scrollToTopMemory}
                  className="pointer-events-auto flex items-center gap-2 bg-[#171213] dark:bg-white text-white dark:text-[#171213] px-6 py-3 rounded-full shadow-xl shadow-black/10 transform hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">vertical_align_top</span>
                  <span className="text-sm font-bold">Mới nhất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

