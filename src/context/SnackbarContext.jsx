import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { cleanToast } from '../utils/adminMessages';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef();

  const show = useCallback((text, variant, duration) => {
    setToast({ text: cleanToast(text), variant });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  const value = useMemo(
    () => ({
      showMock: (text = 'تم') => show(text, 'info', 2800),
      showSuccess: (text = 'تم الحفظ') => show(text, 'success', 2800),
      showError: (text = 'حدث خطأ') => show(text, 'error', 5000),
    }),
    [show],
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`snackbar snackbar--${toast.variant}`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
        >
          {toast.text}
        </div>
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar outside provider');
  return ctx;
}
