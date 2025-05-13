'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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
}

const STORAGE_KEY = 'farmapp_crops'

export default function CropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cropId = Number(params.id)

  const [crop, setCrop] = useState<CropDetail | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedCrop, setEditedCrop] = useState<CropDetail | null>(null)

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

  const handleAddRecord = () => {
    if (!editedCrop) return

    const today = new Date().toISOString().split('T')[0]
    setEditedCrop({
      ...editedCrop,
      lastWatered: today,
      notes: `${editedCrop.notes}\n${today}: 水やりを行いました。`
    })
  }

  if (!crop) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/crops" className="text-green-600 hover:text-green-800 mb-4 inline-block">
          ← 作物一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-green-800 mt-4">{crop.name}の詳細</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                成長段階
              </label>
              <input
                type="text"
                value={editedCrop?.growthStage || ''}
                onChange={(e) => setEditedCrop(editedCrop ? {...editedCrop, growthStage: e.target.value} : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                value={editedCrop?.notes || ''}
                onChange={(e) => setEditedCrop(editedCrop ? {...editedCrop, notes: e.target.value} : null)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-green-700 mb-4">基本情報</h2>
                <dl className="space-y-4">
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
                </dl>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-green-700 mb-4">栽培記録</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">最終水やり</dt>
                    <dd className="mt-1 text-sm text-gray-900">{crop.lastWatered}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">最終施肥</dt>
                    <dd className="mt-1 text-sm text-gray-900">{crop.lastFertilized}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">メモ</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{crop.notes}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={handleAddRecord}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                水やり記録を追加
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                編集
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 