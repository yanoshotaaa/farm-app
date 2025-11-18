import { useState } from 'react';
import { useCropStore } from '../store/cropStore';
import { exportToJSON, exportToCSV, importFromJSON } from '../utils/exportUtils';
import * as firestoreService from '../services/firestoreService';
import { Download, Upload, FileJson, FileSpreadsheet, Trash2, AlertTriangle } from 'lucide-react';

const DataManagement = () => {
  const { crops, growthRecords, tasks, farmAreas, importData } = useCropStore();
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExportJSON = () => {
    exportToJSON({
      crops,
      growthRecords,
      tasks,
      farmAreas,
    });
  };

  const handleExportCSV = () => {
    exportToCSV(crops);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    try {
      const data = await importFromJSON(file);
      
      // データを確認してからインポート
      if (
        window.confirm(
          `以下のデータをインポートしますか？\n` +
          `- 作物: ${data.crops.length}件\n` +
          `- 成長記録: ${data.growthRecords.length}件\n` +
          `- タスク: ${data.tasks.length}件\n` +
          `- 区画: ${data.farmAreas.length}件\n\n` +
          `注意: 既存のデータは上書きされます。`
        )
      ) {
        try {
          await importData(data);
          setImportSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          setImportError('データのインポートに失敗しました');
        }
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'インポートに失敗しました');
    }

    // ファイル入力をリセット
    e.target.value = '';
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        'すべてのデータを削除しますか？この操作は取り消せません。'
      )
    ) {
      try {
        // Firestoreからすべてのデータを削除
        const deletePromises = [
          ...crops.map((c) => firestoreService.cropService.delete(c.id)),
          ...growthRecords.map((r) => firestoreService.growthRecordService.delete(r.id)),
          ...tasks.map((t) => firestoreService.taskService.delete(t.id)),
          ...farmAreas.map((a) => firestoreService.farmAreaService.delete(a.id)),
        ];
        await Promise.all(deletePromises);
        window.location.reload();
      } catch (error) {
        alert('データの削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  const stats = {
    crops: crops.length,
    growthRecords: growthRecords.length,
    tasks: tasks.length,
    farmAreas: farmAreas.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">データ管理</h2>
      </div>

      {/* データ統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">作物数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.crops}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">成長記録</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.growthRecords}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">タスク</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.tasks}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">区画</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.farmAreas}</p>
        </div>
      </div>

      {/* エクスポート */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2" />
          データのエクスポート
        </h3>
        <p className="text-gray-600 mb-4">
          データをバックアップとしてエクスポートできます。
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportJSON}
            className="btn btn-primary flex items-center"
          >
            <FileJson className="h-5 w-5 mr-2" />
            JSON形式でエクスポート
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary flex items-center"
          >
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            CSV形式でエクスポート（作物のみ）
          </button>
        </div>
      </div>

      {/* インポート */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          データのインポート
        </h3>
        <p className="text-gray-600 mb-4">
          JSON形式のバックアップファイルからデータを復元できます。
        </p>
        <div className="space-y-4">
          <label htmlFor="import-file" className="block">
            <input
              id="import-file"
              name="importFile"
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <span className="btn btn-primary flex items-center w-fit cursor-pointer">
              <Upload className="h-5 w-5 mr-2" />
              JSONファイルを選択
            </span>
          </label>
          {importError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{importError}</p>
            </div>
          )}
          {importSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">データのインポートが完了しました。ページをリロードします...</p>
            </div>
          )}
        </div>
      </div>

      {/* データ削除 */}
      <div className="card border-red-200 bg-red-50">
        <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
          <Trash2 className="h-5 w-5 mr-2" />
          危険な操作
        </h3>
        <p className="text-red-800 mb-4">
          すべてのデータを削除します。この操作は取り消せません。
        </p>
        <button
          onClick={handleClearAll}
          className="btn btn-danger"
        >
          すべてのデータを削除
        </button>
      </div>
    </div>
  );
};

export default DataManagement;

