import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  const [prompt,      setPrompt]      = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }
    function handler(e) {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function triggerInstall() {
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
    return outcome === 'accepted'
  }

  const ua = navigator.userAgent
  const isIOS     = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isChrome  = /chrome/i.test(ua) && !/edg/i.test(ua) && !/opr/i.test(ua)
  const isFirefox = /firefox/i.test(ua)
  const isSamsung = /samsungbrowser/i.test(ua)
  // Safari: ha "Safari" nell'UA ma non "Chrome" né "Android"
  const isSafari  = /safari/i.test(ua) && !isChrome && !isAndroid && !isFirefox

  let platform
  if      (isIOS && isSafari)      platform = 'ios-safari'
  else if (isIOS)                  platform = 'ios-chrome'   // Chrome/Firefox su iOS usano WebKit, serve Safari
  else if (isAndroid && isSamsung) platform = 'android-samsung'
  else if (isAndroid && isFirefox) platform = 'android-firefox'
  else if (isAndroid)              platform = 'android-chrome' // Chrome e altri su Android
  else if (prompt)                 platform = 'desktop-prompt'
  else                             platform = 'unknown'

  return { prompt, isInstalled, triggerInstall, platform }
}
