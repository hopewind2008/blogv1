import { NextResponse } from 'next/server'

const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

    let lastError = null
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // 调用 Hugging Face API 生成图片
        const response = await fetch(
          'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
            },
            body: JSON.stringify({
              inputs: `ultra realistic fashion photography, full body shot of a model wearing: ${prompt}. Professional studio lighting, high resolution, detailed fabric texture, fashion magazine style, Vogue aesthetic, clean background, 8k uhd, highly detailed`,
              parameters: {
                num_inference_steps: 50,
                guidance_scale: 7.5,
                negative_prompt: "low quality, blurry, distorted, deformed, disfigured, bad anatomy, watermark, signature, poorly drawn, amateur"
              },
              wait_for_model: true
            })
          }
        )

        console.log(`尝试 ${attempt}/${MAX_RETRIES} - API 响应状态:`, response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`尝试 ${attempt}/${MAX_RETRIES} - API 错误响应:`, errorText)
          
          // 检查是否是模型加载错误
          if (errorText.includes('loading') || errorText.includes('starting')) {
            console.log('模型正在加载，等待重试...')
            await sleep(RETRY_DELAY)
            continue
          }
          
          try {
            const errorJson = JSON.parse(errorText)
            throw new Error(errorJson.error || 'API 请求失败')
          } catch {
            throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
          }
        }

        // 检查响应内容类型
        const contentType = response.headers.get('content-type')
        console.log(`尝试 ${attempt}/${MAX_RETRIES} - 响应内容类型:`, contentType)

        if (contentType?.includes('application/json')) {
          const jsonResponse = await response.json()
          console.error('收到 JSON 响应而不是图片:', jsonResponse)
          
          // 如果是模型加载消息，继续重试
          if (jsonResponse.error?.includes('loading') || jsonResponse.error?.includes('starting')) {
            console.log('模型正在加载，等待重试...')
            await sleep(RETRY_DELAY)
            continue
          }
          
          throw new Error('API 返回了无效的响应格式')
        }

        // API 返回二进制图片数据
        const imageBuffer = await response.arrayBuffer()
        console.log(`尝试 ${attempt}/${MAX_RETRIES} - 获取到图片数据，大小:`, imageBuffer.byteLength)

        const base64Image = Buffer.from(imageBuffer).toString('base64')
        const imageUrl = `data:image/jpeg;base64,${base64Image}`

        return NextResponse.json({ image_url: imageUrl })
      } catch (error) {
        console.error(`尝试 ${attempt}/${MAX_RETRIES} - 错误:`, error)
        lastError = error
        
        if (attempt < MAX_RETRIES) {
          console.log(`等待 ${RETRY_DELAY}ms 后重试...`)
          await sleep(RETRY_DELAY)
        }
      }
    }

    // 如果所有重试都失败了
    throw lastError || new Error('生成图片失败')
  } catch (error) {
    console.error('生成错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败，请重试' },
      { status: 500 }
    )
  }
} 