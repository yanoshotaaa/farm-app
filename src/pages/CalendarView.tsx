import { useState } from 'react';
import { useCropStore } from '../store/cropStore';
import { formatDate, getDaysUntil } from '../utils/dateUtils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { ChevronLeft, ChevronRight, Sprout, CheckSquare, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const CalendarView = () => {
  const { crops, tasks } = useCropStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const events: Array<{ type: 'planting' | 'harvest' | 'task'; item: any; label: string }> = [];

    // 植え付け日
    crops.forEach((crop) => {
      if (crop.plantingDate.startsWith(dateStr)) {
        events.push({
          type: 'planting',
          item: crop,
          label: `植え付け: ${crop.name}`,
        });
      }
      if (crop.expectedHarvestDate.startsWith(dateStr) && crop.status === 'growing') {
        events.push({
          type: 'harvest',
          item: crop,
          label: `収穫予定: ${crop.name}`,
        });
      }
      if (crop.actualHarvestDate?.startsWith(dateStr)) {
        events.push({
          type: 'harvest',
          item: crop,
          label: `収穫: ${crop.name}`,
        });
      }
    });

    // タスク
    tasks.forEach((task) => {
      if (task.dueDate.startsWith(dateStr) && !task.completed) {
        events.push({
          type: 'task',
          item: task,
          label: task.title,
        });
      }
    });

    return events;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">カレンダー</h2>
        <button onClick={goToToday} className="btn btn-secondary">
          今日に戻る
        </button>
      </div>

      {/* カレンダーヘッダー */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h3 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'yyyy年MM月', { locale: ja })}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-2">
          {/* 曜日ヘッダー */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-700 py-2"
            >
              {day}
            </div>
          ))}

          {/* 月初の空白 */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* 日付セル */}
          {daysInMonth.map((day) => {
            const events = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const dayNumber = format(day, 'd');

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border border-gray-200 rounded-lg p-2 ${
                  isToday ? 'bg-primary-50 border-primary-300' : 'bg-white'
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-primary-700' : 'text-gray-900'
                  }`}
                >
                  {dayNumber}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-20">
                  {events.slice(0, 3).map((event, idx) => (
                    <Link
                      key={idx}
                      to={
                        event.type === 'task'
                          ? `/crops/${event.item.cropId}`
                          : `/crops/${event.item.id}`
                      }
                      className={`block text-xs px-1 py-0.5 rounded truncate ${
                        event.type === 'planting'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : event.type === 'harvest'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                      title={event.label}
                    >
                      {event.type === 'planting' && <Sprout className="inline h-3 w-3 mr-1" />}
                      {event.type === 'harvest' && <CalendarIcon className="inline h-3 w-3 mr-1" />}
                      {event.type === 'task' && <CheckSquare className="inline h-3 w-3 mr-1" />}
                      <span className="truncate">{event.item.name || event.item.title}</span>
                    </Link>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-gray-500">+{events.length - 3}件</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 凡例 */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">凡例</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-sm text-gray-700">植え付け日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-700">収穫日・収穫予定日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span className="text-sm text-gray-700">タスク</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

