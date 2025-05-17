'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import { format, parse } from 'date-fns'
import { ja } from 'date-fns/locale'
import "react-datepicker/dist/react-datepicker.css"

interface CropDetail {
  id: number
  name: string
  variety: string
  plantingDate: string
  status: '栽培中' | '収穫済み' | '計画中'
  notes: string
  growthStage: string
  lastWatered: string
  lastFertilized: string
  records: Array<{
    id: number
    date: string
    time: string
    type: '水やり' | '肥料' | '防除' | 'その他'
    note: string
    worker: string
    location: string
    materials: string
    weather: string
  }>
}

const STORAGE_KEY = 'farmapp_crops'

export default function CropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cropId = Number(params.id)

  const [crop, setCrop] = useState<CropDetail | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedCrop, setEditedCrop] = useState<CropDetail | null>(null)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [newRecord, setNewRecord] = useState<{
    date: string
    time: string
    type: '水やり' | '肥料' | '防除' | 'その他'
    note: string
    worker: string
    location: string
    materials: string
    weather: string
  }>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    type: '水やり',
    note: '',
    worker: '',
    location: '',
    materials: '',
    weather: '晴れ'
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // カレンダー用の状態
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [calendarRecords, setCalendarRecords] = useState<Array<{
    date: Date
    records: Array<{
      id: number
      type: string
      time: string
      note: string
    }>
  }>>([])

  useEffect(() => {
    const savedCrops = localStorage.getItem(STORAGE_KEY)
    if (savedCrops) {
      const crops = JSON.parse(savedCrops)
      const foundCrop = crops.find((c: CropDetail) => c.id === cropId)
      if (foundCrop) {
        setCrop(foundCrop)
        setEditedCrop(foundCrop)
      } else {
        router.push('/crops') // 作物が見つからない場合は一覧ページにリダイレクト
      }
    }
  }, [cropId, router])

  // カレンダーデータの準備
  useEffect(() => {
    if (crop?.records) {
      const recordsByDate = crop.records.reduce((acc, record) => {
        const date = parse(record.date, 'yyyy-MM-dd', new Date())
        const dateKey = format(date, 'yyyy-MM-dd')
        
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date,
            records: []
          }
        }
        
        acc[dateKey].records.push({
          id: record.id,
          type: record.type,
          time: record.time,
          note: record.note
        })
        
        return acc
      }, {} as Record<string, { date: Date; records: Array<{ id: number; type: string; time: string; note: string }> }>)
      
      setCalendarRecords(Object.values(recordsByDate))
    }
  }, [crop?.records])

  // カレンダーの日付に記録があるかどうかを確認
  const isDateHasRecords = (date: Date) => {
    return calendarRecords.some(record => 
      format(record.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  // カレンダーの日付のスタイルをカスタマイズ
  const dayClassName = (date: Date) => {
    return isDateHasRecords(date) ? 'bg-emerald-100 text-emerald-800 rounded-full' : ''
  }

  // カレンダーの日付をクリックしたときの処理
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const records = calendarRecords.find(record => 
      format(record.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    if (records) {
      // 選択した日付の記録を表示する処理を追加
      console.log('Selected date records:', records)
    }
  }

  const handleSave = () => {
    if (!editedCrop) return

    const savedCrops = localStorage.getItem(STORAGE_KEY)
    if (savedCrops) {
      const crops = JSON.parse(savedCrops)
      const updatedCrops = crops.map((c: CropDetail) => 
        c.id === cropId ? editedCrop : c
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCrops))
      setCrop(editedCrop)
      setIsEditing(false)
    }
  }

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editedCrop) return

    const record = {
      id: Date.now(),
      ...newRecord
    }

    const updatedCrop = {
      ...editedCrop,
      records: [...(editedCrop.records || []), record],
      lastWatered: newRecord.type === '水やり' ? newRecord.date : editedCrop.lastWatered,
      lastFertilized: newRecord.type === '肥料' ? newRecord.date : editedCrop.lastFertilized
    }

    // localStorageに保存
    const savedCrops = localStorage.getItem(STORAGE_KEY)
    if (savedCrops) {
      const crops = JSON.parse(savedCrops)
      const updatedCrops = crops.map((c: CropDetail) => 
        c.id === cropId ? updatedCrop : c
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCrops))
    }

    setCrop(updatedCrop)
    setEditedCrop(updatedCrop)
    setIsRecordModalOpen(false)
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      type: '水やり',
      note: '',
      worker: '',
      location: '',
      materials: '',
      weather: '晴れ'
    })
  }

  if (!crop) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
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
                  <span className="text-lg font-semibold text-gray-900 hidden sm:inline">農場管理システム</span>
                  <span className="ml-2 text-sm text-gray-500 hidden sm:inline">Enterprise Edition</span>
                </div>
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <Link href="/crops" className="text-emerald-600 font-medium px-3 py-2 text-sm border-b-2 border-emerald-600">
                  作物管理
                </Link>
                <Link href="/harvest" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  収穫予測
                </Link>
                <Link href="/weather" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  気象情報
                </Link>
              </div>
            </div>

            {/* モバイルメニューボタン */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
              >
                <span className="sr-only">メニューを開く</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/crops"
                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 bg-emerald-50"
              >
                作物管理
              </Link>
              <Link
                href="/harvest"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                収穫予測
              </Link>
              <Link
                href="/weather"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                気象情報
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <Link href="/crops" className="text-emerald-600 hover:text-emerald-800 mb-2 sm:mb-4 inline-flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                作物一覧に戻る
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{crop.name}の詳細</h1>
              <p className="mt-1 text-sm text-gray-500">栽培状況と活動記録の管理</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                活動記録を追加
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 基本情報カード */}
          <div className="lg:col-span-1 space-y-4">
            {/* カレンダーカード */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">活動カレンダー</h2>
                <div className="calendar-container">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date)
                      if (date) handleDateClick(date)
                    }}
                    inline
                    locale={ja}
                    dayClassName={dayClassName}
                    renderDayContents={(day) => (
                      <div className="h-full w-full flex items-center justify-center">
                        {day}
                      </div>
                    )}
                    calendarClassName="w-full border-0"
                    popperClassName="react-datepicker-left"
                    popperPlacement="bottom-start"
                    popperModifiers={[
                      {
                        name: "offset",
                        options: {
                          offset: [0, 8]
                        },
                        fn: (state) => state
                      }
                    ]}
                  />
                </div>
                {selectedDate && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {format(selectedDate, 'yyyy年MM月dd日', { locale: ja })}の記録
                    </h3>
                    {calendarRecords.find(record => 
                      format(record.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                    )?.records.map(record => (
                      <div key={record.id} className="mt-2 p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full
                            ${record.type === '水やり' ? 'bg-blue-100 text-blue-800' :
                              record.type === '肥料' ? 'bg-green-100 text-green-800' :
                              record.type === '防除' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {record.type}
                          </span>
                          <span className="text-sm text-gray-500">{record.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{record.note}</p>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">この日の記録はありません</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 既存の基本情報カード */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
                <dl className="space-y-3 sm:space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">品種</dt>
                    <dd className="mt-1 text-sm text-gray-900">{crop.variety}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">植付日</dt>
                    <dd className="mt-1 text-sm text-gray-900">{crop.plantingDate}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">状態</dt>
                    <dd className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${crop.status === '栽培中' ? 'bg-green-100 text-green-800' : 
                          crop.status === '収穫済み' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {crop.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">成長段階</dt>
                    <dd className="mt-1 text-sm text-gray-900">{crop.growthStage}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">最終水やり</dt>
                    <dd className="mt-1 text-sm text-gray-900">{crop.lastWatered}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">最終施肥</dt>
                    <dd className="mt-1 text-sm text-gray-900">{crop.lastFertilized}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* 活動記録カード */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">活動記録</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {crop.records?.length || 0}件の記録
                    </p>
                  </div>
                </div>

                {crop.records && crop.records.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {crop.records.sort((a, b) => {
                      const dateA = new Date(`${a.date}T${a.time}`).getTime()
                      const dateB = new Date(`${b.date}T${b.time}`).getTime()
                      return dateB - dateA
                    }).map((record) => (
                      <div 
                        key={record.id}
                        className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full
                                ${record.type === '水やり' ? 'bg-blue-100 text-blue-800' :
                                  record.type === '肥料' ? 'bg-green-100 text-green-800' :
                                  record.type === '防除' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {record.type}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(record.date).toLocaleDateString('ja-JP')} {record.time}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {record.weather}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">作業者：</span>
                              <span className="text-gray-900">{record.worker || '未設定'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">作業場所：</span>
                              <span className="text-gray-900">{record.location || '未設定'}</span>
                            </div>
                            {record.materials && (
                              <div className="col-span-1 sm:col-span-2">
                                <span className="text-gray-500">使用資材：</span>
                                <span className="text-gray-900">{record.materials}</span>
                              </div>
                            )}
                          </div>

                          {record.note && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-sm text-gray-600">{record.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border border-gray-100">
                    <svg className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">活動記録はありません</p>
                    <button
                      onClick={() => setIsRecordModalOpen(true)}
                      className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                      最初の記録を追加
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 活動記録モーダル */}
        {isRecordModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">活動記録の追加</h2>
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      日付
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => {
                        if (date) {
                          setSelectedDate(date)
                          setNewRecord({
                            ...newRecord,
                            date: format(date, 'yyyy-MM-dd')
                          })
                        }
                      }}
                      dateFormat="yyyy/MM/dd"
                      locale={ja}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      時間
                    </label>
                    <input
                      type="time"
                      required
                      value={newRecord.time}
                      onChange={(e) => setNewRecord({...newRecord, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      作業内容
                    </label>
                    <select
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({...newRecord, type: e.target.value as typeof newRecord.type})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    >
                      <option value="水やり">水やり</option>
                      <option value="肥料">肥料</option>
                      <option value="防除">防除</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      作業者
                    </label>
                    <input
                      type="text"
                      value={newRecord.worker}
                      onChange={(e) => setNewRecord({...newRecord, worker: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      placeholder="作業者名を入力"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      作業場所
                    </label>
                    <input
                      type="text"
                      value={newRecord.location}
                      onChange={(e) => setNewRecord({...newRecord, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      placeholder="例：ハウスA、露地畑Bなど"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      使用資材
                    </label>
                    <input
                      type="text"
                      value={newRecord.materials}
                      onChange={(e) => setNewRecord({...newRecord, materials: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      placeholder="例：有機肥料、農薬名など"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      天候
                    </label>
                    <select
                      value={newRecord.weather}
                      onChange={(e) => setNewRecord({...newRecord, weather: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    >
                      <option value="晴れ">晴れ</option>
                      <option value="曇り">曇り</option>
                      <option value="雨">雨</option>
                      <option value="雪">雪</option>
                      <option value="強風">強風</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メモ
                    </label>
                    <textarea
                      required
                      value={newRecord.note}
                      onChange={(e) => setNewRecord({...newRecord, note: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      rows={3}
                      placeholder="作業の詳細や注意点を記録してください"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsRecordModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                      記録を追加
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 編集モーダル */}
        {isEditing && editedCrop && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報の編集</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      成長段階
                    </label>
                    <input
                      type="text"
                      value={editedCrop.growthStage || ''}
                      onChange={(e) => setEditedCrop({...editedCrop, growthStage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      placeholder="例：発芽期、生育期、開花期など"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      状態
                    </label>
                    <select
                      value={editedCrop.status}
                      onChange={(e) => setEditedCrop({...editedCrop, status: e.target.value as CropDetail['status']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    >
                      <option value="栽培中">栽培中</option>
                      <option value="収穫済み">収穫済み</option>
                      <option value="計画中">計画中</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      メモ
                    </label>
                    <textarea
                      value={editedCrop.notes || ''}
                      onChange={(e) => setEditedCrop({...editedCrop, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                      rows={4}
                      placeholder="作物に関する追加情報や注意点を記録してください"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border: none;
          width: 100%;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: none;
          padding-top: 0.5rem;
        }
        .react-datepicker__day {
          margin: 0.2rem;
          width: 2rem;
          height: 2rem;
          line-height: 2rem;
        }
        .react-datepicker__day--selected {
          background-color: #059669;
          color: white;
          border-radius: 9999px;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #059669;
          color: white;
          border-radius: 9999px;
        }
        .react-datepicker__day:hover {
          border-radius: 9999px;
        }
        .react-datepicker__navigation {
          top: 0.5rem;
        }
        .react-datepicker__current-month {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }
        .react-datepicker__day-name {
          color: #6B7280;
          font-size: 0.875rem;
          width: 2rem;
          margin: 0.2rem;
        }
      `}</style>
    </div>
  )
} 