import { useSnackbar } from '../context/SnackbarContext';

const ACTION_MESSAGES = {
  save: 'تم الحفظ',
  publish: 'تم النشر',
  check: 'اكتمل الفحص',
  export: 'تم التصدير',
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
  const snackText = message ?? (action ? ACTION_MESSAGES[action] : 'تم التنفيذ');

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
