import { useState } from 'react';
import { useCropStore } from '../store/cropStore';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import FarmAreaModal from '../components/FarmAreaModal';

const FarmAreaList = () => {
  const { farmAreas, deleteFarmArea } = useCropStore();
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`「${name}」を削除してもよろしいですか？`)) {
      deleteFarmArea(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">畑・区画管理</h2>
        <button
          onClick={() => {
            setEditingArea(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          新しい区画を追加
        </button>
      </div>

      {farmAreas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmAreas.map((area) => (
            <div key={area.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-primary-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">{area.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingArea(area.id);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id, area.name)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {area.description && (
                <p className="text-gray-600 mb-2">{area.description}</p>
              )}
              {area.area > 0 && (
                <p className="text-sm text-gray-500">面積: {area.area}㎡</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">まだ区画が登録されていません</p>
          <button
            onClick={() => {
              setEditingArea(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            最初の区画を追加
          </button>
        </div>
      )}

      {showModal && (
        <FarmAreaModal
          areaId={editingArea}
          onClose={() => {
            setShowModal(false);
            setEditingArea(null);
          }}
        />
      )}
    </div>
  );
};

export default FarmAreaList;

