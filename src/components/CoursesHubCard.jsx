import { useEffect, useState } from 'react';
import { AdminCard } from './AdminCard';
import { MediaCoverPick } from './MediaCoverPick';
import { MediaVideoSourceFields } from './MediaVideoSourceFields';
import { SectionHeader } from './SectionHeader';
import { useSnackbar } from '../context/SnackbarContext';
import { parseYoutubeVideoId } from '../data/contentLibraryAdmin';
import { getYoutubeThumbnailUrl } from '../data/libraryContentEditor';
import { emptyCoursesHub, loadCoursesHub, saveCoursesHub, translateCoursesError } from '../services/supabase/coursesService';

/** Intro video + page copy shown at the top of الدورات in the app. */
export function CoursesHubCard() {
  const { showError, showSuccess } = useSnackbar();
  const [hub, setHub] = useState(emptyCoursesHub());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCoursesHub().then(({ data, error }) => {
      if (error) showError(translateCoursesError(error.message) ?? 'تعذّر تحميل صفحة الدورات');
      else setHub(data);
    });
  }, [showError]);

  const patch = (changes) => setHub((h) => ({ ...h, ...changes }));

  const videoDraft = {
    sourceType: hub.sourceType,
    youtubeInput: hub.introYoutube,
    videoUrl: hub.introVideoUrl,
  };

  const setVideoDraft = (updater) => {
    setHub((h) => {
      const current = {
        sourceType: h.sourceType,
        youtubeInput: h.introYoutube,
        videoUrl: h.introVideoUrl,
      };
      const next = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...h,
        sourceType: next.sourceType ?? h.sourceType,
        introYoutube: next.youtubeInput ?? h.introYoutube,
        introVideoUrl: next.videoUrl ?? h.introVideoUrl,
      };
    });
  };

  const onSave = async () => {
    setSaving(true);
    const { error } = await saveCoursesHub(hub);
    setSaving(false);
    if (error) showError(translateCoursesError(error.message) ?? 'تعذّر الحفظ');
    else showSuccess('اتحفظت صفحة الدورات في التطبيق');
  };

  const youtubeThumbId = hub.sourceType !== 'upload' ? parseYoutubeVideoId(hub.introYoutube) : '';

  return (
    <AdminCard>
      <SectionHeader title="صفحة الدورات في التطبيق" />
      <p className="text-caption">
        ده اللي بيظهر فوق أول ما الأم تضغط «الدورات»: فيديو تعريف عن الدورات (مش درس)، وبعدين العنوان والمدرّبة.
        الفيديو ممكن يكون رابط YouTube أو ملف ترفعِيه (MP4 مفضّل). للفيديوهات الكبيرة استخدمي YouTube.
        بعد الرفع أو لصق الرابط اضغطي «حفظ صفحة الدورات».
        أسماء الدورات والدروس بتتحط من الجدول تحت.
      </p>
      <MediaVideoSourceFields
        draft={videoDraft}
        setDraft={setVideoDraft}
        onYoutubeInput={(value) => patch({ introYoutube: value, sourceType: 'youtube' })}
        youtubePlaceholder="https://youtu.be/… أو https://www.youtube.com/watch?v=…"
        allowPlaylist={false}
      />
      <MediaCoverPick
        label="صورة غلاف فيديو التعريف"
        value={hub.introCover}
        onChange={(url) => patch({ introCover: url })}
        fallbackUrl={youtubeThumbId ? getYoutubeThumbnailUrl(youtubeThumbId) : ''}
      />
      <div className="grid-2" style={{ gap: 12 }}>
        <label className="cms-field">
          عنوان الصفحة
          <input
            type="text"
            placeholder="مثال: دبلوم تنمية مهارات وتطور الرضع"
            value={hub.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </label>
        <label className="cms-field">
          التصنيف
          <input
            type="text"
            placeholder="مثال: نمو وتطور الرضيع (٠-٢ سنة)"
            value={hub.category}
            onChange={(e) => patch({ category: e.target.value })}
          />
        </label>
      </div>
      <label className="cms-field">
        سطر تحت العنوان
        <input type="text" value={hub.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
      </label>
      <label className="cms-field">
        الوصف
        <textarea rows={3} value={hub.description} onChange={(e) => patch({ description: e.target.value })} />
      </label>
      <div className="grid-2" style={{ gap: 12 }}>
        <label className="cms-field">
          اسم المدرّبة
          <input type="text" value={hub.instructorName} onChange={(e) => patch({ instructorName: e.target.value })} />
        </label>
        <label className="cms-field">
          لقب المدرّبة
          <input type="text" value={hub.instructorTitle} onChange={(e) => patch({ instructorTitle: e.target.value })} />
        </label>
      </div>
      <MediaCoverPick
        label="صورة المدرّبة (اختياري)"
        value={hub.instructorAvatar}
        onChange={(url) => patch({ instructorAvatar: url })}
      />
      <label className="cms-field">
        لينك صفحة فيسبوك (زرار متابعة في التطبيق)
        <input
          type="url"
          dir="ltr"
          placeholder="https://www.facebook.com/...."
          value={hub.facebookUrl ?? ''}
          onChange={(e) => patch({ facebookUrl: e.target.value })}
        />
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="mock-btn mock-btn--primary" disabled={saving} onClick={onSave}>
          {saving ? 'جاري الحفظ…' : 'حفظ صفحة الدورات'}
        </button>
      </div>
    </AdminCard>
  );
}
