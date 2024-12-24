import Link from 'next/link'
import { Search } from 'lucide-react'

export function Navigation() {
  return (
    <nav className="flex items-center justify-between p-6 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
      <Link href="/" className="flex items-center space-x-2">
        <div className="h-6 w-6 bg-blue-500" />
        <span className="text-lg font-semibold">神秘实验室</span>
      </Link>
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/" className="hover:text-blue-400">首页</Link>
        <Link href="/blog" className="hover:text-blue-400">博客</Link>
        <Link href="/applications" className="hover:text-blue-400">应用</Link>
        <Link href="/about" className="hover:text-blue-400">关于</Link>
        <Search className="h-5 w-5 cursor-pointer hover:text-blue-400" />
      </div>
    </nav>
  )
}

