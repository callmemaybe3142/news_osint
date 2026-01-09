import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { RawNewsPage } from './pages/RawNewsPage';
import { CleanedNewsPage } from './pages/CleanedNewsPage';
import { SavedNewsPage } from './pages/SavedNewsPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  LeakedPeoplePage,
  SearchPersonPage,
  SearchMinistryPage,
  SearchPositionPage,
  MinistryStructurePage
} from './pages';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes with Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/raw-news" element={<RawNewsPage />} />
                        <Route path="/cleaned-news" element={<CleanedNewsPage />} />
                        <Route path="/saved-news" element={<SavedNewsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />

                        {/* Leaked People Routes */}
                        <Route path="/leaked-people" element={<LeakedPeoplePage />} />
                        <Route path="/leaked-people/search-person" element={<SearchPersonPage />} />
                        <Route path="/leaked-people/search-ministry" element={<SearchMinistryPage />} />
                        <Route path="/leaked-people/search-position" element={<SearchPositionPage />} />
                        <Route path="/leaked-people/ministry-structure" element={<MinistryStructurePage />} />

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
