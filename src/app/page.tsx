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
  }, [router])

  // 作物データの取得と更新を監視する関数
  const fetchCrops = () => {
    const storedCrops = localStorage.getItem('farmapp_crops')
    if (storedCrops) {
      setCrops(JSON.parse(storedCrops))
    }
  }

  useEffect(() => {
    // 初回データ取得
    fetchCrops()

    // localStorageの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'farmapp_crops') {
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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダーナビゲーション */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg w-10 h-10 flex items-center justify-center shadow-sm">
                  <span className="text-xl font-bold tracking-tight">Y</span>
                </div>
                <div className="ml-3">
                  <span className="text-lg font-semibold text-gray-900">農場管理システム</span>
                  <span className="ml-2 text-sm text-gray-500">Enterprise Edition</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/crops" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  作物管理
                </Link>
                <Link href="/harvest" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  収穫予測
                </Link>
                <Link href="/weather" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  気象情報
                </Link>
              </div>
              <div className="border-l border-gray-200 h-6 mx-2"></div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ダッシュボードヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
              <p className="mt-1 text-sm text-gray-500">農場の現状と最新の活動状況</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">最終更新: {new Date().toLocaleString('ja-JP')}</span>
            </div>
          </div>
        </div>

        {/* メイングリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 天気情報カード */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">🌤️</span>気象情報
                </h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  リアルタイム
                </span>
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-100 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-100 rounded w-1/2"></div>
                </div>
              ) : weather ? (
                <div className="text-center">
                  <div className="text-6xl mb-4 transform hover:scale-110 transition-transform">{weather.icon}</div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {weather.temperature}°C
                  </p>
                  <p className="text-base font-medium text-gray-900">{weather.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link 
                      href="/weather" 
                      className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      詳細な天気予報
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-900 font-medium">データ取得中...</p>
              )}
            </div>
          </div>

          {/* 作物一覧カード */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🌱</span>栽培状況
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    現在 {crops.length} 件の作物を管理中
                  </p>
                </div>
                <Link 
                  href="/crops" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors shadow-sm"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  新規登録
                </Link>
              </div>
              {crops.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">登録されている作物はありません</p>
                  <Link 
                    href="/crops" 
                    className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    最初の作物を登録する
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {crops.slice(0, 5).map((crop) => (
                    <Link 
                      key={crop.id} 
                      href={`/crops/${crop.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl transform group-hover:scale-110 transition-transform">{getStatusIcon(crop.status)}</span>
                          <div>
                            <h3 className="text-base font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">{crop.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{crop.variety}</span>
                              <span>•</span>
                              <span>栽培{getDaysSincePlanting(crop.plantingDate)}日目</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                            {crop.status}
                          </span>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      {crop.records && crop.records.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          最新の記録: {crop.records[crop.records.length - 1].activity}
                        </div>
                      )}
                    </Link>
                  ))}
                  {crops.length > 5 && (
                    <Link 
                      href="/crops" 
                      className="block text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 mt-4"
                    >
                      すべての作物を表示
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 最近の活動記録カード */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">📝</span>活動ログ
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    最新の作業記録
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  最新5件
                </span>
              </div>
              {getRecentActivities().length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">活動記録はありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentActivities().map((record, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{record.cropName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{record.activity}</p>
                          {record.notes && (
                            <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">収穫予測</h3>
                    <p className="text-sm text-gray-600 mt-1">作物の収穫時期を予測・管理</p>
                  </div>
                </div>
              </Link>
              <Link 
                href="/weather" 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <span className="text-2xl">🌤️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">天気予報</h3>
                    <p className="text-sm text-gray-600 mt-1">詳細な気象情報の確認</p>
                  </div>
                </div>
              </Link>
              <Link 
                href="/crops" 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors">作物管理</h3>
                    <p className="text-sm text-gray-600 mt-1">作物の詳細情報の管理</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* tailwindでカレンダーの細部をカスタムしたい場合は、globals.cssなどで .react-calendar クラスを上書きしてください */
