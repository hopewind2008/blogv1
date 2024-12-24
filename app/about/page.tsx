import { Button } from '@/components/ui/button'
import { Mail, Github, Twitter } from 'lucide-react'
import { Navigation } from '../components/Navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <Navigation />
      {/* Header */}
      <div className="relative border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
        <div className="container mx-auto px-6 py-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">关于我们</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              神秘实验室成立于2023年，是一个专注于前沿科技研究的创新团队。
              我们致力于推动人工智能技术的发展，探索未来科技的无限可能。
            </p>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold mb-6">我们的使命</h2>
          <p className="text-gray-300 mb-8">
            通过持续创新和技术突破，为人类社会带来积极的改变。
            我们相信技术的力量可以帮助解决人类面临的重大挑战，
            创造更美好的未来。
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              "突破技术边界",
              "推动科技创新",
              "服务人类社会"
            ].map((value, i) => (
              <div
                key={i}
                className="border border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-colors"
              >
                <p className="text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-8">核心团队</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {Array.from({length: 3}).map((_, i) => (
            <div
              key={i}
              className="border border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-colors"
            >
              <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">张博士</h3>
              <p className="text-blue-400 mb-4">首席研究员</p>
              <p className="text-gray-400 mb-6">
                专注于量子计算和机器学习领域，拥有十年研究经验。
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-6">联系我们</h2>
          <p className="text-gray-300 mb-8">
            如果您对我们的研究感兴趣，或者希望展开合作，欢迎随时联系我们。
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              发送邮件
            </Button>
            <Button variant="outline" className="border-gray-700">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" className="border-gray-700">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

