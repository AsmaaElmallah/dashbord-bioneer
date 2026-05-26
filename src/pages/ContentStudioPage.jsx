import {
  Bell,
  BookOpen,
  ClipboardList,
  Dumbbell,
  FileText,
  HelpCircle,
  Image,
  Layers,
  ListVideo,
  PenLine,
  Plus,
  ScrollText,
  Smartphone,
  Sparkles,
  Upload,
  Archive,
  Video,
  Volume2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminCard } from '../components/AdminCard';
import { InfoBanner } from '../components/InfoBanner';
import { PageHeader } from '../components/PageHeader';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { articleStaticSections } from '../data/articleEditor';
import { contentStudioStats, contentStudioTypes } from '../data/mockData';

const iconMap = {
  FileText,
  BookOpen,
  Layers,
  Image,
  Video,
  Volume2,
  Sparkles,
  Dumbbell,
  ClipboardList,
  HelpCircle,
  Bell,
  ScrollText,
  ListVideo,
};

function StudioTypeCard({ type, to, cta }) {
  const Icon = iconMap[type.icon] ?? FileText;
  return (
    <AdminCard className="content-studio-card">
      <div className="content-studio-card__head">
        <span className="content-studio-card__icon" aria-hidden>
          <Icon size={28} strokeWidth={1.5} />
        </span>
        <StatusBadge tone={type.needsFiles ? 'warning' : 'info'}>
          {type.needsFiles ? 'يحتاج ملفات' : 'نص فقط'}
        </StatusBadge>
      </div>
      <h3 className="content-studio-card__title">{type.label}</h3>
      <p className="content-studio-card__desc">{type.description}</p>
      {type.filesHint && <p className="text-caption">{type.filesHint}</p>}
      <Link
        to={to}
        className="mock-btn mock-btn--primary"
        style={{ width: '100%', justifyContent: 'center', marginTop: 8, textDecoration: 'none' }}
      >
        {cta}
      </Link>
    </AdminCard>
  );
}

export function ContentStudioPage() {
  const articleType = contentStudioTypes.find((t) => t.id === 'article');
  const lessonType = contentStudioTypes.find((t) => t.id === 'lesson');
  const slideType = contentStudioTypes.find((t) => t.id === 'slide');
  const imageType = contentStudioTypes.find((t) => t.id === 'image');
  const audioType = contentStudioTypes.find((t) => t.id === 'audio');
  const quranSessionType = contentStudioTypes.find((t) => t.id === 'quran_session');
  const libraryType = contentStudioTypes.find((t) => t.id === 'video');
  const activityExerciseType = contentStudioTypes.find((t) => t.id === 'activity');
  const assessmentType = contentStudioTypes.find((t) => t.id === 'test');
  const notificationType = contentStudioTypes.find((t) => t.id === 'notification');
  const otherTypes = contentStudioTypes.filter(
    (t) =>
      t.id !== 'article' &&
      t.id !== 'lesson' &&
      t.id !== 'slide' &&
      t.id !== 'image' &&
      t.id !== 'audio' &&
      t.id !== 'quran_session' &&
      t.id !== 'video' &&
      t.id !== 'playlist' &&
      t.id !== 'activity' &&
      t.id !== 'exercise' &&
      t.id !== 'test' &&
      t.id !== 'question' &&
      t.id !== 'notification',
  );

  return (
    <div className="page-stack content-entry-page">
      <PageHeader title="استوديو المحتوى" extraBadges={['إضافة محتوى']} />

      <AdminCard>
        <p style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0 }}>
          <Link to="/content-studio/new" className="mock-btn mock-btn--primary content-studio-new-link">
            <Plus size={18} />
            إنشاء محتوى جديد (معالج)
          </Link>
          <Link to="/content-studio/article" className="mock-btn mock-btn--outline content-studio-new-link">
            <PenLine size={18} />
            محرر مقال / نص ثابت
          </Link>
          <Link to="/content-studio/lesson" className="mock-btn mock-btn--outline content-studio-new-link">
            <BookOpen size={18} />
            منشئ الدرس
          </Link>
          <Link to="/content-studio/slide" className="mock-btn mock-btn--outline content-studio-new-link">
            <Layers size={18} />
            محرر الشريحة
          </Link>
          <Link to="/content-studio/image" className="mock-btn mock-btn--outline content-studio-new-link">
            <Image size={18} />
            محرر الصورة
          </Link>
          <Link to="/content-studio/audio" className="mock-btn mock-btn--outline content-studio-new-link">
            <Volume2 size={18} />
            محرر الصوت
          </Link>
          <Link to="/content-studio/quran-session" className="mock-btn mock-btn--outline content-studio-new-link">
            <ScrollText size={18} />
            محرر جلسة قرآن
          </Link>
          <Link to="/content-studio/library" className="mock-btn mock-btn--outline content-studio-new-link">
            <Video size={18} />
            محرر محتوى المكتبة
          </Link>
          <Link
            to="/content-studio/activity-exercise"
            className="mock-btn mock-btn--outline content-studio-new-link"
          >
            <Dumbbell size={18} />
            محرر الأنشطة والرياضة
          </Link>
          <Link to="/content-studio/assessment" className="mock-btn mock-btn--outline content-studio-new-link">
            <ClipboardList size={18} />
            منشئ الاختبارات
          </Link>
          <Link to="/content-studio/notification" className="mock-btn mock-btn--outline content-studio-new-link">
            <Bell size={18} />
            محرر الإشعارات
          </Link>
          <Link to="/content-studio/app-preview" className="mock-btn mock-btn--outline content-studio-new-link">
            <Smartphone size={18} />
            معاينة شاشة التطبيق
          </Link>
          <Link to="/content-studio/bulk-import" className="mock-btn mock-btn--outline content-studio-new-link">
            <Upload size={18} />
            استيراد جماعي
          </Link>
          <Link to="/content-inventory" className="mock-btn mock-btn--outline content-studio-new-link">
            <Archive size={18} />
            فهرس المحتوى
          </Link>
          <Link to="/content-review" className="mock-btn mock-btn--outline content-studio-new-link">
            <ClipboardList size={18} />
            مراجعة المحتوى
          </Link>
        </p>
      </AdminCard>

      <div className="grid-4">
        {contentStudioStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="grid-2">
        {articleType && (
          <AdminCard className="content-studio-article-highlight">
            <SectionHeader title="مقال / نص ثابت" />
            <p className="text-caption" style={{ marginTop: 0 }}>
              {articleStaticSections.map((s) => s.label).join('، ')}.
            </p>
            <StudioTypeCard type={articleType} to="/content-studio/article" cta="فتح المحرر" />
          </AdminCard>
        )}
        {lessonType && (
          <AdminCard className="content-studio-lesson-highlight">
            <SectionHeader title="درس — مناهج" />
            <p className="text-caption" style={{ marginTop: 0 }}>
              الحساب · التحفيز البصري · الذكاء العاطفي — جدول شرائح + معاينة جولة.
            </p>
            <StudioTypeCard type={lessonType} to="/content-studio/lesson" cta="فتح LessonBuilder" />
          </AdminCard>
        )}
      </div>

      {slideType && (
        <AdminCard className="content-studio-slide-highlight">
          <SectionHeader title="شريحة — محرر مخصص" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            صورة + صوت + timeline + تحقق قبل النشر — بدون manifest.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard type={slideType} to="/content-studio/slide" cta="فتح SlideEditor" />
          </div>
        </AdminCard>
      )}

      {imageType && (
        <AdminCard className="content-studio-image-highlight">
          <SectionHeader title="صورة — غلاف / شريحة / CMS" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            PNG/JPG · نص بديل · مسار الملف · معاينة في إطار التطبيق.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard type={imageType} to="/content-studio/image" cta="فتح ImageContentEditor" />
          </div>
        </AdminCard>
      )}

      {audioType && (
        <AdminCard className="content-studio-audio-highlight">
          <SectionHeader title="صوت — m4a / mp3" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            تعليق شرائح · جلسات قرآن · أصوات مكتبة — المدة ومسار الملف.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard type={audioType} to="/content-studio/audio" cta="فتح AudioContentEditor" />
          </div>
        </AdminCard>
      )}

      {quranSessionType && (
        <AdminCard className="content-studio-quran-highlight">
          <SectionHeader title="جلسة قرآن — محرر مخصص" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            120 جلسة/ختمة · خطة يومية · ملفات mp3 — متوافق مع صفحة القرآن.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard
              type={quranSessionType}
              to="/content-studio/quran-session"
              cta="فتح QuranSessionEditor"
            />
          </div>
        </AdminCard>
      )}

      {libraryType && (
        <AdminCard className="content-studio-library-highlight">
          <SectionHeader title="المكتبة — فيديو / Playlist YouTube" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            أصوات الطبيعة · موسيقى هادئة · تهويدات — صورة مصغّرة وفحص الرابط.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard
              type={libraryType}
              to="/content-studio/library"
              cta="فتح LibraryContentEditor"
            />
          </div>
        </AdminCard>
      )}

      {activityExerciseType && (
        <AdminCard className="content-studio-activity-highlight">
          <SectionHeader title="نشاط / تمرين — MediaAgeHub" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            7 فئات عمرية · روابط YouTube · إضافة عناصر جديدة.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard
              type={activityExerciseType}
              to="/content-studio/activity-exercise"
              cta="فتح ActivityExerciseEditor"
            />
          </div>
        </AdminCard>
      )}

      {assessmentType && (
        <AdminCard className="content-studio-assessment-highlight">
          <SectionHeader title="اختبار / سؤال — التقييمات" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            بناء الاختبارات والأسئلة · تقدم الطفل · جدول أسئلة.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard
              type={assessmentType}
              to="/content-studio/assessment"
              cta="فتح AssessmentBuilder"
            />
          </div>
        </AdminCard>
      )}

      {notificationType && (
        <AdminCard className="content-studio-notification-highlight">
          <SectionHeader title="إشعار — push للأمهات" />
          <p className="text-caption" style={{ marginTop: 0 }}>
            الجمهور المستهدف · معاينة جوال · جدولة الإرسال.
          </p>
          <div style={{ maxWidth: 320 }}>
            <StudioTypeCard
              type={notificationType}
              to="/content-studio/notification"
              cta="فتح NotificationContentEditor"
            />
          </div>
        </AdminCard>
      )}

      <AdminCard className="content-studio-bulk-highlight">
        <SectionHeader title="استيراد جماعي" />
        <p className="text-caption" style={{ marginTop: 0 }}>
          PPTX · صور/صوت · CSV أسئلة · CSV YouTube · Quran mp3 · manifest — dropzone + mapping + جدول تحقق.
        </p>
        <div style={{ maxWidth: 320 }}>
          <Link
            to="/content-studio/bulk-import"
            className="mock-btn mock-btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, textDecoration: 'none' }}
          >
            <Upload size={18} />
            فتح الاستيراد الجماعي
          </Link>
        </div>
      </AdminCard>

      <AdminCard>
        <SectionHeader title="أنواع المحتوى الأخرى" />
        <div className="content-studio-grid">
          {otherTypes.map((type) => (
            <StudioTypeCard
              key={type.id}
              type={type}
              to={`/content-studio/new?type=${type.id}`}
              cta="إنشاء"
            />
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
