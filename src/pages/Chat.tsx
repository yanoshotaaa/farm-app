import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useCropStore } from '../store/cropStore';
import ChatMessageComponent from '../components/ChatMessage';
import { Send, Trash2, Bot } from 'lucide-react';

const Chat = () => {
  const { messages, addMessage, clearMessages, deleteMessage, loadMessages } = useChatStore();
  const { crops } = useCropStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 初回読み込み
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    // メッセージが追加されたら自動スクロール
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    inputRef.current?.focus();

    // ユーザーメッセージを追加
    await addMessage(userMessage, 'user');

    // 簡単な応答ロジック（キーワードベース）
    setTimeout(async () => {
      const response = generateResponse(userMessage);
      await addMessage(response.text, 'system', response.cropId);
    }, 500);
  };

  const generateResponse = (text: string): { text: string; cropId?: string } => {
    const lowerText = text.toLowerCase();

    // 作物名を検索
    const mentionedCrop = crops.find(
      (crop) =>
        lowerText.includes(crop.name.toLowerCase()) ||
        lowerText.includes(crop.variety.toLowerCase())
    );

    if (mentionedCrop) {
      const statusText =
        mentionedCrop.status === 'growing'
          ? '成長中'
          : mentionedCrop.status === 'harvested'
          ? '収穫済み'
          : '除去済み';
      return {
        text: `${mentionedCrop.name}（${mentionedCrop.variety}）についてですね。\n現在の状態: ${statusText}\n場所: ${mentionedCrop.location}\n植え付け日: ${new Date(mentionedCrop.plantingDate).toLocaleDateString('ja-JP')}`,
        cropId: mentionedCrop.id,
      };
    }

    // キーワードベースの応答
    if (lowerText.includes('こんにちは') || lowerText.includes('はじめまして')) {
      return { text: 'こんにちは！農業作物管理アプリのチャットです。\n作物について質問してください。' };
    }
    if (lowerText.includes('ありがとう') || lowerText.includes('thanks')) {
      return { text: 'どういたしまして！他に何かお手伝いできることはありますか？' };
    }
    if (lowerText.includes('ヘルプ') || lowerText.includes('help') || lowerText.includes('使い方')) {
      return {
        text: '以下のことができます：\n・作物名や品種を言うと、その作物の情報を表示します\n・「こんにちは」と挨拶すると返事します\n・作物の管理について質問できます',
      };
    }
    if (lowerText.includes('作物') || lowerText.includes('crop')) {
      if (crops.length === 0) {
        return { text: 'まだ作物が登録されていません。作物一覧ページから新しい作物を追加してください。' };
      }
      return {
        text: `現在 ${crops.length} 件の作物が登録されています。\n作物名や品種を言うと、詳細情報を表示します。`,
      };
    }

    // デフォルト応答
    return {
      text: '申し訳ございませんが、その質問にはお答えできません。\n作物名や品種を言っていただければ、その作物の情報を表示できます。',
    };
  };

  const handleClear = async () => {
    if (window.confirm('すべてのメッセージを削除しますか？')) {
      await clearMessages();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary-600" />
          <h2 className="text-3xl font-bold text-gray-900">チャット</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="btn btn-secondary flex items-center"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            履歴をクリア
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bot className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-lg">メッセージがありません</p>
              <p className="text-sm mt-2">作物について質問してみてください</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onDelete={deleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 入力エリア */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <textarea
              ref={inputRef}
              id="chat-input"
              name="chatInput"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              className="flex-1 input resize-none"
              rows={2}
              placeholder="メッセージを入力... (Enterで送信、Shift+Enterで改行)"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;

