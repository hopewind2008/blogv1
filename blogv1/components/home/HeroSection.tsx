'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { memo } from 'react'

const HeroSection = () => {
  return (
    <div className="relative min-h-[600px] md:min-h-[800px]">
      <Image
        src="/images/jun-ohashi-O71npBgVnsI-unsplash.jpg"
        alt="Cyberpunk city"
        fill
        priority
        sizes="100vw"
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHSIeHx8dIigjJCUmJSQkIiYoLTAqKC4rIiUwNS0yNT4+Pj4+Pj4+Pj4+Pj7/2wBDAR0XFyMeIyYeFiY2KiYqNj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        className="object-cover brightness-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-600/50">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
          <h1 className="mb-4 md:mb-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            AI 实验室
          </h1>
          <p className="mb-8 md:mb-12 text-base md:text-lg max-w-2xl text-gray-200">
            欢迎来到我的个人博客！这里有我开发的一些有趣的小程序，
            以及我对科技新闻和AI发展的见解。让我们一起探索数字世界的无限可能。
          </p>
          
          <div className="flex max-w-md items-center gap-2">
            <Input
              type="search"
              placeholder="搜索文章..."
              className="bg-black/50 border-gray-700 focus:border-blue-500 transition-colors"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
              搜索
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(HeroSection) 