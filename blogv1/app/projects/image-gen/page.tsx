'use client'

import { useState, useEffect, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import { LoadingSpinner } from '@/components/ui/loading'
import { CloudUpload, Image as ImageIcon, Wand2 } from 'lucide-react'
import Image from 'next/image'
import { compressImage, validateImage } from '@/lib/imageUtils'
import { getUserFriendlyErrorMessage } from '@/lib/errorUtils'
import { toast } from 'sonner'
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

interface AnalysisCache {
  [key: string]: {
    result: AnalysisResult
    styleDescription: string
    timestamp: number
  }
}

export default function ImageGenPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [referenceImages, setReferenceImages] = useState<Array<{
    url: string
    thumbnail: string
    title: string
    source: string
    comment: string
    score: number
  }>>([])
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [styleDescription, setStyleDescription] = useState<string>('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [analysisCache] = useState<AnalysisCache>({})

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证图片
    const validation = validateImage(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    // 重置所有状态
    setReferenceImages([])
    setAnalysisResult(null)
    setStyleDescription('')
    setAnalysisProgress(0)
    setGenerationProgress(0)
    setLoading(false)
    
    try {
      // 压缩图片
      const compressedFile = await compressImage(file)
      setSelectedFile(compressedFile)
      
      // 设置预览
      const reader = new FileReader()
      reader.onload = async (e) => {
        const url = e.target?.result as string
        setPreviewUrl(url)
        // 自动触发分析
        await handleAnalyze(compressedFile)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error))
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return

    // 验证图片
    const validation = validateImage(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }
    
    try {
      // 压缩图片
      const compressedFile = await compressImage(file)
      
      // 重置所有状态
      setReferenceImages([])
      setAnalysisResult(null)
      setStyleDescription('')
      setAnalysisProgress(0)
      setGenerationProgress(0)
      setLoading(false)
      
      // 设置新文件并预览
      setSelectedFile(compressedFile)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const url = e.target?.result as string
        setPreviewUrl(url)
        // 自动触发分析
        await handleAnalyze(compressedFile)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error))
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleAnalyze = async (file: File = selectedFile!) => {
    if (!file) return

    // 检查缓存
    const fileHash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    const hashArray = Array.from(new Uint8Array(fileHash))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    const cachedResult = analysisCache[hashHex]
    if (cachedResult && Date.now() - cachedResult.timestamp < 24 * 60 * 60 * 1000) {
      setAnalysisResult(cachedResult.result)
      setStyleDescription(cachedResult.styleDescription)
      return
    }

    // 确保分析开始时状态是清空的
    setReferenceImages([])
    setAnalysisResult(null)
    setStyleDescription('')
    setLoading(true)
    setAnalysisProgress(0)
    
    // 启动进度模拟
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)
    
    const formData = new FormData()
    formData.append('file', file)

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
      setStyleDescription(data.styleDescription || '')
      setAnalysisProgress(100)

      // 更新缓存
      analysisCache[hashHex] = {
        result: data.analysis,
        styleDescription: data.styleDescription || '',
        timestamp: Date.now()
      }
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error))
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
      // 延迟清除进度
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }

  const handleGenerate = async () => {
    // 添加更多的状态检查
    if (!selectedFile || !analysisResult || !styleDescription) {
      toast.error('请先上传图片并等待分析完成')
      return
    }

    if (loading) {
      return
    }

    // 重置生成相关的状态
    setReferenceImages([])
    setGenerationProgress(0)
    setLoading(true)
    
    let progressInterval: NodeJS.Timeout
    
    try {
      progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)
      
      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentOutfit: styleDescription,
          analysis: analysisResult
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '生成搭配失败')
      }

      const data = await response.json()
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('返回的数据格式不正确')
      }

      // 转换返回的结果格式
      const referenceImages = data.results.map((result: any) => ({
        url: result.link || result.image.originalLink,
        thumbnail: result.link || result.image.originalLink,
        title: result.title,
        source: result.displayLink,
        comment: result.comment || '优雅时尚的穿搭灵感',
        score: result.score || 7.5
      }))

      setReferenceImages(referenceImages)
      setGenerationProgress(100)
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error))
      setReferenceImages([])
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setLoading(false)
      setTimeout(() => setGenerationProgress(0), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">AI 穿搭分析</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传区域 */}
          <div className="space-y-6">
            <div
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                {previewUrl ? (
                  <div className="relative aspect-square w-full max-w-md mx-auto">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <CloudUpload className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-400">
                      点击或拖拽图片到这里上传
                      <br />
                      <span className="text-sm">支持 JPG、PNG 格式</span>
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* 分析结果 */}
            {analysisResult && (
              <div className="space-y-6 bg-black/20 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {analysisResult.scores.overall}
                    </div>
                    <div className="text-sm text-gray-400">总体评分</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {analysisResult.scores.style}
                    </div>
                    <div className="text-sm text-gray-400">风格统一</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">
                      {analysisResult.scores.practicality}
                    </div>
                    <div className="text-sm text-gray-400">实用性</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">搭配优点</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {analysisResult.advantages.map((advantage, index) => (
                      <li key={index}>{advantage}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">搭配建议</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">适合场合</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.occasions.map((occasion, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 rounded-full text-sm"
                      >
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>生成搭配推荐</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 右侧：参考搭配 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">参考搭配</h2>
            
            {/* 进度条 */}
            {(analysisProgress > 0 || generationProgress > 0) && (
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${Math.max(analysisProgress, generationProgress)}%`
                  }}
                />
              </div>
            )}

            {/* 参考图片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {referenceImages.map((image, index) => (
                <div
                  key={index}
                  className="bg-black/20 rounded-lg overflow-hidden group"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={image.thumbnail}
                      alt={image.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-1">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {image.comment}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{image.source}</span>
                      <span className="text-blue-400 font-semibold">
                        {image.score.toFixed(1)}分
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 空状态 */}
            {!loading && referenceImages.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>上传图片开始分析</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 