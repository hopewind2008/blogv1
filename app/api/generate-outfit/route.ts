import { NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY)

// 重试函数
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      console.log(`重试第 ${i + 1} 次...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('超过最大重试次数')
}

export async function POST(request: Request) {
  try {
    const { prompt, imageUrl } = await request.json()

    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { error: '请提供生成提示和原始图片' },
        { status: 400 }
      )
    }

    // 从 base64 URL 获取图片数据
    const base64Data = imageUrl.split(',')[1]
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // 构建详细的提示词
    const basePrompt = `
      A young Asian woman in a fashionable outfit,
      full body shot, professional fashion photography,
      high quality, detailed clothing texture,
      soft studio lighting, clean white background
    `.trim().replace(/\s+/g, ' ')

    const stylePrompt = `
      (high detailed skin:1.2), (sharp focus:1.2),
      (professional lighting:1.3), (high quality:1.2),
      fashion magazine style, elegant pose
    `.trim().replace(/\s+/g, ' ')

    const negativePrompt = `
      deformed, distorted, disfigured, poor quality,
      bad anatomy, bad proportions, extra limbs,
      duplicate, morbid, mutilated, poorly drawn face,
      mutation, mutated, extra fingers, poorly drawn hands,
      missing limbs, disconnected limbs, out of frame,
      watermark, text, logo, signature
    `.trim().replace(/\s+/g, ' ')

    // 组合提示词
    const finalPrompt = `${basePrompt}, ${prompt}, ${stylePrompt}`

    // 调用 Stable Diffusion 的 img2img 接口
    const response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: {
            image: imageBuffer.toString('base64'),
            prompt: finalPrompt,
            negative_prompt: negativePrompt,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            strength: 0.7,  // 控制对原图的修改程度
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 请求失败: ${response.statusText}. ${errorText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')
    const image_url = `data:image/jpeg;base64,${base64Image}`

    return NextResponse.json({ image_url })
  } catch (error) {
    console.error('生成错误:', error)
    return NextResponse.json(
      { error: '生成失败，请重试。错误信息：' + (error as Error).message },
      { status: 500 }
    )
  }
} 