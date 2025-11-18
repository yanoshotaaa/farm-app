import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import type { Crop } from '../types';

interface AdvancedSearchProps {
  crops: Crop[];
  onFilterChange: (filtered: Crop[]) => void;
}

const AdvancedSearch = ({ crops, onFilterChange }: AdvancedSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'growing' | 'harvested' | 'removed'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ユニークな場所のリストを取得
  const locations = Array.from(new Set(crops.map(c => c.location))).sort();

  const applyFilters = () => {
    let filtered = [...crops];

    // テキスト検索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (crop) =>
          crop.name.toLowerCase().includes(term) ||
          crop.variety.toLowerCase().includes(term) ||
          crop.location.toLowerCase().includes(term) ||
          crop.notes?.toLowerCase().includes(term)
      );
    }

    // 状態フィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter((crop) => crop.status === statusFilter);
    }

    // 場所フィルター
    if (locationFilter !== 'all') {
      filtered = filtered.filter((crop) => crop.location === locationFilter);
    }

    // 日付範囲フィルター
    if (dateRange.start) {
      filtered = filtered.filter(
        (crop) => new Date(crop.plantingDate) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (crop) => new Date(crop.plantingDate) <= new Date(dateRange.end)
      );
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLocationFilter('all');
    setDateRange({ start: '', end: '' });
    onFilterChange(crops);
  };

  useEffect(() => {
    applyFilters();
  }, [crops]);

  return (
    <div className="card space-y-4">
      {/* 基本検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          id="advanced-search"
          name="search"
          type="text"
          placeholder="作物名、品種、場所、メモで検索..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            applyFilters();
          }}
          className="input pl-10"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              applyFilters();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 高度な検索トグル */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center text-sm text-primary-600 hover:text-primary-700"
      >
        <Filter className="h-4 w-4 mr-2" />
        {showAdvanced ? '高度な検索を閉じる' : '高度な検索を開く'}
      </button>

      {/* 高度な検索オプション */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label htmlFor="status-filter" className="label">
              状態
            </label>
            <select
              id="status-filter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                applyFilters();
              }}
              className="input"
            >
              <option value="all">すべて</option>
              <option value="growing">成長中</option>
              <option value="harvested">収穫済み</option>
              <option value="removed">除去済み</option>
            </select>
          </div>

          <div>
            <label htmlFor="location-filter" className="label">
              場所
            </label>
            <select
              id="location-filter"
              name="locationFilter"
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                applyFilters();
              }}
              className="input"
            >
              <option value="all">すべて</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date-start" className="label">
              植え付け日（開始）
            </label>
            <input
              id="date-start"
              name="dateStart"
              type="date"
              value={dateRange.start}
              onChange={(e) => {
                setDateRange({ ...dateRange, start: e.target.value });
                applyFilters();
              }}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="date-end" className="label">
              植え付け日（終了）
            </label>
            <input
              id="date-end"
              name="dateEnd"
              type="date"
              value={dateRange.end}
              onChange={(e) => {
                setDateRange({ ...dateRange, end: e.target.value });
                applyFilters();
              }}
              className="input"
            />
          </div>

          <div className="md:col-span-3">
            <button
              onClick={clearFilters}
              className="btn btn-secondary flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              フィルターをクリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

