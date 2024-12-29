'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function SearchPage() {
  const [query, setQuery] = useState('时尚穿搭')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/test-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 text-transparent bg-clip-text transform hover:scale-105 transition-transform duration-200">
          AI 穿搭分析
        </h1>
        <p className="text-gray-600 text-lg font-light tracking-wide">
          探索你的专属时尚灵感
        </p>
      </div>
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex gap-4 shadow-lg rounded-full overflow-hidden bg-white p-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入搜索关键词..."
            className="flex-1 px-6 py-3 border-none focus:outline-none text-lg"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-all duration-200 font-medium"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-200">
              <div className="relative h-80">
                <Image
                  src={item.image.thumbnailLink}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-3 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">来源: {item.displayLink}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {item.image.width} x {item.image.height}
                  </span>
                  <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                    评分: {item.score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 