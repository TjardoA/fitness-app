import { useEffect, useState } from 'react'
import { localDate } from '../utils/dates'

export function useToday() {
  const [today, setToday] = useState(localDate)
  useEffect(() => {
    const update = () => setToday(localDate())
    const timer = window.setInterval(update, 15000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return today
}

