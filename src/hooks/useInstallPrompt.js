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
  const isSafari  = /^((?!chrome|android).)*safari/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isChrome  = /chrome/i.test(ua) && !/edg/i.test(ua)

  const showIOSInstructions     = isIOS && isSafari && !isInstalled
  // Mostra sempre il banner Android (con o senza prompt nativo)
  const showAndroidInstructions = isAndroid && isChrome && !isInstalled

  return { prompt, isInstalled, triggerInstall, showIOSInstructions, showAndroidInstructions }
}
