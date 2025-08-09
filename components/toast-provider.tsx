"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Toast, ToastContainer, ToastProps, ToastVariant } from "./ui/toast";
import { setGlobalToast } from "@/lib/toast";

// Toast context interface
interface ToastContextType {
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  removeToast: (id: string) => void;
  toasts: ToastProps[];
}

// Create toast context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Connect the global toast utility functions
  useEffect(() => {
    setGlobalToast(addToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
