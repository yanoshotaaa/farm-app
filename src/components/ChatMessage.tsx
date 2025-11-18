import { formatDateTime } from '../utils/dateUtils';
import { Trash2, User, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatMessage } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
  onDelete?: (id: string) => void;
}

const ChatMessageComponent = ({ message, onDelete }: ChatMessageProps) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-600" />
          </div>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          {message.cropId && (
            <Link
              to={`/crops/${message.cropId}`}
              className={`text-xs mt-1 block underline ${
                isUser ? 'text-primary-100' : 'text-primary-600'
              }`}
            >
              関連する作物を見る →
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {formatDateTime(message.timestamp)}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
              title="削除"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessageComponent;

