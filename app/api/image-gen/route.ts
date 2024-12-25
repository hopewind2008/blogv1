import { NextResponse } from 'next/server'

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
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '请上传图片' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured')
    }

    // 将文件转换为 base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // 调用 Gemini API 分析图片
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
                    mime_type: file.type,
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
      throw new Error(error.error?.message || '分析请求失败')
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('无效的响应格式')
    }

    const content = data.candidates[0].content.parts[0].text

    try {
      const analysisResult = JSON.parse(content) as AnalysisResult
      return NextResponse.json({ analysis: analysisResult })
    } catch (error) {
      throw new Error('无法解析分析结果')
    }
  } catch (error) {
    console.error('分析错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分析失败，请重试' },
      { status: 500 }
    )
  }
} 