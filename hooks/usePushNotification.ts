'use client'

import { useState, useEffect } from 'react'
import { urlBase64ToUint8Array } from '@/lib/utils'

// VAPID Public Key sẽ được load từ API
let VAPID_PUBLIC_KEY: string | null = null

export function usePushNotification() {
  const [vapidKey, setVapidKey] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default'
  )

  useEffect(() => {
    loadVAPIDPublicKey()
  }, [])

  async function loadVAPIDPublicKey() {
    try {
      const response = await fetch('/api/vapid-public-key')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      VAPID_PUBLIC_KEY = data.publicKey
      setVapidKey(data.publicKey)
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
        await registration.update()
      } else if (registration.active) {
        console.log('Service Worker active')
      }
      return registration
    } catch (err) {
      console.error('❌ Service worker registration failed:', err)
      return null
    }
  }

  async function handleEnablePush() {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        alert('Trình duyệt của bạn không hỗ trợ thông báo đẩy.')
        return false
      }

      if (!VAPID_PUBLIC_KEY) {
        console.warn('VAPID Public Key chưa được load')
        await loadVAPIDPublicKey()
        if (!VAPID_PUBLIC_KEY) {
          alert('Không thể tải cấu hình thông báo. Vui lòng thử lại sau.')
          return false
        }
      }

      // Request permission
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        alert('Bạn cần cấp quyền thông báo để nhận tin nhắn.')
        return false
      }

      // Register service worker
      const registration = await registerServiceWorker()
      if (!registration) {
        alert('Không thể đăng ký service worker.')
        return false
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Send subscription to server
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      console.log('✅ Push subscription successful')
      return true
    } catch (error) {
      console.error('❌ Failed to enable push:', error)
      alert('Không thể bật thông báo. Vui lòng thử lại.')
      return false
    }
  }

  return {
    vapidKey,
    permission,
    handleEnablePush,
    registerServiceWorker,
  }
}

