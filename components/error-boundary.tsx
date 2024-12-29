'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 可以在这里添加错误日志上报
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">出错了</h2>
        <p className="text-gray-400">
          {error.message || '抱歉，页面加载出现错误'}
        </p>
      </div>
      <div className="flex space-x-4">
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
          返回首页
        </Button>
        <Button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          重试
        </Button>
      </div>
    </div>
  )
} 