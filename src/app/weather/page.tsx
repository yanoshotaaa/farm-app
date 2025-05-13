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
  const [location, setLocation] = useState({
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
  }, [location])

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
    <div>
      <div className="mb-8">
        <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">天気予報</h1>
      </div>

      {loading && !currentWeather ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">天気データを取得中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">エラーが発生しました</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchWeatherData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      ) : (
        <div>
          {currentWeather && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">現在の天気</h2>
                <span className="text-sm text-gray-500">
                  {new Date(currentWeather.date).toLocaleString('ja-JP')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">
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
                    <p className="text-4xl font-bold text-gray-800">
                      {currentWeather.temperature}°C
                    </p>
                    <p className="text-gray-600 capitalize">{currentWeather.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">湿度</p>
                    <p className="text-xl font-semibold">{currentWeather.humidity}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">風速</p>
                    <p className="text-xl font-semibold">{currentWeather.windSpeed} m/s</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">降水量</p>
                    <p className="text-xl font-semibold">{currentWeather.precipitation} mm</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">農作業アドバイス</h3>
                <p className="text-green-700">{getWeatherAdvice(currentWeather)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {forecast.map((day) => (
              <div key={day.date} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {new Date(day.date).toLocaleDateString('ja-JP', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-3xl">
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
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">{day.temperature.max}°C</span>
                  <span className="text-blue-600">{day.temperature.min}°C</span>
                </div>
                {day.precipitation > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    降水量: {day.precipitation}mm
                  </p>
                )}
                <div className="mt-2 text-sm text-green-700">
                  {getWeatherAdvice(day)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">注意事項</h2>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              <li>天気予報は目安です。実際の天候は変動する可能性があります。</li>
              <li>農作業の判断は、実際の天候や作物の状態を確認してから行ってください。</li>
              <li>急な天候の変化に備えて、作業計画に余裕を持たせることをお勧めします。</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 