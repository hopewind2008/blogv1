import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// 确保上传目录存在
const uploadDir = join(process.cwd(), 'uploads')
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
}

// 服装标签字典
const CLOTHING_ITEMS = {
  'gown': '礼服',
  'jean': '牛仔裤',
  'sarong': '纱笼',
  'dress': '连衣裙',
  'suit': '西装',
  'jacket': '夹克',
  'shirt': '衬衫',
  'skirt': '裙子',
  't-shirt': 'T恤',
  'sweater': '毛衣',
  'coat': '外套',
  'pants': '裤子'
}

// 材质关键词
const MATERIAL_KEYWORDS = {
  'wool': '羊毛',
  'woolen': '羊毛',
  'velvet': '天鹅绒',
  'fur': '皮草',
  'denim': '牛仔布',
  'silk': '丝绸',
  'cotton': '棉质',
  'leather': '皮革'
}

// 过滤服装项目
function filterClothingItems(predictions: any[], confidenceThreshold = 0.05) {
  const filteredItems = []
  for (const pred of predictions) {
    const label = pred.label.toLowerCase()
    const score = pred.score

    for (const [eng, chn] of Object.entries(CLOTHING_ITEMS)) {
      if (label.includes(eng) && score > confidenceThreshold) {
        filteredItems.push({
          item: chn,
          confidence: score,
          original_label: label
        })
        break
      }
    }
  }

  return filteredItems.sort((a, b) => b.confidence - a.confidence)
}

// 获取项目权重
function getItemWeight(label: string) {
  const weights: { [key: string]: number } = {
    'fur coat': 2.0,
    'stole': 1.8,
    'wool': 1.8,
    'velvet': 1.8,
    'jean': 1.5,
    'dress': 2.0,
    'suit': 2.0,
    'jacket': 1.8,
    'shirt': 1.5,
    'pants': 1.5,
    'skirt': 1.5,
    'shoes': 1.5
  }

  for (const [key, weight] of Object.entries(weights)) {
    if (label.toLowerCase().includes(key)) {
      return weight
    }
  }
  return 1.2
}

// 生成建议
function generateRecommendations(scores: any, detectedItems: any[]) {
  const recommendations = []

  if (scores.overall < 0.6) {
    recommendations.push("建议重新搭配整体造型，注意色彩和款式的协调")
  } else if (scores.overall < 0.8) {
    recommendations.push("整体搭配不错，可以在细节上继续优化")
  }

  if (scores.style < 0.6) {
    recommendations.push("建议选择风格更加统一的单品，避免风格混搭")
  } else if (scores.style < 0.8) {
    recommendations.push("可以通过配饰来加强整体风格的统一性")
  }

  if (scores.practicality < 0.6) {
    recommendations.push("建议考虑日常实用性，选择更易搭配的单品")
  } else if (scores.practicality < 0.8) {
    recommendations.push("可以适当增加一些百搭单品来提升实用性")
  }

  for (const item of detectedItems) {
    const label = item.original_label.toLowerCase()
    if (label.includes('fur') || label.includes('wool')) {
      recommendations.push("注意保暖单品与整体搭配的平衡")
    } else if (label.includes('jean')) {
      recommendations.push("牛仔单品可以搭配更多休闲元素")
    } else if (label.includes('velvet')) {
      recommendations.push("丝绒面料建议搭配简约款式，避免过于复杂")
    }
  }

  return recommendations.slice(0, 3)
}

// 建议场合
function suggestOccasions(scores: any, detectedItems: any[]) {
  const occasions = new Set<string>()

  for (const item of detectedItems) {
    const label = item.original_label.toLowerCase()

    if (label.includes('fur') || label.includes('velvet')) {
      occasions.add("正式场合")
      occasions.add("晚宴")
    } else if (label.includes('wool')) {
      occasions.add("商务场合")
      occasions.add("日常通勤")
    } else if (label.includes('jean')) {
      occasions.add("休闲场合")
      occasions.add("日常生活")
    }
  }

  if (scores.overall >= 0.8) {
    occasions.add("重要社交场合")
  }
  if (scores.practicality >= 0.7) {
    occasions.add("日常活动")
  }

  return Array.from(occasions).slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { error: '未找到图片' },
        { status: 400 }
      )
    }

    // 保存图片
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path = join(uploadDir, image.name)
    await writeFile(path, buffer)

    // 调用 Hugging Face API
    const imageBase64 = buffer.toString('base64')
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/resnet-50",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: imageBase64
        })
      }
    )

    if (!response.ok) {
      throw new Error('API 调用失败')
    }

    const predictions = await response.json()
    
    // 过滤并分析结果
    const detectedItems = filterClothingItems(predictions)
    
    // 计算评分
    const scores = {
      overall: 0.75,  // 示例评分，实际应该基于更复杂的算法
      style: 0.8,
      practicality: 0.7
    }

    // 生成建议和场合
    const recommendations = generateRecommendations(scores, detectedItems)
    const occasions = suggestOccasions(scores, detectedItems)

    return NextResponse.json({
      detected_items: detectedItems,
      scores,
      recommendations,
      occasions
    })

  } catch (error) {
    console.error('分析错误:', error)
    return NextResponse.json(
      { error: '分析失败' },
      { status: 500 }
    )
  }
} 