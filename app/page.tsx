import Image from 'next/image'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-blue-500" />
          <span className="text-lg font-semibold">Hope777</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:text-blue-400">首页</Link>
          <Link href="/news" className="hover:text-blue-400">新闻</Link>
          <Link href="/programs" className="hover:text-blue-400">程序</Link>
          <Link href="/about" className="hover:text-blue-400">关于</Link>
          <Search className="h-5 w-5 cursor-pointer hover:text-blue-400" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[800px]">
        <Image
          src="/placeholder.svg?height=800&width=1920"
          alt="Cyberpunk city"
          width={1920}
          height={800}
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-600/50">
          <div className="container mx-auto px-6 py-20">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              AI 实验室
            </h1>
            <p className="mb-12 max-w-2xl text-lg text-gray-200">
              欢迎来到我的个人博客！这里有我开发的一些有趣的小程序，
              以及我对科技新闻和AI发展的见解。让我们一起探索数字世界的无限可能。
            </p>
            
            {/* Featured Projects Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <Link href="/projects/ai-chat" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="AI Chat Project"
                  width={400}
                  height={400}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">AI 星座运势</h3>
                    <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      基于大语言模型的智能对话系统
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/projects/image-gen" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Image Generation"
                  width={400}
                  height={400}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">AI 图像生成</h3>
                    <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      创意图像生成与处理工具
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/projects/code-helper" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Code Helper"
                  width={400}
                  height={400}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">代码助手</h3>
                    <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      智能代码补全与优化工具
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/projects/data-viz" className="group relative overflow-hidden rounded-xl aspect-square">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Data Visualization"
                  width={400}
                  height={400}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">数据可视化</h3>
                    <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
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
                className="bg-black/50 border-gray-700"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                搜索
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Posts */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="mb-8 text-2xl font-semibold">最新文章</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <article
              key={i}
              className="group cursor-pointer space-y-4 rounded-lg border border-gray-800 p-6 transition-colors hover:border-gray-700"
            >
              <time className="text-sm text-gray-400">2023年12月23日</time>
              <h3 className="text-xl font-semibold group-hover:text-blue-400">
                人工智能的未来：下一步是什么？
              </h3>
              <p className="text-gray-400">
                探索人工智能技术的最新发展，以及它将如何改变我们的未来生活方式...
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex justify-between">
            <div className="space-x-8">
              <a href="#" className="hover:text-blue-400">首页</a>
              <a href="#" className="hover:text-blue-400">博客</a>
              <a href="#" className="hover:text-blue-400">应用</a>
              <a href="#" className="hover:text-blue-400">关于</a>
            </div>
            <p className="text-gray-400">© 2023 神秘实验室</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

