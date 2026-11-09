import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((previous) =>
      previous.filter((toast) => toast.id !== id)
    );
  }, []);

  const addToast = useCallback(
    (message, type = "error") => {
      if (!message) return;

      const id = `${Date.now()}-${Math.random()}`;

      const validType = ["success", "error", "info"].includes(type)
        ? type
        : "error";

      setToasts((previous) => [
        ...previous.slice(-3),
        { id, message: String(message), type: validType },
      ]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, 4000);

      timers.current.set(id, timer);
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      <div
        className="fixed top-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm space-y-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const styles = {
            success: "bg-green-50 border-green-200 text-green-800",
            error: "bg-red-50 border-red-200 text-red-800",
            info: "bg-blue-50 border-blue-200 text-blue-800",
          };

          const Icon =
            toast.type === "success"
              ? CheckCircle
              : toast.type === "info"
              ? Info
              : AlertCircle;

          return (
            <div
              key={toast.id}
              role="status"
              className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium ${styles[toast.type]}`}
            >
              <Icon size={18} className="shrink-0" />

              <p className="flex-1">{toast.message}</p>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
