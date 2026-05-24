import { useSnackbar } from '../context/SnackbarContext';

const ACTION_MESSAGES = {
  save: 'حفظ (UI فقط) — لم يُخزَّن أي شيء',
  publish: 'نشر (UI فقط) — لم يُنشر للمستخدمين',
  check: 'فحص (UI فقط) — لا تحقق حقيقي',
  export: 'تصدير (UI فقط) — لم يُنزَّل ملف',
};

export function MockActionButton({
  children,
  variant = 'primary',
  onClick,
  message,
  action,
  ...rest
}) {
  const { showMock } = useSnackbar();
  const snackText = message ?? (action ? ACTION_MESSAGES[action] : 'UI فقط — لا يوجد Backend');

  return (
    <button
      type="button"
      className={`mock-btn mock-btn--${variant}`}
      onClick={() => {
        onClick?.();
        showMock(snackText);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
