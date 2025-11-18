import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CropList from './pages/CropList';
import CropDetail from './pages/CropDetail';
import CropForm from './pages/CropForm';
import TaskList from './pages/TaskList';
import FarmAreaList from './pages/FarmAreaList';
import CalendarView from './pages/CalendarView';
import Chat from './pages/Chat';
import DataManagement from './pages/DataManagement';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { useCropStore } from './store/cropStore';
import { useChatStore } from './store/chatStore';

// 認証が必要なルートを保護するコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  const { loadData } = useCropStore();
  const { loadMessages } = useChatStore();

  useEffect(() => {
    if (user && !loading) {
      // データを読み込む
      loadData();
      loadMessages();
    }
  }, [user, loading, loadData, loadMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // 認証状態の監視を開始
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/dashboard" replace />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops"
          element={
            <ProtectedRoute>
              <Layout>
                <CropList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops/new"
          element={
            <ProtectedRoute>
              <Layout>
                <CropForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <CropDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <CropForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <CalendarView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <TaskList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas"
          element={
            <ProtectedRoute>
              <Layout>
                <FarmAreaList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute>
              <Layout>
                <DataManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;

