import { ImageIcon, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { mockFileFromInput } from '../utils/mediaUpload';

export function ImageFilePick({ label = 'صورة الشريحة', file, onPick, accept = 'image/*' }) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const handlePick = (fileList) => {
    const picked = mockFileFromInput(fileList?.[0]);
    if (picked) {
      onPick(picked);
      showMock('تم اختيار الصورة');
    }
  };

  return (
    <div className="image-file-pick">
      <p className="image-file-pick__label">{label}</p>
      <div
        className="media-dropzone__zone image-file-pick__zone"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <ImageIcon size={28} strokeWidth={1.5} />
        <p className="media-dropzone__title">PNG / JPG</p>
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <Upload size={16} />
          اختر صورة
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            handlePick(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {file && (
        <ul className="media-dropzone__files">
          <li className="media-dropzone__file">
            <span className="media-dropzone__file-name">{file.name}</span>
            <span className="text-caption">{file.sizeMock}</span>
            <StatusBadge tone="info">جاهزة</StatusBadge>
            <button type="button" className="media-dropzone__remove" aria-label="إزالة" onClick={() => onPick(null)}>
              <X size={14} />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
