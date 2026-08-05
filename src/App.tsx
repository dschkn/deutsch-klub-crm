import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import { Toaster } from './components/ui/sonner';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Applications = lazy(() => import('./pages/Applications'));
const Students = lazy(() => import('./pages/Students'));
const Groups = lazy(() => import('./pages/Groups'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Chats = lazy(() => import('./pages/Chats'));
const Teachers = lazy(() => import('./pages/Teachers'));
const TeacherSchedule = lazy(() => import('./pages/TeacherSchedule'));
const AdminSchedule = lazy(() => import('./pages/AdminSchedule'));
const Clubs = lazy(() => import('./pages/Clubs'));
const Contracts = lazy(() => import('./pages/Contracts'));
const Dictionaries = lazy(() => import('./pages/Dictionaries'));
const Payments = lazy(() => import('./pages/Payments'));
const Events = lazy(() => import('./pages/Events'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Leads = lazy(() => import('./pages/Leads'));
const Permissions = lazy(() => import('./pages/Permissions'));

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

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      Загрузка…
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;
