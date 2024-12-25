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

    // 调用 Stable Diffusion API 生成图片
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: `Generate a fashion outfit image based on this description: ${prompt}. The image should be stylish, aesthetic, and well-coordinated.`,
          parameters: {
            num_inference_steps: 30,
            guidance_scale: 7.5,
            negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API 请求失败')
    }

    // Stable Diffusion API 返回二进制图片数据
    const imageBuffer = await response.arrayBuffer()
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