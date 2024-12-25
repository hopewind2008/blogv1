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

    // 将文件转换为 base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // 调用 API 分析图片
    const response = await fetch('https://api.example.com/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        image: base64Image
      })
    })

    if (!response.ok) {
      throw new Error('分析请求失败')
    }

    const result = await response.json() as ApiResponse
    return NextResponse.json(result)
  } catch (error) {
    console.error('分析错误:', error)
    return NextResponse.json(
      { error: '分析失败，请重试' },
      { status: 500 }
    )
  }
} 