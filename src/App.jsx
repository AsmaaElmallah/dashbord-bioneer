import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import { ActivitiesPage } from './pages/ActivitiesPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { CommunityPage } from './pages/CommunityPage';
import { TargetingPage } from './pages/TargetingPage';
import { CmsPage } from './pages/CmsPage';
import { AssetsPage } from './pages/AssetsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SearchPage } from './pages/SearchPage';
import { DesignSystemPage } from './pages/DesignSystemPage';

export default function App() {
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="curriculum" element={<CurriculumPage />} />
            <Route path="quran" element={<QuranPage />} />
            <Route path="math" element={<MathPage />} />
            <Route path="visual" element={<VisualPage />} />
            <Route path="emotional" element={<EmotionalPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="targeting" element={<TargetingPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="design-system" element={<DesignSystemPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}
