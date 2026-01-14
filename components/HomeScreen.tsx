'use client'

import { useRouter } from 'next/navigation'
import { useCountdown } from '@/hooks/useCountdown'
import { useAppState } from '@/hooks/useAppState'
import { pad2 } from '@/lib/utils'

export default function HomeScreen() {
  const router = useRouter()
  const countdown = useCountdown(22)
  const { isIOS, isStandalone } = useAppState()

  function goToNotificationsFlow() {
    const permission = typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default'
    
    if (permission === 'granted') {
      router.push('/connected')
    } else {
      router.push('/enable')
    }
  }

  return (
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
          <div id="safari-guide-inline" className="w-full mb-4 bg-white/90 dark:bg-background-dark/80 border border-primary/20 rounded-2xl p-4 shadow-soft" style={{ display: isIOS && !isStandalone ? 'block' : 'none' }}>
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
  )
}

