import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// 获取日期的年月日字符串 YYYY-MM-DD
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)

    const { zodiac_sign, name, date, weather, gender, blood_type } = body

    // 验证必填字段
    if (!zodiac_sign || !date || !weather || !gender || !blood_type || !name) {
      console.log('Missing required fields:', { zodiac_sign, name, date, weather, gender, blood_type })
      return NextResponse.json({ error: '请填写所有必填信息' }, { status: 400 })
    }

    // 验证日期
    const today = getDateString(new Date())
    const maxDate = getDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

    if (date < today) {
      return NextResponse.json({ error: '不能选择过去的日期' }, { status: 400 })
    }
    if (date > maxDate) {
      return NextResponse.json({ error: '只能预测未来30天内的运势' }, { status: 400 })
    }

    // 验证姓名长度
    if (name.length > 20) {
      return NextResponse.json({ error: '姓名长度应在1-20个字符之间' }, { status: 400 })
    }

    const prompt = `作为一位专业的占星师，请为以下用户生成${date}的运势预测：

用户信息：
- 星座：${zodiac_sign}
- 性别：${gender}
- 血型：${blood_type}型
- 姓名：${name}
- 当天天气：${weather}

请从以下方面进行预测：
1. 整体运势（考虑天气对心情的影响）
2. 爱情运势（根据性别和血型特点）
3. 事业学业（结合性格特点）
4. 财运（考虑日期和天气因素）
5. 人际关系（基于血型特征）
6. 幸运色（根据当天天气推荐）
7. 幸运数字（基于生辰八字）
8. 特别建议（个性化建议）

请用简短优美的语言描述，并注重个性化内容。`

    console.log('Sending request to Gemini API with prompt:', prompt)

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error:', errorData)
      throw new Error(errorData.error?.message || 'API 请求失败')
    }

    const data = await response.json()
    console.log('Gemini API Response:', data)

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('API 返回数据格式不正确')
    }

    return NextResponse.json({ prediction: data.candidates[0].content.parts[0].text })
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: (error as Error).message || '生成预测时发生错误' },
      { status: 500 }
    )
  }
} 