import { Suspense } from 'react'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/home/HeroSection'
import ProjectsGallery from '@/components/home/ProjectsGallery'
import LatestPosts from '@/components/home/LatestPosts'
import Footer from '@/components/home/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 实验室 - 探索数字世界的无限可能',
  description: '欢迎来到我的个人博客！这里有我开发的一些有趣的小程序，以及我对科技新闻和AI发展的见解。让我们一起探索数字世界的无限可能。',
  openGraph: {
    title: 'AI 实验室 - 探索数字世界的无限可能',
    description: '欢迎来到我的个人博客！这里有我开发的一些有趣的小程序，以及我对科技新闻和AI发展的见解。让我们一起探索数字世界的无限可能。',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      
      <Suspense fallback={<div className="min-h-[600px] bg-black" />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<div className="min-h-[400px] bg-black" />}>
        <ProjectsGallery />
      </Suspense>

      <Suspense fallback={<div className="min-h-[400px] bg-black" />}>
        <LatestPosts />
      </Suspense>

      <Footer />
    </main>
  )
}

