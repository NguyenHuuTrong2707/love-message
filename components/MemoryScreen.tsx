'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockMessages, getMessagesByMonth, type Message } from '@/data/mockData'
import { useAppState } from '@/hooks/useAppState'

export default function MemoryScreen() {
  const router = useRouter()
  const { memoryMonthFilter, setMemoryMonthFilter } = useAppState()
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  useEffect(() => {
    const filtered = memoryMonthFilter !== null
      ? getMessagesByMonth(String(memoryMonthFilter))
      : mockMessages
    setMessages(filtered)
  }, [memoryMonthFilter])

  function filterMessagesByMonth(month: string | null) {
    setMemoryMonthFilter(month)
  }

  function scrollToTopMemory() {
    const el = document.getElementById('memory-scroll')
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-grey font-display antialiased overflow-hidden w-full h-screen flex justify-center">
      <div className="relative flex h-screen w-full justify-center bg-[#fdfbfb] dark:bg-[#121418]">
        <div className="relative flex flex-col w-full max-w-[480px] h-full bg-gradient-pastel dark:bg-gradient-to-b dark:from-background-dark dark:to-[#1a1c22] shadow-[0_0_40px_rgba(0,0,0,0.05)] border-x border-white/50 dark:border-white/5 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 pt-6 shrink-0 z-20 backdrop-blur-md bg-white/30 dark:bg-black/30 sticky top-0">
            <button onClick={() => router.push('/connected')} className="flex items-center justify-center size-10 rounded-full bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm">
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
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pr-6 pb-2">
                <button
                  onClick={() => filterMessagesByMonth(null)}
                  className={`flex shrink-0 items-center justify-center h-10 px-5 rounded-xl transition-colors transform active:scale-95 ${
                    memoryMonthFilter === null
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-white dark:bg-white/5 border border-[#e8e6e6] dark:border-white/10 text-[#5c5c5c] dark:text-gray-300'
                  }`}
                >
                  <span className="text-sm font-bold">Tất cả</span>
                </button>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <button
                    key={month}
                    onClick={() => filterMessagesByMonth(String(month))}
                    className={`flex shrink-0 items-center justify-center h-10 px-5 rounded-xl transition-colors transform active:scale-95 ${
                      memoryMonthFilter === String(month)
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-white dark:bg-white/5 border border-[#e8e6e6] dark:border-white/10 text-[#5c5c5c] dark:text-gray-300'
                    }`}
                  >
                    <span className="text-sm font-bold">Tháng {month}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 flex flex-col gap-5 mt-2">
              {messages.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
                  <span className="material-symbols-outlined text-primary text-3xl">inbox</span>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Chưa có tin nhắn tháng này</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const bgColor = message.bgColor === 'pink' 
                      ? 'bg-[#F5E0E3] dark:bg-white/10' 
                      : 'bg-[#F0EFE9] dark:bg-white/5'
                    
                    const dividerColor = message.bgColor === 'pink'
                      ? 'bg-[#dcbabf]/30 dark:bg-white/10'
                      : 'bg-[#d1d0c8]/40 dark:bg-white/10'
                    
                    return (
                      <div
                        key={message.id}
                        className={`group relative flex flex-col gap-3 p-6 rounded-[24px] ${bgColor} border border-white/40 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-black/30 backdrop-blur-md">
                            <span className="material-symbols-outlined text-[14px] text-gray-600 dark:text-gray-300">calendar_today</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wide">{message.date}</span>
                          </div>
                          <div className={`size-8 flex items-center justify-center rounded-full bg-white/40 dark:bg-white/10 ${message.isFavorite ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                            <span 
                              className="material-symbols-outlined text-[20px]"
                              style={{ fontVariationSettings: message.isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              favorite
                            </span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <h3 className="text-lg font-bold text-[#2d2527] dark:text-white mb-1.5">{message.title}</h3>
                          <p className="text-[#5d4a4d] dark:text-gray-300 text-[15px] leading-relaxed line-clamp-3">
                            {message.content}
                          </p>
                        </div>
                        <div className={`w-full h-px ${dividerColor} mt-2`}></div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#83676c] dark:text-gray-400">{message.time}</span>
                          <span className="material-symbols-outlined text-[#83676c] dark:text-gray-400 group-hover:translate-y-1 transition-transform">keyboard_arrow_down</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
                    <span className="material-symbols-outlined text-primary text-3xl animate-bounce">volunteer_activism</span>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Hết kỷ niệm tháng này</p>
                  </div>
                </>
              )}
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
  )
}

