import { createContext, useCallback, useContext, useState } from 'react';
import { cleanToast } from '../utils/adminMessages';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((text, variant = 'info') => {
    const message = cleanToast(text);
    if (!message) return;
    setToast({ message, variant });
    window.clearTimeout(show._t);
    show._t = window.setTimeout(() => setToast(null), variant === 'error' ? 4500 : 3200);
  }, []);

  const showMock = useCallback((text) => show(text, 'info'), [show]);
  const showSuccess = useCallback((text) => show(text, 'success'), [show]);
  const showError = useCallback((text) => show(text, 'error'), [show]);

  return (
    <SnackbarContext.Provider value={{ showMock, showSuccess, showError }}>
      {children}
      {toast && (
        <div
          className={`snackbar snackbar--${toast.variant}`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
        >
          {toast.message}
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
