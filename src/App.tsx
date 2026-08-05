import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Students from './pages/Students';
import Groups from './pages/Groups';
import Tasks from './pages/Tasks';
import Chats from './pages/Chats';
import Teachers from './pages/Teachers';
import TeacherSchedule from './pages/TeacherSchedule';
import AdminSchedule from './pages/AdminSchedule';
import Clubs from './pages/Clubs';
import Contracts from './pages/Contracts';
import Dictionaries from './pages/Dictionaries';
import Payments from './pages/Payments';
import Events from './pages/Events';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Leads from './pages/Leads';
import Permissions from './pages/Permissions';
import { Toaster } from './components/ui/sonner';

const AUTH_KEY = 'crm_current_user_id';

function isAuthenticated() {
  return !!localStorage.getItem(AUTH_KEY);
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/chats" element={<Chats />} />
                  <Route path="/teachers" element={<Teachers />} />
                  <Route path="/teacher-schedule" element={<TeacherSchedule />} />
                  <Route path="/admin-schedule" element={<AdminSchedule />} />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/dictionaries" element={<Dictionaries />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/permissions" element={<Permissions />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
