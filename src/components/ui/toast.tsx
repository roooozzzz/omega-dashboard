"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-stripe-success" />,
  error: <AlertCircle className="w-5 h-5 text-stripe-danger" />,
  info: <Info className="w-5 h-5 text-stripe-purple" />,
  warning: <AlertTriangle className="w-5 h-5 text-stripe-warning" />,
};

const toastStyles: Record<ToastType, string> = {
  success: "border-l-4 border-l-stripe-success",
  error: "border-l-4 border-l-stripe-danger",
  info: "border-l-4 border-l-stripe-purple",
  warning: "border-l-4 border-l-stripe-warning",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // 自动移除
    const duration = toast.duration ?? 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              bg-white rounded-lg shadow-lg border border-stripe-border
              p-4 flex items-start gap-3 animate-in slide-in-from-right-5
              ${toastStyles[toast.type]}
            `}
          >
            {toastIcons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-stripe-ink">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-sm text-stripe-ink-lighter mt-0.5">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stripe-ink-lighter hover:text-stripe-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
