import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { AdminShell } from './layout/AdminShell';
import { OverviewPage } from './pages/OverviewPage';
import { UsersPage } from './pages/UsersPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { QuranPage } from './pages/QuranPage';
import { MathPage } from './pages/MathPage';
import { VisualPage } from './pages/VisualPage';
import { EmotionalPage } from './pages/EmotionalPage';
import { LibraryPage } from './pages/LibraryPage';
import { CoursesPage } from './pages/CoursesPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { CommunityPage } from './pages/CommunityPage';
import { CmsPage } from './pages/CmsPage';
import { OnboardingVideosPage } from './pages/OnboardingVideosPage';
import { AssetsPage } from './pages/AssetsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AiPage } from './pages/AiPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <SnackbarProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="curriculum" element={<CurriculumPage />} />
            <Route path="quran" element={<QuranPage />} />
            <Route path="math" element={<MathPage />} />
            <Route path="visual" element={<VisualPage />} />
            <Route path="emotional" element={<EmotionalPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="live" element={<Navigate to="/courses" replace />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="onboarding" element={<OnboardingVideosPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="ai" element={<AiPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </SnackbarProvider>
  );
}
