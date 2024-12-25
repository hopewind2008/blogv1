import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供生成提示' },
        { status: 400 }
      )
    }

    if (!process.env.HUGGING_FACE_API_KEY) {
      throw new Error('Hugging Face API key not configured')
    }

    console.log('开始生成图片，提示词:', prompt)

    // 调用 Hugging Face API 生成图片
    const response = await fetch(
      'https://api-inference.huggingface.co/models/prompthero/openjourney',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: `fashion photography of outfit with ${prompt}, professional studio lighting, high resolution, detailed fabric texture, fashion magazine style, mdjrny-v4 style`,
          wait_for_model: true,
          use_cache: false
        })
      }
    )

    console.log('API 响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API 错误响应:', errorText)
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(errorJson.error || 'API 请求失败')
      } catch {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
      }
    }

    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    console.log('响应内容类型:', contentType)

    if (contentType?.includes('application/json')) {
      const jsonResponse = await response.json()
      console.error('收到 JSON 响应而不是图片:', jsonResponse)
      throw new Error('API 返回了无效的响应格式')
    }

    // API 返回二进制图片数据
    const imageBuffer = await response.arrayBuffer()
    console.log('获取到图片数据，大小:', imageBuffer.byteLength)

    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const imageUrl = `data:image/jpeg;base64,${base64Image}`

    return NextResponse.json({ image_url: imageUrl })
  } catch (error) {
    console.error('生成错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败，请重试' },
      { status: 500 }
    )
  }
} 