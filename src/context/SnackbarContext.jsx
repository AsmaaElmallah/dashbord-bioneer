import { createContext, useCallback, useContext, useState } from 'react';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [message, setMessage] = useState(null);

  const showMock = useCallback((text = 'UI فقط — لا يوجد Backend') => {
    setMessage(text);
    window.clearTimeout(showMock._t);
    showMock._t = window.setTimeout(() => setMessage(null), 2800);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showMock }}>
      {children}
      {message && (
        <div className="snackbar" role="status">
          {message}
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
