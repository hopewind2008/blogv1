'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function ProgressBar() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 重置进度条
    setProgress(0)
    setIsVisible(true)

    // 模拟加载进度
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          clearInterval(timer)
          return 90
        }
        return oldProgress + 10
      })
    }, 100)

    // 完成加载
    const completeTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setIsVisible(false), 200)
    }, 1000)

    return () => {
      clearInterval(timer)
      clearTimeout(completeTimer)
    }
  }, [pathname, searchParams])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 z-50 w-full">
      <div
        className="h-1 bg-blue-500 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  )
} 