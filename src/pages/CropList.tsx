import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCropStore } from '../store/cropStore';
import { formatDate, getDaysUntil } from '../utils/dateUtils';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import type { Crop } from '../types';

const CropList = () => {
  const { crops, deleteCrop } = useCropStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'growing' | 'harvested' | 'removed'>('all');

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || crop.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`「${name}」を削除してもよろしいですか？`)) {
      deleteCrop(id);
    }
  };

  const getStatusBadge = (crop: Crop) => {
    const statusConfig = {
      growing: { label: '成長中', color: 'bg-green-100 text-green-800' },
      harvested: { label: '収穫済み', color: 'bg-blue-100 text-blue-800' },
      removed: { label: '除去済み', color: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[crop.status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">作物一覧</h2>
        <Link to="/crops/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          新しい作物を追加
        </Link>
      </div>

      {/* 検索・フィルター */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="crop-search"
              name="search"
              type="text"
              placeholder="作物名、品種、場所で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              id="crop-status-filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input pl-10"
            >
              <option value="all">すべての状態</option>
              <option value="growing">成長中</option>
              <option value="harvested">収穫済み</option>
              <option value="removed">除去済み</option>
            </select>
          </div>
        </div>
      </div>

      {/* 作物リスト */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => {
            const daysUntilHarvest = crop.status === 'growing' 
              ? getDaysUntil(crop.expectedHarvestDate)
              : null;
            
            return (
              <div key={crop.id} className="card hover:shadow-lg transition-shadow">
                {crop.imageUrl && (
                  <Link to={`/crops/${crop.id}`} className="block mb-4">
                    <img
                      src={crop.imageUrl}
                      alt={crop.name}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </Link>
                )}
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(crop)}
                  <div className="flex gap-2">
                    <Link
                      to={`/crops/${crop.id}/edit`}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(crop.id, crop.name)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Link to={`/crops/${crop.id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600">
                    {crop.name}
                  </h3>
                </Link>

                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">品種:</span> {crop.variety}</p>
                  <p><span className="font-medium">場所:</span> {crop.location}</p>
                  <p><span className="font-medium">植え付け日:</span> {formatDate(crop.plantingDate)}</p>
                  {crop.status === 'growing' && (
                    <p>
                      <span className="font-medium">収穫予定:</span>{' '}
                      <span className={daysUntilHarvest! <= 7 ? 'text-red-600 font-semibold' : ''}>
                        {formatDate(crop.expectedHarvestDate)}
                        {daysUntilHarvest !== null && (
                          <span className="ml-2">
                            ({daysUntilHarvest === 0 ? '今日' : `${daysUntilHarvest}日後`})
                          </span>
                        )}
                      </span>
                    </p>
                  )}
                  {crop.status === 'harvested' && crop.actualHarvestDate && (
                    <p><span className="font-medium">収穫日:</span> {formatDate(crop.actualHarvestDate)}</p>
                  )}
                </div>

                {crop.notes && (
                  <p className="mt-4 text-sm text-gray-500 line-clamp-2">{crop.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? '検索条件に一致する作物が見つかりませんでした'
              : 'まだ作物が登録されていません'}
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <Link to="/crops/new" className="btn btn-primary inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              最初の作物を追加
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CropList;

