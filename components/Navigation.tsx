'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className="flex items-center justify-between p-4 md:p-6 bg-black/80 backdrop-blur-sm sticky top-0 z-20">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-gradient-to-br from-blue-400 to-violet-400 rounded-full" />
          <span className="text-lg font-semibold">神秘实验室</span>
        </Link>
        
        {/* 桌面端菜单 */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:text-blue-400 transition-colors">首页</Link>
          <Link href="/blog" className="hover:text-blue-400 transition-colors">博客</Link>
          <Link href="/applications" className="hover:text-blue-400 transition-colors">应用</Link>
          <Link href="/about" className="hover:text-blue-400 transition-colors">关于</Link>
          <Search className="h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors" />
        </div>

        {/* 移动端菜单按钮 */}
        <button
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* 移动端导航抽屉 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* 导航菜单 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-slate-900 border-l border-white/10 z-40 md:hidden"
            >
              <div className="flex flex-col p-6 space-y-6">
                <div className="flex justify-end">
                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <X />
                  </button>
                </div>
                <Link
                  href="/"
                  className="hover:text-blue-400 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  首页
                </Link>
                <Link
                  href="/blog"
                  className="hover:text-blue-400 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  博客
                </Link>
                <Link
                  href="/applications"
                  className="hover:text-blue-400 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  应用
                </Link>
                <Link
                  href="/about"
                  className="hover:text-blue-400 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  关于
                </Link>
                <div className="flex items-center space-x-4 py-2">
                  <Search className="h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors" />
                  <span className="text-sm text-gray-400">搜索</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

