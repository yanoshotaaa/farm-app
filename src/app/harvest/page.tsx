'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Crop {
  id: number
  name: string
  variety: string
  plantingDate: string
  status: '栽培中' | '収穫済み' | '計画中'
  growthPeriod: number // 生育期間（日数）
}

interface HarvestPrediction {
  cropId: number
  cropName: string
  variety: string
  plantingDate: string
  predictedHarvestDate: string
  daysUntilHarvest: number
  status: '収穫可能' | '収穫予定' | '収穫済み'
  weatherCondition: string
}

const STORAGE_KEY = 'farmapp_crops'

export default function HarvestPage() {
  const [predictions, setPredictions] = useState<HarvestPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCropsAndPredict = () => {
      const savedCrops = localStorage.getItem(STORAGE_KEY)
      if (savedCrops) {
        const crops: Crop[] = JSON.parse(savedCrops)
        
        // 作物ごとの生育期間（実際のデータベースから取得することを想定）
        const growthPeriods: { [key: string]: number } = {
          'トマト': 90,
          'ナス': 80,
          'キュウリ': 60,
          'ピーマン': 70,
          'キャベツ': 100,
          'レタス': 60,
          'ブロッコリー': 90,
          'カボチャ': 120,
          'スイカ': 100,
          'メロン': 90
        }

        const today = new Date()
        const predictions: HarvestPrediction[] = crops
          .filter(crop => crop.status !== '収穫済み')
          .map(crop => {
            const plantingDate = new Date(crop.plantingDate)
            const growthPeriod = growthPeriods[crop.name] || 90 // デフォルト90日
            const harvestDate = new Date(plantingDate)
            harvestDate.setDate(plantingDate.getDate() + growthPeriod)
            
            const daysUntilHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            
            let status: HarvestPrediction['status']
            if (crop.status === '収穫済み') {
              status = '収穫済み'
            } else if (daysUntilHarvest <= 0) {
              status = '収穫可能'
            } else {
              status = '収穫予定'
            }

            // 天気予報に基づく収穫アドバイス（実際の天気APIと連携することを想定）
            const weatherCondition = daysUntilHarvest <= 7 ? 
              '収穫時期が近づいています。天気予報を確認して収穫日を決めましょう。' :
              '通常通りの管理を続けましょう。'

            return {
              cropId: crop.id,
              cropName: crop.name,
              variety: crop.variety,
              plantingDate: crop.plantingDate,
              predictedHarvestDate: harvestDate.toISOString().split('T')[0],
              daysUntilHarvest,
              status,
              weatherCondition
            }
          })

        setPredictions(predictions)
      }
      setLoading(false)
    }

    fetchCropsAndPredict()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">収穫予測を計算中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold text-green-800 mt-4">収穫予測</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predictions.map((prediction) => (
          <div key={prediction.cropId} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{prediction.cropName}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${prediction.status === '収穫可能' ? 'bg-green-100 text-green-800' :
                  prediction.status === '収穫予定' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {prediction.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">品種</span>
                <span className="font-medium">{prediction.variety}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">植付日</span>
                <span className="font-medium">{prediction.plantingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">予定収穫日</span>
                <span className="font-medium">{prediction.predictedHarvestDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">収穫まで</span>
                <span className={`font-medium ${
                  prediction.daysUntilHarvest <= 0 ? 'text-green-600' :
                  prediction.daysUntilHarvest <= 7 ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {prediction.daysUntilHarvest <= 0 ? 
                    '収穫可能' : 
                    `${prediction.daysUntilHarvest}日`}
                </span>
              </div>
            </div>

            {/* 収穫アドバイス */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-green-700 mb-2">収穫アドバイス</h3>
              <p className="text-sm text-gray-600">{prediction.weatherCondition}</p>
            </div>

            {/* アクションボタン */}
            <div className="mt-4 flex gap-2">
              <Link 
                href={`/crops/${prediction.cropId}`}
                className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                詳細を見る
              </Link>
              <Link 
                href="/weather"
                className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                天気を確認
              </Link>
            </div>
          </div>
        ))}
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">栽培中の作物がありません。</p>
          <Link 
            href="/crops"
            className="mt-4 inline-block text-green-600 hover:text-green-800"
          >
            作物を登録する →
          </Link>
        </div>
      )}

      {/* 注意事項 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">注意事項</h2>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>収穫予測は目安です。実際の収穫時期は天候や栽培条件によって変動します。</li>
          <li>作物の状態をよく観察し、適切な収穫時期を判断してください。</li>
          <li>収穫時期が近づいたら、天気予報を確認して収穫日を決めましょう。</li>
        </ul>
      </div>
    </div>
  )
} 