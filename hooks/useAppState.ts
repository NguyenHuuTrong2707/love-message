'use client'

import { useState, useEffect } from 'react'

interface AppState {
  isIOS: boolean
  isStandalone: boolean
  memoryMonthFilter: string | null
}

export function useAppState() {
  const [state, setState] = useState<AppState>({
    isIOS: false,
    isStandalone: false,
    memoryMonthFilter: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches

    setState({
      isIOS,
      isStandalone,
      memoryMonthFilter: null,
    })
  }, [])

  return {
    ...state,
    setMemoryMonthFilter: (filter: string | null) => {
      setState(prev => ({ ...prev, memoryMonthFilter: filter }))
    },
  }
}

