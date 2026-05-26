import { Upload, Volume2, X } from 'lucide-react';
import { useRef } from 'react';
import { StatusBadge } from './StatusBadge';
import { useSnackbar } from '../context/SnackbarContext';
import { mockFileFromInput } from '../utils/mediaUpload';

export function AudioFilePick({ label = 'ملف الصوت', file, onPick, accept = 'audio/*' }) {
  const inputRef = useRef(null);
  const { showMock } = useSnackbar();

  const handlePick = (fileList) => {
    const picked = mockFileFromInput(fileList?.[0]);
    if (picked) {
      onPick(picked);
      showMock('تم اختيار ملف الصوت');
    }
  };

  return (
    <div className="audio-file-pick">
      <p className="audio-file-pick__label">{label}</p>
      <div
        className="media-dropzone__zone audio-file-pick__zone"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <Volume2 size={28} strokeWidth={1.5} />
        <p className="media-dropzone__title">mp3 / m4a / wav</p>
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <Upload size={16} />
          اختر ملف من جهازك
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
            <StatusBadge tone="info">جاهز</StatusBadge>
            <button type="button" className="media-dropzone__remove" aria-label="إزالة" onClick={() => onPick(null)}>
              <X size={14} />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
