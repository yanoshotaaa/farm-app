export interface Crop {
  id: string;
  name: string;
  variety: string; // 品種
  location: string; // 場所（畑、区画など）
  plantingDate: string; // 植え付け日
  expectedHarvestDate: string; // 収穫予定日
  actualHarvestDate?: string; // 実際の収穫日
  status: 'growing' | 'harvested' | 'removed'; // 状態
  notes: string; // メモ
  imageUrl?: string; // 画像URL
  createdAt: string;
  updatedAt: string;
}

export interface GrowthRecord {
  id: string;
  cropId: string;
  date: string;
  notes: string;
  imageUrl?: string;
  height?: number; // 高さ（cm）
  width?: number; // 幅（cm）
  createdAt: string;
}

export interface Task {
  id: string;
  cropId: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'other';
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  createdAt: string;
}

export interface FarmArea {
  id: string;
  name: string;
  description: string;
  area: number; // 面積（㎡）
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: string;
  cropId?: string; // 関連する作物ID（オプション）
}

