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

    // 调用生成 API
    const response = await fetch('https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HF_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.statusText}`)
    }

    const result = await response.json()
    return NextResponse.json({ result })
  } catch (error) {
    console.error('生成错误:', error)
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    )
  }
} 