'use client'

import { useRouter } from 'next/navigation'

export default function ConnectedScreen() {
  const router = useRouter()

  return (
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
            onClick={() => router.push('/memory')}
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
            onClick={() => router.push('/')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <span>Về màn hình chính</span>
            <span className="material-symbols-outlined text-sm">home</span>
          </button>
        </div>
      </div>
    </div>
  )
}

