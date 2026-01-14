'use client'

import { useEffect } from 'react'
import { usePushNotification } from '@/hooks/usePushNotification'
import EnableScreen from '@/components/EnableScreen'

export default function EnablePage() {
  const { registerServiceWorker } = usePushNotification()

  useEffect(() => {
    registerServiceWorker()
  }, [registerServiceWorker])

  return <EnableScreen />
}
