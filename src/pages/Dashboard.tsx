import { useCropStore } from '../store/cropStore';
import { calculateStatistics } from '../utils/statistics';
import { formatDate, getDaysUntil } from '../utils/dateUtils';
import { 
  Sprout, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { crops, tasks } = useCropStore();
  const stats = calculateStatistics(crops, tasks);

  // 近々の収穫予定
  const upcomingHarvests = crops
    .filter((c) => c.status === 'growing')
    .map((c) => ({
      ...c,
      daysUntil: getDaysUntil(c.expectedHarvestDate),
    }))
    .filter((c) => c.daysUntil >= 0 && c.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  // 期限切れ・近々のタスク
  const urgentTasks = tasks
    .filter((t) => !t.completed)
    .map((t) => ({
      ...t,
      daysUntil: getDaysUntil(t.dueDate),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  // 状態別の作物数（グラフ用）
  const statusData = [
    { name: '成長中', value: stats.growingCrops, color: '#22c55e' },
    { name: '収穫済み', value: stats.harvestedCrops, color: '#3b82f6' },
    { name: '除去済み', value: stats.removedCrops, color: '#6b7280' },
  ];

  // 月別の作物数（グラフ用）
  const monthlyData = crops.reduce((acc, crop) => {
    const month = formatDate(crop.plantingDate, 'yyyy年MM月');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData)
    .map(([name, value]) => ({ name, value }))
    .slice(-6);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
        <Link to="/crops/new" className="btn btn-primary">
          新しい作物を追加
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総作物数</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCrops}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Sprout className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">成長中</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.growingCrops}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">収穫済み</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.harvestedCrops}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">未完了タスク</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingTasks}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            状態別の作物数
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            月別の植え付け数
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 近々の収穫予定 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            近々の収穫予定（7日以内）
          </h3>
          {upcomingHarvests.length > 0 ? (
            <div className="space-y-3">
              {upcomingHarvests.map((crop) => (
                <Link
                  key={crop.id}
                  to={`/crops/${crop.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{crop.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {crop.variety} - {crop.location}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(crop.expectedHarvestDate)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      crop.daysUntil === 0
                        ? 'bg-red-100 text-red-800'
                        : crop.daysUntil <= 3
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {crop.daysUntil === 0 ? '今日' : `${crop.daysUntil}日後`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">近々の収穫予定はありません</p>
          )}
        </div>

        {/* 緊急タスク */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            緊急タスク
          </h3>
          {urgentTasks.length > 0 ? (
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/crops/${task.cropId}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.daysUntil < 0
                        ? 'bg-red-100 text-red-800'
                        : task.daysUntil === 0
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.daysUntil < 0
                        ? `${Math.abs(task.daysUntil)}日遅れ`
                        : task.daysUntil === 0
                        ? '今日'
                        : `${task.daysUntil}日後`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">緊急タスクはありません</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

