'use client'

import { useRouter } from 'next/navigation'
import { usePushNotification } from '@/hooks/usePushNotification'

export default function EnableScreen() {
  const router = useRouter()
  const { handleEnablePush } = usePushNotification()

  async function handleClick() {
    const success = await handleEnablePush()
    if (success) {
      router.push('/connected')
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center items-center p-4 sm:p-8">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#FDFBF8] to-[#FBEDEF] dark:from-[#312b2e] dark:to-[#1a1618] opacity-90"></div>
      <div className="absolute inset-0 z-0 opacity-30 bg-pattern pointer-events-none"></div>
      <div className="relative z-10 w-full max-w-[420px] bg-card-light dark:bg-card-dark rounded-2xl shadow-soft dark:shadow-none flex flex-col overflow-hidden border border-[#f4f1f1] dark:border-[#4a3f43] transform transition-all">
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#f4f1f1] dark:border-[#4a3f43] bg-white/50 dark:bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-text-main dark:text-white/80 hover:text-primary transition-colors">
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
            onClick={handleClick}
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
  )
}

