import { Suspense, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import { Toaster } from './components/ui/sonner';
import { hasStoredSession } from './config/auth';
import { protectedRoutes } from './config/routes';

function AuthGuard({ children }: { children: ReactNode }) {
  if (!hasStoredSession()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
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
                    {protectedRoutes.map(({ path, component: Component }) => (
                      <Route key={path} path={path} element={<Component />} />
                    ))}
                    <Route path="*" element={<Navigate to="/" replace />} />
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
