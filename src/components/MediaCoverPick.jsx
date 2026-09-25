import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSnackbar } from '../context/SnackbarContext';
import { uploadLibraryCover } from '../services/supabase/libraryPdfService';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp';

/** صورة خلفية للمقطع — تُرفع فوراً إلى library-covers وتُعيد الرابط العام. */
export function MediaCoverPick({ value, onChange, fallbackUrl }) {
  const { showError, showSuccess } = useSnackbar();
  const [uploading, setUploading] = useState(false);

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACCEPT.split(',').includes(file.type)) {
      showError('الصيغ المدعومة: PNG أو JPG أو WEBP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      showError('حجم الصورة أكبر من 5 ميجا.');
      return;
    }
    setUploading(true);
    const { data, error } = await uploadLibraryCover(file);
    setUploading(false);
    if (error || !data?.url) {
      showError(`تعذّر رفع الصورة: ${error?.message ?? 'خطأ غير معروف'}`);
      return;
    }
    onChange(data.url);
    showSuccess('تم رفع صورة الخلفية');
  };

  const shown = value || fallbackUrl;

  return (
    <div className="cms-field media-cover-pick">
      <span>صورة الخلفية (تظهر في التطبيق قبل تشغيل الفيديو)</span>
      <div className="media-cover-pick__row">
        <div className={`media-cover-pick__thumb ${shown ? '' : 'media-cover-pick__thumb--empty'}`}>
          {shown ? <img src={shown} alt="" /> : <ImagePlus size={22} />}
          {!value && fallbackUrl && (
            <span className="media-cover-pick__badge">صورة YouTube</span>
          )}
        </div>
        <div className="media-cover-pick__actions">
          <label className="mock-btn mock-btn--outline" style={{ cursor: 'pointer' }}>
            {uploading ? <Loader2 size={14} className="spin" /> : <ImagePlus size={14} />}
            {uploading ? 'جاري الرفع…' : value ? 'تغيير الصورة' : 'اختيار صورة'}
            <input
              type="file"
              accept={ACCEPT}
              style={{ display: 'none' }}
              disabled={uploading}
              onChange={handlePick}
            />
          </label>
          {value && (
            <button
              type="button"
              className="mock-btn mock-btn--outline"
              onClick={() => onChange('')}
              disabled={uploading}
            >
              <Trash2 size={14} /> إزالة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
