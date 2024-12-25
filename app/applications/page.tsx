import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Cpu, Globe } from 'lucide-react'
import { Navigation } from '@/components/Navigation'

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="container mx-auto px-6 py-24 relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">应用项目</h1>
          <p className="text-gray-300 max-w-2xl text-lg">
            探索技术的实际应用，分享个人项目和经验。
            这里展示了我在各个领域的尝试和成果。
          </p>
        </div>
      </div>

      {/* Application Areas */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-8">应用领域</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "认知智能",
              description: "研究机器学习和深度学习在认知科学领域的应用"
            },
            {
              icon: Globe,
              title: "全球智能系统",
              description: "开发能够理解和适应全球复杂系统的人工智能"
            },
            {
              icon: Cpu,
              title: "量子计算",
              description: "探索量子计算在人工智能中的应用前景"
            }
          ].map((area, i) => (
            <div
              key={i}
              className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <area.icon className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{area.title}</h3>
              <p className="text-gray-400 mb-4">{area.description}</p>
              <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0">
                了解更多 <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Projects */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-8">个人项目</h2>
        <div className="grid gap-6">
          {Array.from({length: 4}).map((_, i) => (
            <div
              key={i}
              className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">类脑计算架构研究</h3>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      进行中
                    </Badge>
                  </div>
                  <p className="text-gray-400 mb-4 md:mb-0">
                    开发新型神经网络架构，模拟人类大脑的认知过程，提高AI系统的学习效率。
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                  项目详情
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

