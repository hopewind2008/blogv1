import Image from 'next/image'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <div className="relative min-h-[600px] md:min-h-[800px]">
        <Image
          src="/images/jun-ohashi-O71npBgVnsI-unsplash.jpg"
          alt="Cyberpunk city"
          fill
          className="object-cover brightness-50"
          priority
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
            
            {/* Featured Projects Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
              <Link href="/projects/ai-chat" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/images/zodiac-bg.jpg"
                  alt="AI Chat Project"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 md:p-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">AI 星座运势</h3>
                    <p className="text-sm md:text-base text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      基于大语言模型的智能对话系统
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/projects/image-gen" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/images/ai-chat-bg.jpg"
                  alt="Image Generation"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 md:p-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">AI 穿搭分析</h3>
                    <p className="text-sm md:text-base text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      智能穿搭分析与推荐系统
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/projects/code-helper" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/images/jun-ohashi-pSBXlKhkk-M-unsplash.jpg"
                  alt="Code Helper"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 md:p-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">代码助手</h3>
                    <p className="text-sm md:text-base text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      智能代码补全与优化工具
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/projects/data-viz" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/images/jun-ohashi-pSBXlKhkk-M-unsplash.jpg"
                  alt="Data Visualization"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 md:p-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">数据可视化</h3>
                    <p className="text-sm md:text-base text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      交互式数据展示平台
                    </p>
                  </div>
                </div>
              </Link>
            </div>

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

      {/* Latest Posts */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <h2 className="mb-6 md:mb-8 text-xl md:text-2xl font-semibold">最新文章</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <article
              key={i}
              className="group cursor-pointer space-y-3 md:space-y-4 rounded-lg border border-gray-800 p-4 md:p-6 transition-colors hover:border-gray-700 hover:bg-white/5"
            >
              <time className="text-sm text-gray-400">2023年12月23日</time>
              <h3 className="text-lg md:text-xl font-semibold group-hover:text-blue-400 transition-colors">
                人工智能的未来：下一步是什么？
              </h3>
              <p className="text-sm md:text-base text-gray-400">
                探索人工智能技术的最新发展，以及它将如何改变我们的未来生活方式...
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
              <Link href="/" className="hover:text-blue-400 transition-colors">首页</Link>
              <Link href="/blog" className="hover:text-blue-400 transition-colors">博客</Link>
              <Link href="/applications" className="hover:text-blue-400 transition-colors">应用</Link>
              <Link href="/about" className="hover:text-blue-400 transition-colors">关于</Link>
            </div>
            <p className="text-gray-400 text-sm md:text-base">© 2023 神秘实验室</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

