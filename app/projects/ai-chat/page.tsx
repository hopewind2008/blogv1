'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { LoadingSpinner } from '@/components/ui/loading'
import { Moon, Sun, Star, Wand2 } from 'lucide-react'
import Image from 'next/image'
import './styles.css'

const ZODIAC_SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", 
  "狮子座", "处女座", "天秤座", "天蝎座",
  "射手座", "摩羯座", "水瓶座", "双鱼座"
]

const WEATHER_OPTIONS = ["晴天", "多云", "阴天", "小雨", "大雨", "雪"]
const BLOOD_TYPES = ["A", "B", "O", "AB"]
const GENDERS = ["男", "女"]

// 获取当前日期，格式化为 YYYY-MM-DD
const getCurrentDate = () => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

export default function AiChatPage() {
  const [selectedSign, setSelectedSign] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    date: getCurrentDate(), // 设置默认日期为当前日期
    weather: "",
    gender: "",
    bloodType: ""
  })

  const handleSubmit = async () => {
    if (!selectedSign || !formData.name || !formData.date || 
        !formData.weather || !formData.gender || !formData.bloodType) {
      alert("请填写所有必填信息")
      return
    }

    setLoading(true)
    try {
      const requestData = {
        zodiac_sign: selectedSign,
        name: formData.name,
        date: formData.date,
        weather: formData.weather,
        gender: formData.gender,
        blood_type: formData.bloodType
      }

      const response = await fetch("/api/horoscope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      
      if (response.ok) {
        setPrediction(data.prediction)
      } else {
        throw new Error(data.error || "获取预测失败")
      }
    } catch (error) {
      console.error('API Error:', error)
      alert("获取运势预测失败: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white pb-8 md:pb-16 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-black opacity-50" />
      <div className="absolute inset-0">
        <Image
          src="/images/ai-chat-bg.jpg"
          alt="AI Chat Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>
      <Navigation />
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 relative">
        <div className="max-w-3xl mx-auto">
          <div className="mystical-card backdrop-blur-md bg-black/30">
            <div className="card-content">
              <div className="flex justify-center mb-6 md:mb-8">
                <Image
                  src="/images/ai-chat-logo.jpeg"
                  alt="AI Chat Logo"
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-purple-500/30 md:w-[120px] md:h-[120px] object-cover"
                />
              </div>
              <h1 className="text-center mb-6 md:mb-8 flex items-center justify-center gap-2 md:gap-4 text-xl md:text-3xl">
                <Moon className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  星座运势占卜
                </span>
                <Sun className="h-6 w-6 md:h-8 md:w-8 text-pink-400" />
              </h1>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 md:mb-3 text-purple-300">选择星座</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                  {ZODIAC_SIGNS.map((sign) => (
                    <button
                      key={sign}
                      onClick={() => setSelectedSign(sign)}
                      className={`mystical-btn text-sm md:text-base ${selectedSign === sign ? "selected" : ""}`}
                    >
                      <span className="btn-content">
                        <Star className="h-3 w-3 md:h-4 md:w-4" />
                        {sign}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium mb-2 text-purple-300">姓名</label>
                <input
                  type="text"
                  className="w-full bg-black/30 border border-purple-500/30 rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">选择日期</label>
                  <input
                    type="date"
                    className="w-full bg-black/30 border border-purple-500/30 rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date().toISOString().split("T")[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">天气</label>
                  <select
                    className="w-full bg-black/30 border border-purple-500/30 rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    value={formData.weather}
                    onChange={(e) => setFormData({...formData, weather: e.target.value})}
                  >
                    <option value="">请选择天气</option>
                    {WEATHER_OPTIONS.map((weather) => (
                      <option key={weather} value={weather}>{weather}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">性别</label>
                  <select
                    className="w-full bg-black/30 border border-purple-500/30 rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">请选择性别</option>
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">血型</label>
                  <select
                    className="w-full bg-black/30 border border-purple-500/30 rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    value={formData.bloodType}
                    onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                  >
                    <option value="">请选择血型</option>
                    {BLOOD_TYPES.map((type) => (
                      <option key={type} value={type}>{type}型</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-center mb-6 md:mb-8">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedSign || !formData.name || !formData.date || 
                           !formData.weather || !formData.gender || !formData.bloodType}
                  className="fortune-btn text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">解读星象中...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      开始运势测算
                    </>
                  )}
                </button>
              </div>

              {prediction && (
                <div className="prediction-content bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 md:p-6">
                  <h3 className="text-center mb-3 md:mb-4 text-lg md:text-xl">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {selectedSign}的运势预测
                    </span>
                  </h3>
                  <div className="whitespace-pre-line text-gray-300 text-sm md:text-base">{prediction}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 