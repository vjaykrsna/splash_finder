import { Suspense, type ReactElement, type JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { LoginPage } from '@/pages/LoginPage';
import { SearchPage } from '@/pages/SearchPage';

const ProtectedRoute = ({ children }: { children: ReactElement }): JSX.Element => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AppRouter = (): JSX.Element => (
  <Suspense fallback={<div>Loading…</div>}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/search" replace />} />
      <Route path="*" element={<Navigate to="/search" replace />} />
    </Routes>
  </Suspense>
);
