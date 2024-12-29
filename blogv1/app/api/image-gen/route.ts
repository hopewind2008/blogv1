import { NextResponse } from 'next/server'
import { AppError, ErrorCodes, handleApiError, retryOperation } from '@/lib/errorUtils'

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

interface ApiResponse {
  analysis: AnalysisResult
  styleDescription?: string
}

async function analyzeImageWithGemini(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new AppError(
      'Google API key not configured',
      ErrorCodes.API_ERROR,
      500
    )
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "请分析这张穿搭图片，并给出以下信息：1. 总体评分（1-10分）2. 风格统一评分（1-10分）3. 实用性评分（1-10分）4. 搭配优点（列出3-5点）5. 搭配建议（列出3-5点）6. 适合场合（列出2-3个）。请用JSON格式返回，包含scores（包含overall、style、practicality）、advantages数组、recommendations数组和occasions数组。"
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ]
      })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new AppError(
      error.error?.message || '分析请求失败',
      ErrorCodes.API_ERROR,
      response.status
    )
  }

  const data = await response.json()
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new AppError(
      '无效的响应格式',
      ErrorCodes.API_ERROR,
      500
    )
  }

  const content = data.candidates[0].content.parts[0].text

  try {
    return JSON.parse(content) as AnalysisResult
  } catch (error) {
    throw new AppError(
      '无法解析分析结果',
      ErrorCodes.API_ERROR,
      500,
      { content }
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new AppError(
        '请上传图片',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // 将文件转换为 base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // 使用重试机制调用 Gemini API
    const analysisResult = await retryOperation(
      () => analyzeImageWithGemini(base64Image, file.type),
      3, // 最多重试3次
      1000 // 初始延迟1秒
    )

    // 生成风格描述
    const styleDescription = await retryOperation(async () => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `基于以下分析结果，请用一段简短的文字描述这套穿搭的风格特点：${JSON.stringify(analysisResult)}`
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        throw new Error('生成风格描述失败')
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    })

    return NextResponse.json({ 
      analysis: analysisResult,
      styleDescription
    })
  } catch (error) {
    console.error('分析错误:', error)
    const appError = handleApiError(error)
    return NextResponse.json(
      { error: appError.message },
      { status: appError.statusCode }
    )
  }
} 