import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 创建一个单例的 Gemini 客户端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

async function generateStyleDescription(imageData: Buffer): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not configured')
  }

  const prompt = `作为一位专业的时尚搭配分析师，请详细分析这张图片中的穿搭，包含以下要点：

1. 基本信息
- 性别和大致年龄段
- 体型特征
- 肤色和气质特点

2. 服装细节
- 上装：类型、材质、颜色、剪裁特点
- 下装：类型、材质、颜色、剪裁特点
- 外套/配搭：类型、材质、颜色（如果有）
- 鞋子：款式、颜色、材质

3. 配饰细节
- 包包、围巾、帽子等配饰的描述
- 首饰和其他装饰品

4. 风格定位
- 整体风格类型（如：简约、优雅、休闲、街头等）
- 适合的场合
- 季节特征

5. 色彩搭配
- 主色调
- 配色方案
- 色彩协调性

请用专业且详细的中文描述，确保信息完整且精确。重点关注能帮助进行相似搭配推荐的特征。`

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData.toString('base64')
        }
      }
    ])
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('生成风格描述失败:', error)
    throw new Error('生成风格描述失败')
  }
}

async function analyzeOutfit(styleDescription: string): Promise<any> {
  const prompt = `作为一位专业的时尚搭配分析师，请根据以下穿搭描述进行深入分析。返回一个JSON对象，包含以下字段：

{
  "scores": {
    "overall": 8,
    "style": 7,
    "practicality": 9,
    "creativity": 6,
    "colorMatch": 8
  },
  "styleAnalysis": {
    "mainStyle": "主要风格定位",
    "subStyle": "次要风格元素",
    "seasonality": "适合季节",
    "colorScheme": "配色方案",
    "keyElements": ["关键单品/元素数组"]
  },
  "advantages": ["搭配优点数组(3-5点)"],
  "recommendations": ["改进建议数组(3-5点)"],
  "occasions": ["适合场合数组(2-3个)"],
  "matchingTags": ["用于搜索匹配的关键标签数组，包括风格、单品、颜色等特征"]
}

描述内容：${styleDescription}

请确保所有分数字段都是1-10之间的数字（不是字符串），并且matchingTags要包含足够的关键词以便进行精确的搭配推荐。只返回JSON数据，不要包含任何其他格式标记或说明文字。`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const analysisText = response.text().trim()

  try {
    const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim()
    const analysis = JSON.parse(cleanJson)
    
    // 确保所有分数都是数字类型
    const scores = analysis.scores
    analysis.scores = {
      overall: Number(scores.overall) || 7,
      style: Number(scores.style) || 7,
      practicality: Number(scores.practicality) || 7,
      creativity: Number(scores.creativity) || 7,
      colorMatch: Number(scores.colorMatch) || 7
    }
    
    return analysis
  } catch (error) {
    console.error('解析JSON失败:', analysisText)
    throw new Error('分析结果格式错误')
  }
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

    // 读取图片数据
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成风格描述
    const styleDescription = await generateStyleDescription(buffer)

    // 分析穿搭
    const analysis = await analyzeOutfit(styleDescription)
      
    return NextResponse.json({ 
      analysis,
      styleDescription
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分析失败，请重试' },
      { status: 500 }
    )
  }
} 