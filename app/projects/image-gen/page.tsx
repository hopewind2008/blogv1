'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/ui/loading'
import { Upload, Image as ImageIcon, Wand2 } from 'lucide-react'
import Image from 'next/image'

export default function ImageGenPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSubmit = async () => {
    if (!selectedImage) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await fetch('/api/image-gen/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('分析失败')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('分析错误:', error)
      alert('分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-8 md:pb-16">
      <Navigation />
      
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI 穿搭分析</h1>
            <p className="text-gray-400">上传你的穿搭照片，获取 AI 的专业分析和建议</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 上传区域 */}
            <div
              className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-400 mb-2">点击或拖拽图片到这里上传</p>
              <p className="text-sm text-gray-500">支持 JPG、PNG 格式</p>
            </div>

            {/* 预览区域 */}
            <div className="border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-400" />
                图片预览
              </h3>
              <div className="aspect-square relative bg-gray-900 rounded-lg overflow-hidden">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    暂无图片
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 分析按钮 */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  分析中...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  开始分析
                </>
              )}
            </button>
          </div>

          {/* 分析结果 */}
          {analysisResult && (
            <div className="mt-12 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">分析结果</h2>
              
              {/* 检测到的服装 */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">检测到的服装</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {analysisResult.detected_items?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-900 rounded-lg p-4"
                    >
                      <p className="font-medium mb-2">{item.item}</p>
                      <p className="text-sm text-gray-400">
                        置信度: {(item.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 评分 */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">穿搭评分</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analysisResult.scores || {}).map(([key, value]: [string, any]) => (
                    <div
                      key={key}
                      className="bg-gray-900 rounded-lg p-4"
                    >
                      <p className="font-medium mb-2">
                        {key === 'overall' ? '整体评分' :
                         key === 'style' ? '风格统一度' :
                         key === 'practicality' ? '实用性' : key}
                      </p>
                      <p className="text-2xl font-bold text-purple-400">
                        {(value * 10).toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 建议 */}
              {analysisResult.recommendations && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">穿搭建议</h3>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-300"
                      >
                        <span className="text-purple-400">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 适合场合 */}
              {analysisResult.occasions && (
                <div>
                  <h3 className="text-lg font-medium mb-4">适合场合</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.occasions.map((occasion: string, index: number) => (
                      <span
                        key={index}
                        className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                      >
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 