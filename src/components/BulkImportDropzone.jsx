import { Upload, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function BulkImportDropzone({ label, acceptLabel, file, onPick, onClear }) {
  const onDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('media-dropzone--drag');
  };

  const onDragLeave = (e) => {
    e.currentTarget.classList.remove('media-dropzone--drag');
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('media-dropzone--drag');
    onPick();
  };

  return (
    <div className="media-dropzone">
      <p className="media-dropzone__label">{label}</p>
      <div
        className="media-dropzone__zone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onPick()}
        onClick={onPick}
      >
        <Upload size={28} strokeWidth={1.5} />
        <p className="media-dropzone__title">اسحب الملفات هنا (mock)</p>
        <p className="text-caption">أنواع مقبولة: {acceptLabel}</p>
        <button
          type="button"
          className="mock-btn mock-btn--outline"
          onClick={(e) => {
            e.stopPropagation();
            onPick();
          }}
        >
          اختر ملف mock
        </button>
      </div>
      {file && (
        <ul className="media-dropzone__files">
          <li className="media-dropzone__file">
            <span className="media-dropzone__file-name">{file.name}</span>
            <span className="text-caption">{file.sizeMock}</span>
            <StatusBadge tone="warning">لم يُرفع فعلياً</StatusBadge>
            <button type="button" className="media-dropzone__remove" aria-label="إزالة" onClick={onClear}>
              <X size={14} />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
