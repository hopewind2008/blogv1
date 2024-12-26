import { NextResponse } from 'next/server'

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
    const base64Image = buffer.toString('base64')

    // 调用 Gemini API 分析图片
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=AIzaSyCiZNOlYHtzgCSiGHRRhXoyd93_DirDSbo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'Please analyze this image and provide a JSON response with the following structure: {"scores":{"overall":number,"style":number,"practicality":number},"advantages":string[],"recommendations":string[],"occasions":string[]}. The scores should be between 1-10, advantages should list 3-5 positive points, recommendations should provide 3-5 suggestions, and occasions should list 2-3 suitable scenarios. Please respond with ONLY the JSON object, no additional text.'
              },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 2048,
            candidateCount: 1,
            stopSequences: ["}"]
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('API 错误:', error)
      
      if (error.error?.status === 'PERMISSION_DENIED') {
        throw new Error('API 密钥无效或已过期')
      }
      
      if (error.error?.message?.includes('SAFETY')) {
        throw new Error('图片内容不符合安全策略，请尝试上传其他图片')
      }
      
      throw new Error(error.error?.message || 'API 请求失败')
    }

    const data = await response.json()
    console.log('原始响应:', data)

    if (data.promptFeedback?.safetyRatings?.some(r => r.probability === 'HIGH')) {
      throw new Error('图片内容不符合安全策略，请尝试上传其他图片')
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('无效的响应格式')
    }

    const content = data.candidates[0].content.parts[0].text
    console.log('API 返回文本:', content)

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