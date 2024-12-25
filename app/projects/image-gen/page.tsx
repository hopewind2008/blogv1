'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { LoadingSpinner } from '@/components/ui/loading'
import { CloudUpload, Image as ImageIcon, Wand2 } from 'lucide-react'
import Image from 'next/image'
import './styles.css'

interface AnalysisResult {
  scores: {
    overall: number
    style: number
    practicality: number
  }
  advantages: string[]
  recommendations: string[]
  occasions: string[]
}

export default function ImageGenPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [generatedUrl, setGeneratedUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      alert('请上传 JPG 或 PNG 格式的图片')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert('请上传 JPG 或 PNG 格式的图片')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setAnalysisResult(data.analysis)
    } catch (error) {
      console.error('Error:', error)
      alert('分析图片时出错：' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!analysisResult?.recommendations || !previewUrl) return

    setLoading(true)
    try {
      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysisResult.recommendations.join(', '),
          imageUrl: previewUrl,
        }),
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedUrl(data.image_url)
    } catch (error) {
      console.error('Error:', error)
      alert('生成图片时出错：' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-8 border border-white/10 shadow-xl">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
              AI 搭分析
            </h1>
            
            {/* 上传区域 */}
            <div className="mb-6 md:mb-8">
              <div
                className="border-2 border-dashed border-white/20 rounded-xl p-6 md:p-8 text-center cursor-pointer hover:border-blue-400/50 hover:bg-blue-400/5 transition-all duration-300"
                onClick={() => document.getElementById('fileInput')?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <CloudUpload className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-blue-400" />
                <p className="text-base md:text-lg mb-2">点击或拖拽图片到这里上传</p>
                <p className="text-xs md:text-sm text-gray-400">支持 jpg、jpeg、png 格式</p>
              </div>
            </div>

            {/* 预览区域 */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2 text-blue-400">
                  <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                  上传图片预览
                </h3>
                <div className="aspect-square relative rounded-lg overflow-hidden bg-black/20">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm md:text-base text-gray-400">
                      暂无图片
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2 text-violet-400">
                  <Wand2 className="w-4 h-4 md:w-5 md:h-5" />
                  AI 生成穿搭
                </h3>
                <div className="aspect-square relative rounded-lg overflow-hidden bg-black/20">
                  {generatedUrl ? (
                    <Image
                      src={generatedUrl}
                      alt="Generated"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm md:text-base text-gray-400">
                      暂无生成图片
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 分析结果 */}
            {analysisResult && (
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 md:mb-6 bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                  分析结果
                </h3>
                
                {/* 评分 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10 hover:border-blue-400/50 transition-colors">
                    <p className="text-base md:text-lg font-semibold text-gray-300">总体评分</p>
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                      {analysisResult.scores.overall.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10 hover:border-blue-400/50 transition-colors">
                    <p className="text-base md:text-lg font-semibold text-gray-300">风格统一</p>
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                      {analysisResult.scores.style.toFixed(1)}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1 bg-white/5 rounded-lg p-3 md:p-4 border border-white/10 hover:border-blue-400/50 transition-colors">
                    <p className="text-base md:text-lg font-semibold text-gray-300">实用性</p>
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">
                      {analysisResult.scores.practicality.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* 优点 */}
                <div className="mb-4 md:mb-6">
                  <h4 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-blue-400">搭配优点</h4>
                  <ul className="list-disc list-inside space-y-1.5 md:space-y-2 text-sm md:text-base text-gray-300">
                    {analysisResult.advantages.map((adv: string, i: number) => (
                      <li key={i} className="hover:text-blue-400 transition-colors">{adv}</li>
                    ))}
                  </ul>
                </div>

                {/* 建议 */}
                <div className="mb-4 md:mb-6">
                  <h4 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-violet-400">搭配建议</h4>
                  <ul className="list-disc list-inside space-y-1.5 md:space-y-2 text-sm md:text-base text-gray-300">
                    {analysisResult.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="hover:text-violet-400 transition-colors">{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* 场合 */}
                <div className="mb-4 md:mb-6">
                  <h4 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-blue-400">适合场合</h4>
                  <ul className="list-disc list-inside space-y-1.5 md:space-y-2 text-sm md:text-base text-gray-300">
                    {analysisResult.occasions.map((occ: string, i: number) => (
                      <li key={i} className="hover:text-blue-400 transition-colors">{occ}</li>
                    ))}
                  </ul>
                </div>

                {/* 生成按钮 */}
                <button
                  className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      <span>处理中...</span>
                    </div>
                  ) : (
                    '根据建议生成新穿搭'
                  )}
                </button>
              </div>
            )}

            {/* 分析按钮 */}
            {previewUrl && !analysisResult && (
              <button
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    <span>分析中...</span>
                  </div>
                ) : (
                  '开始分析'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 