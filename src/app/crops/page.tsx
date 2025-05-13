'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Crop {
  id: number
  name: string
  variety: string
  plantingDate: string
  status: '栽培中' | '収穫済み' | '計画中'
  records?: CultivationRecord[]
}

interface CultivationRecord {
  id: number
  date: string
  type: '水やり' | '肥料' | '防除' | 'その他'
  note: string
}

interface NewCropForm {
  name: string
  variety: string
  plantingDate: string
  status: '栽培中' | '収穫済み' | '計画中'
}

const STORAGE_KEY = 'farmapp_crops'

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingCropId, setEditingCropId] = useState<number | null>(null)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'plantingDate' | 'status'>('plantingDate')
  const [newCrop, setNewCrop] = useState<NewCropForm>({
    name: '',
    variety: '',
    plantingDate: '',
    status: '計画中'
  })
  const [newRecord, setNewRecord] = useState<Omit<CultivationRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    type: '水やり',
    note: ''
  })

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    const savedCrops = localStorage.getItem(STORAGE_KEY)
    if (savedCrops) {
      setCrops(JSON.parse(savedCrops))
    } else {
      // 初期データを空に
      setCrops([])
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    }
  }, [])

  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    if (crops.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(crops))
    }
  }, [crops])

  const handleEdit = (crop: Crop) => {
    setNewCrop({
      name: crop.name,
      variety: crop.variety,
      plantingDate: crop.plantingDate,
      status: crop.status
    })
    setEditingCropId(crop.id)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditMode && editingCropId) {
      // 編集モードの場合
      setCrops(crops.map(crop => 
        crop.id === editingCropId 
          ? { ...crop, ...newCrop }
          : crop
      ))
    } else {
      // 新規登録モードの場合
      const crop: Crop = {
        id: Date.now(),
        ...newCrop,
        records: []
      }
      setCrops([...crops, crop])
    }
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditingCropId(null)
    setNewCrop({
      name: '',
      variety: '',
      plantingDate: '',
      status: '計画中'
    })
  }

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCropId) {
      const record: CultivationRecord = {
        id: Date.now(),
        ...newRecord
      }
      setCrops(crops.map(crop => 
        crop.id === selectedCropId
          ? { ...crop, records: [...(crop.records || []), record] }
          : crop
      ))
      setIsRecordModalOpen(false)
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        type: '水やり',
        note: ''
      })
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('この作物を削除してもよろしいですか？')) {
      setCrops(crops.filter(crop => crop.id !== id))
    }
  }

  const filteredAndSortedCrops = crops
    .filter(crop => 
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'plantingDate':
          return new Date(b.plantingDate).getTime() - new Date(a.plantingDate).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  return (
    <div>
      <div className="mb-8">
        <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-4">作物管理</h1>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => {
              setIsEditMode(false)
              setIsModalOpen(true)
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            新規作物を登録
          </button>
        </div>

        {/* 検索とソート */}
        <div className="mb-6 flex gap-4 items-center">
          <input
            type="text"
            placeholder="作物名または品種で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 w-64"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
          >
            <option value="plantingDate">植付日順</option>
            <option value="name">作物名順</option>
            <option value="status">状態順</option>
          </select>
        </div>

        {/* モーダル */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-green-900 bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-green-800 mb-4">新規作物の登録</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    作物名
                  </label>
                  <input
                    type="text"
                    required
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    品種
                  </label>
                  <input
                    type="text"
                    required
                    value={newCrop.variety}
                    onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    植付日
                  </label>
                  <input
                    type="date"
                    required
                    value={newCrop.plantingDate}
                    onChange={(e) => setNewCrop({...newCrop, plantingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状態
                  </label>
                  <select
                    value={newCrop.status}
                    onChange={(e) => setNewCrop({...newCrop, status: e.target.value as Crop['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="計画中">計画中</option>
                    <option value="栽培中">栽培中</option>
                    <option value="収穫済み">収穫済み</option>
                  </select>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    登録
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 栽培記録モーダル */}
        {isRecordModalOpen && selectedCropId && (
          <div className="fixed inset-0 bg-green-900 bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-green-800 mb-4">栽培記録の追加</h2>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日付
                  </label>
                  <input
                    type="date"
                    required
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    作業内容
                  </label>
                  <select
                    value={newRecord.type}
                    onChange={(e) => setNewRecord({...newRecord, type: e.target.value as CultivationRecord['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="水やり">水やり</option>
                    <option value="肥料">肥料</option>
                    <option value="防除">防除</option>
                    <option value="その他">その他</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    記録を追加
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  作物名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  品種
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  植付日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  栽培記録
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedCrops.map((crop) => (
                <tr key={crop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {crop.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.variety}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.plantingDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${crop.status === '栽培中' ? 'bg-green-100 text-green-800' : 
                        crop.status === '収穫済み' ? 'bg-gray-100 text-gray-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {crop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-gray-600">
                      {crop.records?.length || 0}件の記録
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setSelectedCropId(crop.id)
                        setIsRecordModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      記録追加
                    </button>
                    <button
                      onClick={() => handleEdit(crop)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      編集
                    </button>
                    <Link href={`/crops/${crop.id}`} className="text-green-600 hover:text-green-900 mr-4">
                      詳細
                    </Link>
                    <button 
                      onClick={() => handleDelete(crop.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedCrops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery ? '検索条件に一致する作物が見つかりません。' : '作物が登録されていません。'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 