'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface WeatherData {
  date: string
  temperature: number
  humidity: number
  description: string
  icon: string
  precipitation: number
  windSpeed: number
  feelsLike: number
}

interface ForecastData {
  date: string
  temperature: {
    min: number
    max: number
  }
  description: string
  icon: string
  precipitation: number
}

type WeatherInfo = WeatherData | ForecastData

export default function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location] = useState({
    lat: process.env.NEXT_PUBLIC_DEFAULT_LAT || '35.6762',
    lon: process.env.NEXT_PUBLIC_DEFAULT_LON || '139.6503'
  })

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Open-Meteo APIを使用して天気データを取得
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FTokyo`
      )

      if (!response.ok) {
        throw new Error(`天気データの取得に失敗しました。（エラーコード: ${response.status}）`)
      }

      const data = await response.json()

      // 現在の天気データを整形
      const currentHour = new Date().getHours()
      const currentIndex = data.hourly.time.findIndex((time: string) => 
        new Date(time).getHours() === currentHour
      )

      // 天気コードから天気の説明とアイコンを取得
      const getWeatherInfo = (code: number) => {
        const weatherMap: { [key: number]: { description: string, icon: string } } = {
          0: { description: '晴れ', icon: 'clear' },
          1: { description: 'ほぼ晴れ', icon: 'partly-cloudy' },
          2: { description: '一部曇り', icon: 'partly-cloudy' },
          3: { description: '曇り', icon: 'cloudy' },
          45: { description: '霧', icon: 'fog' },
          48: { description: '霧氷', icon: 'fog' },
          51: { description: '小雨', icon: 'rain' },
          53: { description: '雨', icon: 'rain' },
          55: { description: '強い雨', icon: 'rain' },
          61: { description: '小雨', icon: 'rain' },
          63: { description: '雨', icon: 'rain' },
          65: { description: '強い雨', icon: 'rain' },
          71: { description: '小雪', icon: 'snow' },
          73: { description: '雪', icon: 'snow' },
          75: { description: '強い雪', icon: 'snow' },
          77: { description: '霧雪', icon: 'snow' },
          80: { description: '小雨', icon: 'rain' },
          81: { description: '雨', icon: 'rain' },
          82: { description: '強い雨', icon: 'rain' },
          85: { description: '小雪', icon: 'snow' },
          86: { description: '強い雪', icon: 'snow' },
          95: { description: '雷雨', icon: 'thunderstorm' },
          96: { description: '雷を伴う雪', icon: 'thunderstorm' },
          99: { description: '強い雷雨', icon: 'thunderstorm' }
        }
        return weatherMap[code] || { description: '不明', icon: 'unknown' }
      }

      const currentWeatherCode = data.hourly.weather_code[currentIndex]
      const weatherInfo = getWeatherInfo(currentWeatherCode)

      setCurrentWeather({
        date: new Date().toISOString(),
        temperature: Math.round(data.hourly.temperature_2m[currentIndex]),
        humidity: Math.round(data.hourly.relative_humidity_2m[currentIndex]),
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        precipitation: Math.round(data.hourly.precipitation[currentIndex] * 10) / 10,
        windSpeed: Math.round(data.hourly.wind_speed_10m[currentIndex] * 10) / 10,
        feelsLike: Math.round(data.hourly.temperature_2m[currentIndex]) // Open-Meteoでは体感温度がないため、気温を使用
      })

      // 予報データを整形
      const dailyForecasts: ForecastData[] = data.daily.time.map((date: string, index: number) => {
        const weatherCode = data.daily.weather_code[index]
        const weatherInfo = getWeatherInfo(weatherCode)
        return {
          date,
          temperature: {
            max: Math.round(data.daily.temperature_2m_max[index]),
            min: Math.round(data.daily.temperature_2m_min[index])
          },
          description: weatherInfo.description,
          icon: weatherInfo.icon,
          precipitation: Math.round(data.daily.precipitation_sum[index] * 10) / 10
        }
      })

      setForecast(dailyForecasts)
    } catch (err) {
      console.error('天気データ取得エラー:', err)
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
    // 1時間ごとにデータを更新
    const interval = setInterval(fetchWeatherData, 3600000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherAdvice = (weather: WeatherInfo) => {
    let temp: number
    if ('feelsLike' in weather) {
      // WeatherDataの場合
      temp = weather.temperature
    } else {
      // ForecastDataの場合
      temp = weather.temperature.max
    }
    const desc = weather.description.toLowerCase()

    if (desc.includes('雨') || desc.includes('雪')) {
      return '雨や雪の予報です。農作業は控えめにし、必要に応じて防除対策を行いましょう。'
    }
    if (temp > 30) {
      return '高温注意です。作物の水やりを十分に行い、日中の作業は控えめにしましょう。'
    }
    if (temp < 5) {
      return '低温注意です。作物の保温対策を行いましょう。'
    }
    if (desc.includes('晴')) {
      return '晴れの予報です。適切な水やりと日除け対策を行いましょう。'
    }
    return '通常通りの農作業が可能です。'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーナビゲーション */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg w-10 h-10 flex items-center justify-center shadow-sm">
                  <span className="text-xl font-bold tracking-tight">Y</span>
                </div>
                <div className="ml-3">
                  <span className="text-lg font-semibold text-gray-900">農場管理システム</span>
                  <span className="ml-2 text-sm text-gray-500">Enterprise Edition</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/crops" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  作物管理
                </Link>
                <Link href="/harvest" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  収穫予測
                </Link>
                <Link href="/weather" className="text-emerald-600 font-medium px-3 py-2 text-sm border-b-2 border-emerald-600">
                  気象情報
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">気象情報</h1>
              <p className="mt-1 text-sm text-gray-500">リアルタイムの天気予報と農作業アドバイス</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">最終更新: {new Date().toLocaleString('ja-JP')}</span>
              <button
                onClick={fetchWeatherData}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                更新
              </button>
            </div>
          </div>
        </div>

        {loading && !currentWeather ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">天気データを取得中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mt-4 mb-2">エラーが発生しました</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchWeatherData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {currentWeather && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">現在の天気</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(currentWeather.date).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      リアルタイム
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center space-x-6">
                      <div className="text-7xl transform hover:scale-110 transition-transform">
                        {currentWeather.icon === 'clear' && '☀️'}
                        {currentWeather.icon === 'partly-cloudy' && '⛅'}
                        {currentWeather.icon === 'cloudy' && '☁️'}
                        {currentWeather.icon === 'fog' && '🌫️'}
                        {currentWeather.icon === 'rain' && '🌧️'}
                        {currentWeather.icon === 'snow' && '🌨️'}
                        {currentWeather.icon === 'thunderstorm' && '⛈️'}
                        {currentWeather.icon === 'unknown' && '❓'}
                      </div>
                      <div>
                        <p className="text-5xl font-bold text-gray-900">
                          {currentWeather.temperature}°C
                        </p>
                        <p className="text-xl text-gray-600 mt-1 capitalize">{currentWeather.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-600">湿度</p>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">{currentWeather.humidity}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <p className="text-sm font-medium text-gray-600">風速</p>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">{currentWeather.windSpeed} m/s</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <p className="text-sm font-medium text-gray-600">降水量</p>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">{currentWeather.precipitation} mm</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-start space-x-3">
                      <svg className="h-6 w-6 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-800">農作業アドバイス</h3>
                        <p className="text-emerald-700 mt-1">{getWeatherAdvice(currentWeather)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {forecast.map((day) => (
                <div key={day.date} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {new Date(day.date).toLocaleDateString('ja-JP', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        予報
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-4xl transform hover:scale-110 transition-transform">
                        {day.icon === 'clear' && '☀️'}
                        {day.icon === 'partly-cloudy' && '⛅'}
                        {day.icon === 'cloudy' && '☁️'}
                        {day.icon === 'fog' && '🌫️'}
                        {day.icon === 'rain' && '🌧️'}
                        {day.icon === 'snow' && '🌨️'}
                        {day.icon === 'thunderstorm' && '⛈️'}
                        {day.icon === 'unknown' && '❓'}
                      </div>
                      <span className="text-gray-600 capitalize">{day.description}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="text-red-600 font-medium">{day.temperature.max}°C</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-blue-600 font-medium">{day.temperature.min}°C</span>
                      </div>
                    </div>
                    {day.precipitation > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>降水量: {day.precipitation}mm</span>
                      </div>
                    )}
                    <div className="text-sm text-emerald-700 bg-emerald-50 rounded p-2">
                      {getWeatherAdvice(day)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <svg className="h-6 w-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h2 className="text-lg font-semibold text-yellow-800 mb-2">注意事項</h2>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    <li>天気予報は目安です。実際の天候は変動する可能性があります。</li>
                    <li>農作業の判断は、実際の天候や作物の状態を確認してから行ってください。</li>
                    <li>急な天候の変化に備えて、作業計画に余裕を持たせることをお勧めします。</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 