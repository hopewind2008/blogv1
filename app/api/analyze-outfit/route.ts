import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// 清理响应文本，提取 JSON 内容
function extractJSON(text: string): string {
  // 移除所有换行符和多余的空格
  let cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  
  // 尝试找到 JSON 对象的开始和结束
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1)
  }
  
  return cleaned
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

    // 将文件转换为字节数组
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 初始化 Gemini 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

    // 调用 Gemini API 分析图片
    const result = await model.generateContent([
      {
        text: '分析这张穿搭照片，返回一个 JSON 对象，包含以下字段：scores（包含 overall、style、practicality 三个 1-10 的数字评分），advantages（3-5个优点），recommendations（3-5个建议），occasions（2-3个适合场合）。直接返回 JSON 对象，不要包含其他文本。'
      },
      {
        inlineData: {
          mimeType: file.type,
          data: buffer.toString('base64')
        }
      }
    ])

    const response = await result.response
    const content = response.text()
    
    console.log('原始响应:', content)

    try {
      // 清理并解析 JSON 响应
      const cleanedContent = extractJSON(content)
      console.log('清理后的响应:', cleanedContent)
      
      const analysis = JSON.parse(cleanedContent)
      
      // 验证响应格式
      if (!analysis.scores?.overall || !analysis.scores?.style || !analysis.scores?.practicality ||
          !Array.isArray(analysis.advantages) || !Array.isArray(analysis.recommendations) || !Array.isArray(analysis.occasions)) {
        throw new Error('响应格式不正确')
      }
      
      // 确保所有评分都是数字
      analysis.scores.overall = Number(analysis.scores.overall)
      analysis.scores.style = Number(analysis.scores.style)
      analysis.scores.practicality = Number(analysis.scores.practicality)
      
      return NextResponse.json({ analysis })
    } catch (parseError) {
      console.error('JSON 解析错误:', parseError)
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