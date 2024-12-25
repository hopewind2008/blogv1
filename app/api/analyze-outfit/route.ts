import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// 清理响应文本，提取 JSON 内容
function extractJSON(text: string): string {
  // 移除 Markdown 代码块标记
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  
  // 尝试找到 JSON 对象的开始和结束
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1)
  }
  
  return cleaned.trim()
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

    // 初始化 Gemini 1.5 Flash 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // 调用 Gemini API 分析图片
    const result = await model.generateContent([
      {
        text: '分析这张穿搭照片，直接返回 JSON 格式数据（不要包含 Markdown 格式），包含以下字段：\n' +
              '{\n' +
              '  "scores": {\n' +
              '    "overall": "总体评分（1-10分）",\n' +
              '    "style": "风格统一度评分（1-10分）",\n' +
              '    "practicality": "实用性评分（1-10分）"\n' +
              '  },\n' +
              '  "advantages": ["优点1", "优点2", "优点3"],\n' +
              '  "recommendations": ["建议1", "建议2", "建议3"],\n' +
              '  "occasions": ["场合1", "场合2", "场合3"]\n' +
              '}\n\n' +
              '注意：\n' +
              '1. 直接返回 JSON 数据，不要包含任何其他文本或格式\n' +
              '2. 评分必须是 1-10 的数字\n' +
              '3. 数组至少包含 2 项，最多 3 项'
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
      if (!analysis.scores || !analysis.advantages || !analysis.recommendations || !analysis.occasions) {
        throw new Error('响应格式不正确')
      }
      
      return NextResponse.json({ analysis })
    } catch (parseError) {
      console.error('JSON 解析错误:', parseError)
      // 如果 JSON 解析失败，返回原始文本
      return NextResponse.json({ 
        analysis: {
          scores: { overall: 0, style: 0, practicality: 0 },
          advantages: [content],
          recommendations: [],
          occasions: []
        }
      })
    }
  } catch (error) {
    console.error('分析错误:', error)
    return NextResponse.json(
      { error: '分析失败，请重试' },
      { status: 500 }
    )
  }
} 