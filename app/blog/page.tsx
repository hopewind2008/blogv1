import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'
import { Navigation } from '@/components/Navigation'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-4">技术博客</h1>
          <p className="text-gray-400 max-w-2xl">
            探索前沿科技，了解最新研究成果，获取深度技术见解。
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-2">
            <Input 
              placeholder="搜索文章..." 
              className="bg-black/50 border-gray-700 max-w-md"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>
            <select className="bg-black/50 border border-gray-700 rounded-md px-4 py-2">
              <option>最新发布</option>
              <option>最多阅读</option>
              <option>最多评论</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 9}).map((_, i) => (
            <article 
              key={i}
              className="group border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
            >
              <div className="aspect-video relative bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-400">人工智能</span>
                  <time className="text-sm text-gray-400">2023-12-23</time>
                </div>
                <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                  量子计算在��工智能中的应用研究
                </h2>
                <p className="text-gray-400 line-clamp-3">
                  探索量子计算如何改变人工智能的未来发展方向，以及它在机器学习领域带来的革命性突破...
                </p>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">阅读时间: 15分钟</span>
                  <Button variant="link" className="text-blue-400 hover:text-blue-300">
                    阅读更多
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

