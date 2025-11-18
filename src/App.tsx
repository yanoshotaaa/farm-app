import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CropList from './pages/CropList';
import CropDetail from './pages/CropDetail';
import CropForm from './pages/CropForm';
import TaskList from './pages/TaskList';
import FarmAreaList from './pages/FarmAreaList';
import CalendarView from './pages/CalendarView';
import Chat from './pages/Chat';
import DataManagement from './pages/DataManagement';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crops" element={<CropList />} />
          <Route path="/crops/new" element={<CropForm />} />
          <Route path="/crops/:id" element={<CropDetail />} />
          <Route path="/crops/:id/edit" element={<CropForm />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/areas" element={<FarmAreaList />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/data" element={<DataManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

