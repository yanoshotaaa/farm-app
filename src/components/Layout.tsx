import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  CheckSquare, 
  MapPin,
  Menu,
  X,
  Calendar,
  Database,
  MessageCircle,
  LogOut,
  User
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    if (window.confirm('ログアウトしますか？')) {
      await signOut();
      navigate('/login');
    }
  };

  const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
    { name: '作物一覧', href: '/crops', icon: Sprout },
    { name: 'カレンダー', href: '/calendar', icon: Calendar },
    { name: 'タスク', href: '/tasks', icon: CheckSquare },
    { name: '畑・区画', href: '/areas', icon: MapPin },
    { name: 'チャット', href: '/chat', icon: MessageCircle },
    { name: 'データ管理', href: '/data', icon: Database },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">農業作物管理</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {user && (
                <div className="hidden md:flex items-center gap-2 mr-4">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="btn btn-secondary flex items-center text-sm"
                title="ログアウト"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">ログアウト</span>
              </button>
              
              {/* モバイルメニューボタン */}
              <button
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー（デスクトップ） */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 md:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

