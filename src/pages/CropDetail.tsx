import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCropStore } from '../store/cropStore';
import { formatDate, getDaysUntil } from '../utils/dateUtils';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Sprout,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { useState } from 'react';
import GrowthRecordModal from '../components/GrowthRecordModal';
import TaskModal from '../components/TaskModal';

const CropDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCrop, deleteCrop, getGrowthRecords, getTasks, addTask, completeTask, updateCrop } = useCropStore();
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const crop = id ? getCrop(id) : undefined;

  if (!crop) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg mb-4">作物が見つかりませんでした</p>
        <Link to="/crops" className="btn btn-primary">
          作物一覧に戻る
        </Link>
      </div>
    );
  }

  const growthRecords = getGrowthRecords(crop.id);
  const tasks = getTasks(crop.id);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleDelete = () => {
    if (window.confirm(`「${crop.name}」を削除してもよろしいですか？`)) {
      deleteCrop(crop.id);
      navigate('/crops');
    }
  };

  const handleHarvest = () => {
    if (window.confirm(`「${crop.name}」を収穫済みにマークしますか？`)) {
      updateCrop(crop.id, {
        status: 'harvested',
        actualHarvestDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const daysUntilHarvest = crop.status === 'growing' 
    ? getDaysUntil(crop.expectedHarvestDate)
    : null;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Link to="/crops" className="btn btn-secondary flex items-center">
          <ArrowLeft className="h-5 w-5 mr-2" />
          戻る
        </Link>
        <div className="flex gap-2">
          <Link to={`/crops/${crop.id}/edit`} className="btn btn-secondary flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            編集
          </Link>
          <button onClick={handleDelete} className="btn btn-danger flex items-center">
            <Trash2 className="h-5 w-5 mr-2" />
            削除
          </button>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{crop.name}</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                crop.status === 'growing' 
                  ? 'bg-green-100 text-green-800'
                  : crop.status === 'harvested'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {crop.status === 'growing' ? '成長中' : crop.status === 'harvested' ? '収穫済み' : '除去済み'}
              </span>
            </div>
          </div>
          {crop.status === 'growing' && (
            <button onClick={handleHarvest} className="btn btn-primary">
              収穫済みにマーク
            </button>
          )}
        </div>

        {crop.imageUrl && (
          <div className="mb-6">
            <img
              src={crop.imageUrl}
              alt={crop.name}
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center text-gray-600 mb-2">
              <Sprout className="h-5 w-5 mr-2" />
              <span className="font-medium">品種</span>
            </div>
            <p className="text-gray-900">{crop.variety}</p>
          </div>

          <div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="font-medium">場所</span>
            </div>
            <p className="text-gray-900">{crop.location}</p>
          </div>

          <div>
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">植え付け日</span>
            </div>
            <p className="text-gray-900">{formatDate(crop.plantingDate)}</p>
          </div>

          <div>
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {crop.status === 'growing' ? '収穫予定日' : '収穫日'}
              </span>
            </div>
            <p className="text-gray-900">
              {crop.actualHarvestDate 
                ? formatDate(crop.actualHarvestDate)
                : formatDate(crop.expectedHarvestDate)}
              {daysUntilHarvest !== null && (
                <span className={`ml-2 ${
                  daysUntilHarvest <= 7 ? 'text-red-600 font-semibold' : 'text-gray-600'
                }`}>
                  ({daysUntilHarvest === 0 ? '今日' : `${daysUntilHarvest}日後`})
                </span>
              )}
            </p>
          </div>
        </div>

        {crop.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">メモ</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{crop.notes}</p>
          </div>
        )}
      </div>

      {/* 成長記録 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">成長記録</h3>
          <button
            onClick={() => setShowGrowthModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            記録を追加
          </button>
        </div>
        {growthRecords.length > 0 ? (
          <div className="space-y-4">
            {growthRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                </div>
                {record.notes && (
                  <p className="text-gray-600 mb-2 whitespace-pre-wrap">{record.notes}</p>
                )}
                {(record.height || record.width) && (
                  <div className="flex gap-4 text-sm text-gray-600">
                    {record.height && <span>高さ: {record.height}cm</span>}
                    {record.width && <span>幅: {record.width}cm</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">成長記録がありません</p>
        )}
      </div>

      {/* タスク */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">タスク</h3>
          <button
            onClick={() => setShowTaskModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            タスクを追加
          </button>
        </div>
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {pendingTasks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">未完了</h4>
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="btn btn-primary text-sm"
                      >
                        完了
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {completedTasks.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">完了済み</h4>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <p className="font-medium text-gray-900 line-through">{task.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        完了日: {task.completedDate ? formatDate(task.completedDate) : '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">タスクがありません</p>
        )}
      </div>

      {showGrowthModal && (
        <GrowthRecordModal
          cropId={crop.id}
          onClose={() => setShowGrowthModal(false)}
        />
      )}

      {showTaskModal && (
        <TaskModal
          cropId={crop.id}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
};

export default CropDetail;

