'use client'

import Link from 'next/link'
import { memo } from 'react'

const navigation = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '博客' },
  { href: '/applications', label: '应用' },
  { href: '/about', label: '关于' },
]

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-black/50">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-blue-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-gray-400 text-sm md:text-base">© 2023 神秘实验室</p>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer) 