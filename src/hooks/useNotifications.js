import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
  || 'BCw7nAThvP5sGWpUoW4ak1BStBT9vy79bxzTgxfCACa2rT7sNGnOYo9FIVJk1FSnAP7pTmT13AZUaG0Ce1Vq1eQ'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export function useNotifications(userId) {
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

  useEffect(() => {
    if (!isSupported || !userId) return
    checkExistingSubscription()
  }, [userId])

  async function checkExistingSubscription() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('endpoint', sub.endpoint)
        .maybeSingle()
      setSubscribed(!!data)
    }
  }

  const subscribe = useCallback(async () => {
    if (!isSupported || !userId) return false
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id:      userId,
          endpoint:     sub.endpoint,
          subscription: sub.toJSON(),
        }, { onConflict: 'user_id,endpoint' })

      if (!error) {
        setPermission('granted')
        setSubscribed(true)
        return true
      }
    } catch (err) {
      console.error('Push subscribe error:', err)
    } finally {
      setLoading(false)
    }
    return false
  }, [userId])

  const unsubscribe = useCallback(async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', sub.endpoint)
      }
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }, [userId])

  async function requestAndSubscribe() {
    if (!isSupported) return false
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') return subscribe()
    return false
  }

  return { permission, subscribed, loading, isSupported, requestAndSubscribe, unsubscribe }
}
