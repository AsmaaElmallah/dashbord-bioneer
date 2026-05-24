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
import { ContentStudioPage } from './pages/ContentStudioPage';
import { ContentWizardPage } from './pages/ContentWizardPage';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { LessonBuilderPage } from './pages/LessonBuilderPage';
import { SlideEditorPage } from './pages/SlideEditorPage';
import { QuranSessionEditorPage } from './pages/QuranSessionEditorPage';
import { LibraryContentEditorPage } from './pages/LibraryContentEditorPage';
import { ActivityExerciseEditorPage } from './pages/ActivityExerciseEditorPage';
import { AssessmentBuilderPage } from './pages/AssessmentBuilderPage';
import { NotificationContentEditorPage } from './pages/NotificationContentEditorPage';
import { ContentReviewPage } from './pages/ContentReviewPage';
import { AppContentPreviewPage } from './pages/AppContentPreviewPage';
import { BulkImportPage } from './pages/BulkImportPage';
import { ContentInventoryPage } from './pages/ContentInventoryPage';
import { ImageContentEditorPage } from './pages/ImageContentEditorPage';
import { AudioContentEditorPage } from './pages/AudioContentEditorPage';

export default function App() {
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="content-studio" element={<ContentStudioPage />} />
            <Route path="content-studio/new" element={<ContentWizardPage />} />
            <Route path="content-studio/article" element={<ArticleEditorPage />} />
            <Route path="content-studio/lesson" element={<LessonBuilderPage />} />
            <Route path="content-studio/slide" element={<SlideEditorPage />} />
            <Route path="content-studio/image" element={<ImageContentEditorPage />} />
            <Route path="content-studio/audio" element={<AudioContentEditorPage />} />
            <Route path="content-studio/quran-session" element={<QuranSessionEditorPage />} />
            <Route path="content-studio/library" element={<LibraryContentEditorPage />} />
            <Route path="content-studio/activity-exercise" element={<ActivityExerciseEditorPage />} />
            <Route path="content-studio/assessment" element={<AssessmentBuilderPage />} />
            <Route path="content-studio/notification" element={<NotificationContentEditorPage />} />
            <Route path="content-studio/app-preview" element={<AppContentPreviewPage />} />
            <Route path="content-studio/bulk-import" element={<BulkImportPage />} />
            <Route path="content-inventory" element={<ContentInventoryPage />} />
            <Route path="content-review" element={<ContentReviewPage />} />
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
