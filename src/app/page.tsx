'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Crop {
  id: number
  name: string
  variety: string
  plantingDate: string
  status: string
  records?: Array<{
    date: string
    activity: string
    notes: string
  }>
}

interface WeatherData {
  temperature: number
  description: string
  icon: string
}

export default function HomePage() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 認証チェック
  useEffect(() => {
    const isAuth = localStorage.getItem('farmapp_auth') === 'true'
    if (!isAuth) {
      router.push('/login')
    }
  }, [])

  // 作物データの取得と更新を監視する関数
  const fetchCrops = () => {
    const storedCrops = localStorage.getItem('crops')
    if (storedCrops) {
      setCrops(JSON.parse(storedCrops))
    }
  }

  useEffect(() => {
    // 初回データ取得
    fetchCrops()

    // localStorageの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'crops') {
        fetchCrops()
      }
    }

    // 定期的な更新チェック（5秒ごと）
    const interval = setInterval(fetchCrops, 5000)

    // イベントリスナーの設定
    window.addEventListener('storage', handleStorageChange)

    // クリーンアップ
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // 天気データの取得
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&hourly=temperature_2m,weather_code&timezone=Asia%2FTokyo`
        )
        if (!response.ok) throw new Error('天気データの取得に失敗しました')
        
        const data = await response.json()
        const currentHour = new Date().getHours()
        const currentIndex = data.hourly.time.findIndex((time: string) => 
          new Date(time).getHours() === currentHour
        )

        const getWeatherInfo = (code: number) => {
          const weatherMap: { [key: number]: { description: string, icon: string } } = {
            0: { description: '晴れ', icon: '☀️' },
            1: { description: 'ほぼ晴れ', icon: '⛅' },
            2: { description: '一部曇り', icon: '⛅' },
            3: { description: '曇り', icon: '☁️' },
            45: { description: '霧', icon: '🌫️' },
            48: { description: '霧氷', icon: '🌫️' },
            51: { description: '小雨', icon: '🌧️' },
            53: { description: '雨', icon: '🌧️' },
            55: { description: '強い雨', icon: '🌧️' },
            61: { description: '小雨', icon: '🌧️' },
            63: { description: '雨', icon: '🌧️' },
            65: { description: '強い雨', icon: '🌧️' },
            71: { description: '小雪', icon: '🌨️' },
            73: { description: '雪', icon: '🌨️' },
            75: { description: '強い雪', icon: '🌨️' },
            77: { description: '霧雪', icon: '🌨️' },
            80: { description: '小雨', icon: '🌧️' },
            81: { description: '雨', icon: '🌧️' },
            82: { description: '強い雨', icon: '🌧️' },
            85: { description: '小雪', icon: '🌨️' },
            86: { description: '強い雪', icon: '🌨️' },
            95: { description: '雷雨', icon: '⛈️' },
            96: { description: '雷を伴う雪', icon: '⛈️' },
            99: { description: '強い雷雨', icon: '⛈️' }
          }
          return weatherMap[code] || { description: '不明', icon: '❓' }
        }

        const weatherCode = data.hourly.weather_code[currentIndex]
        const weatherInfo = getWeatherInfo(weatherCode)
        
        setWeather({
          temperature: Math.round(data.hourly.temperature_2m[currentIndex]),
          description: weatherInfo.description,
          icon: weatherInfo.icon
        })
      } catch (error) {
        console.error('天気データの取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case '育苗中':
        return 'bg-blue-100 text-blue-800'
      case '定植済み':
        return 'bg-green-100 text-green-800'
      case '収穫中':
        return 'bg-yellow-100 text-yellow-800'
      case '収穫完了':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecentActivities = () => {
    const allRecords = crops.flatMap(crop => 
      (crop.records || []).map(record => ({
        ...record,
        cropName: crop.name
      }))
    )
    return allRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }

  // 作物の状態に応じたアイコンを取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '育苗中':
        return '🌱'
      case '定植済み':
        return '🌿'
      case '収穫中':
        return '🌾'
      case '収穫完了':
        return '✅'
      default:
        return '📝'
    }
  }

  // 作物の栽培日数を計算
  const getDaysSincePlanting = (plantingDate: string) => {
    const planting = new Date(plantingDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - planting.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('farmapp_auth')
    router.push('/login')
  }

  return (
    <div>
      {/* ログアウトボタン */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors font-bold"
        >
          ログアウト
        </button>
      </div>
      {/* ロゴセクション */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-green-400 via-green-600 to-emerald-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-4 border-white animate-pulse">
            <span className="text-3xl font-extrabold drop-shadow-lg tracking-wide">Y</span>
          </div>
          <div>
            <p className="text-sm text-emerald-100 drop-shadow font-bold">農場管理システム</p>
          </div>
        </div>
      </div>

      {/* ヘッダーセクション */}
      <div className="text-center mb-12 bg-white py-8 px-4 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-4 bg-green-600 bg-opacity-80 py-4 px-8 rounded-lg inline-block shadow-lg">
          農場管理アプリ
        </h1>
        <p className="text-gray-600 text-lg mt-4">効率的な農場管理をサポートします</p>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左カラム：天気情報 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🌤️</span>現在の天気
            </h2>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : weather ? (
              <div className="text-center">
                <div className="text-6xl mb-4">{weather.icon}</div>
                <p className="text-3xl font-bold text-gray-800 mb-2">
                  {weather.temperature}°C
                </p>
                <p className="text-xl text-gray-600">{weather.description}</p>
              </div>
            ) : (
              <p className="text-gray-500">天気情報を取得できませんでした</p>
            )}
            <Link 
              href="/weather" 
              className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium"
            >
              詳細な天気予報を見る →
            </Link>
          </div>
        </div>

        {/* 中央カラム：作物一覧 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2">🌱</span>栽培中の作物
                <span className="ml-2 text-sm font-normal text-gray-500">
                  （{crops.length}件）
                </span>
              </h2>
              <Link 
                href="/crops" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <span className="mr-1">➕</span>作物を追加
              </Link>
            </div>
            {crops.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">まだ作物が登録されていません</p>
                <Link 
                  href="/crops" 
                  className="text-green-600 hover:text-green-800 font-medium inline-flex items-center"
                >
                  最初の作物を登録しましょう
                  <span className="ml-1">→</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {crops.slice(0, 5).map((crop) => (
                  <Link 
                    key={crop.id} 
                    href={`/crops/${crop.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStatusIcon(crop.status)}</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{crop.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{crop.variety}</span>
                            <span>•</span>
                            <span>栽培{getDaysSincePlanting(crop.plantingDate)}日目</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(crop.status)}`}>
                          {crop.status}
                        </span>
                        <span className="text-gray-400">→</span>
                      </div>
                    </div>
                    {crop.records && crop.records.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        最新の記録: {crop.records[crop.records.length - 1].activity}
                      </div>
                    )}
                  </Link>
                ))}
                {crops.length > 5 && (
                  <Link 
                    href="/crops" 
                    className="block text-center text-green-600 hover:text-green-800 font-medium mt-4"
                  >
                    すべての作物を見る →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 下部セクション：最近の活動記録 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📝</span>最近の活動記録
            </h2>
            {getRecentActivities().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">まだ活動記録がありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getRecentActivities().map((record, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{record.cropName}</h3>
                        <p className="text-gray-600">{record.activity}</p>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* クイックアクセスメニュー */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/harvest" 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-2">収穫予測</h3>
              <p className="text-green-100">作物の収穫時期を予測</p>
            </Link>
            <Link 
              href="/weather" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-2">天気予報</h3>
              <p className="text-blue-100">詳細な天気情報を確認</p>
            </Link>
            <Link 
              href="/crops" 
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-2">作物管理</h3>
              <p className="text-purple-100">作物の詳細を管理</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* tailwindでカレンダーの細部をカスタムしたい場合は、globals.cssなどで .react-calendar クラスを上書きしてください */
