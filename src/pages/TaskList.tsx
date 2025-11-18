import { useCropStore } from '../store/cropStore';
import { formatDate, getDaysUntil } from '../utils/dateUtils';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import TaskModal from '../components/TaskModal';

const TaskList = () => {
  const { getTasks, completeTask, getCrop } = useCropStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const allTasks = getTasks();
  const filteredTasks = allTasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      watering: '水やり',
      fertilizing: '施肥',
      pruning: '剪定',
      harvesting: '収穫',
      other: 'その他',
    };
    return labels[type] || type;
  };

  const getTaskTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      watering: 'bg-blue-100 text-blue-800',
      fertilizing: 'bg-yellow-100 text-yellow-800',
      pruning: 'bg-green-100 text-green-800',
      harvesting: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">タスク一覧</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          新しいタスクを追加
        </button>
      </div>

      {/* フィルター */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            未完了
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            完了済み
          </button>
        </div>
      </div>

      {/* 未完了タスク */}
      {pendingTasks.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            未完了タスク ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const crop = getCrop(task.cropId);
              const daysUntil = getDaysUntil(task.dueDate);
              const isOverdue = daysUntil < 0;
              const isToday = daysUntil === 0;

              return (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg ${
                    isOverdue
                      ? 'border-red-300 bg-red-50'
                      : isToday
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                          {getTaskTypeLabel(task.type)}
                        </span>
                        {crop && (
                          <Link
                            to={`/crops/${crop.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {crop.name}
                          </Link>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          期限: {formatDate(task.dueDate)}
                        </span>
                        <span
                          className={`font-medium ${
                            isOverdue
                              ? 'text-red-600'
                              : isToday
                              ? 'text-orange-600'
                              : daysUntil <= 3
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntil)}日遅れ`
                            : isToday
                            ? '今日'
                            : `${daysUntil}日後`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await completeTask(task.id);
                        } catch (error) {
                          alert('タスクの完了に失敗しました。もう一度お試しください。');
                        }
                      }}
                      className="btn btn-primary ml-4"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 完了済みタスク */}
      {completedTasks.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            完了済みタスク ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => {
              const crop = getCrop(task.cropId);
              return (
                <div
                  key={task.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                      {getTaskTypeLabel(task.type)}
                    </span>
                    {crop && (
                      <Link
                        to={`/crops/${crop.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {crop.name}
                      </Link>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 line-through mb-1">{task.title}</h4>
                  <p className="text-sm text-gray-500">
                    完了日: {task.completedDate ? formatDate(task.completedDate) : '-'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {filter === 'all' ? 'タスクがありません' : filter === 'pending' ? '未完了のタスクがありません' : '完了済みのタスクがありません'}
          </p>
          {filter !== 'completed' && (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              最初のタスクを追加
            </button>
          )}
        </div>
      )}

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default TaskList;

