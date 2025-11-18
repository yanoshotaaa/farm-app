import type { Crop, GrowthRecord, Task, FarmArea } from '../types';
import { formatDate } from './dateUtils';

// JSON形式でエクスポート
export const exportToJSON = (data: {
  crops: Crop[];
  growthRecords: GrowthRecord[];
  tasks: Task[];
  farmAreas: FarmArea[];
}) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `farm-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// CSV形式でエクスポート
export const exportToCSV = (crops: Crop[]) => {
  const headers = [
    'ID',
    '作物名',
    '品種',
    '場所',
    '植え付け日',
    '収穫予定日',
    '実際の収穫日',
    '状態',
    'メモ',
    '作成日',
    '更新日',
  ];

  const rows = crops.map((crop) => [
    crop.id,
    crop.name,
    crop.variety,
    crop.location,
    formatDate(crop.plantingDate),
    formatDate(crop.expectedHarvestDate),
    crop.actualHarvestDate ? formatDate(crop.actualHarvestDate) : '',
    crop.status === 'growing' ? '成長中' : crop.status === 'harvested' ? '収穫済み' : '除去済み',
    crop.notes.replace(/\n/g, ' '),
    formatDate(crop.createdAt),
    formatDate(crop.updatedAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `farm-crops-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// JSON形式でインポート
export const importFromJSON = (file: File): Promise<{
  crops: Crop[];
  growthRecords: GrowthRecord[];
  tasks: Task[];
  farmAreas: FarmArea[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        // データの検証
        if (
          !Array.isArray(data.crops) ||
          !Array.isArray(data.growthRecords) ||
          !Array.isArray(data.tasks) ||
          !Array.isArray(data.farmAreas)
        ) {
          throw new Error('無効なデータ形式です');
        }

        resolve(data);
      } catch (error) {
        reject(new Error('JSONファイルの読み込みに失敗しました'));
      }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
};

