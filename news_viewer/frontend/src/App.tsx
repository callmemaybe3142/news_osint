import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RawNewsPage } from './pages/RawNewsPage';
import { CleanedNewsPage } from './pages/CleanedNewsPage';
import { SavedNewsPage } from './pages/SavedNewsPage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/raw-news"
                element={
                  <ProtectedRoute>
                    <RawNewsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cleaned-news"
                element={
                  <ProtectedRoute>
                    <CleanedNewsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-news"
                element={
                  <ProtectedRoute>
                    <SavedNewsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
