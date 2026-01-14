'use client'

import { useState, useEffect, useRef } from 'react'
import { addMonths } from '@/lib/utils'

export function useCountdown(monthsToCountDown: number) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 })
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
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

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [monthsToCountDown])

  return countdown
}

