"use client";

import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Toast variant types
export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

// Toast props interface
export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

// Toast component
export const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      id,
      title,
      description,
      variant = "default",
      onClose,
      className,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onClose?.();
      }, 4000); // Auto dismiss after 4 seconds

      return () => clearTimeout(timer);
    }, [onClose]);

    const variantStyles = {
      default:
        "bg-white/80 backdrop-blur-xl border-[#f47b20]/20 text-gray-900 shadow-2xl shadow-[#f47b20]/10",
      success:
        "bg-white/80 backdrop-blur-xl border-[#f47b20]/30 text-gray-900 shadow-2xl shadow-[#f47b20]/15",
      error:
        "bg-white/80 backdrop-blur-xl border-red-200/40 text-gray-900 shadow-2xl shadow-red-500/10",
      warning:
        "bg-white/80 backdrop-blur-xl border-amber-200/40 text-gray-900 shadow-2xl shadow-amber-500/10",
      info: "bg-white/80 backdrop-blur-xl border-blue-200/40 text-gray-900 shadow-2xl shadow-blue-500/10",
    };

    const iconStyles = {
      default: null,
      success: (
        <CheckCircle className="w-4 h-4 text-[#f47b20]" strokeWidth={2.5} />
      ),
      error: <XCircle className="w-4 h-4 text-red-500" strokeWidth={2.5} />,
      warning: (
        <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
      ),
      info: <Info className="w-4 h-4 text-blue-500" strokeWidth={2.5} />,
    };

    const accentStyles = {
      default: "before:bg-[#f47b20]",
      success: "before:bg-[#f47b20]",
      error: "before:bg-red-500",
      warning: "before:bg-amber-500",
      info: "before:bg-blue-500",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto w-full border overflow-hidden toast-enter",
          "relative before:absolute before:top-0 before:left-0 before:w-1 before:h-full",
          "rounded-xl hover:scale-[1.01] transition-all duration-300 ease-out",
          "max-w-sm mx-auto min-h-[60px]",
          variantStyles[variant],
          accentStyles[variant],
          className
        )}
        {...props}
      >
        <div className="px-4 py-4 pl-6">
          <div className="flex items-start gap-3">
            {iconStyles[variant] && (
              <div className="flex-shrink-0 mt-0.5 opacity-90">
                {iconStyles[variant]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {title && (
                <p className="text-sm font-medium leading-tight text-gray-900 mb-1.5 tracking-tight">
                  {title}
                </p>
              )}
              {description && (
                <p className="text-xs leading-relaxed text-gray-600 break-words font-normal">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              className="flex-shrink-0 inline-flex rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 focus:outline-none focus:ring-2 focus:ring-gray-300/50 transition-all duration-200 opacity-70 hover:opacity-100"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Subtle progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200/30">
          <div
            className={cn(
              "h-full toast-progress opacity-60",
              variant === "success" && "bg-emerald-500",
              variant === "error" && "bg-red-500",
              variant === "warning" && "bg-amber-500",
              variant === "info" && "bg-blue-500",
              variant === "default" && "bg-gray-400"
            )}
          />
        </div>
      </div>
    );
  }
);

Toast.displayName = "Toast";

// Toast container component - positioned at top
export const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 space-y-3 pointer-events-none w-full max-w-sm px-4">
      {children}
    </div>
  );
};

// Demo component for testing
export const App = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Modern Toast Demo
        </h1>

        <button
          onClick={() =>
            addToast({
              title: "Success!",
              description: "Your action was completed successfully.",
              variant: "success",
            })
          }
          className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Show Success Toast
        </button>

        <button
          onClick={() =>
            addToast({
              title: "Error occurred",
              description: "Something went wrong. Please try again.",
              variant: "error",
            })
          }
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Show Error Toast
        </button>

        <button
          onClick={() =>
            addToast({
              title: "Warning",
              description: "Please review your input before proceeding.",
              variant: "warning",
            })
          }
          className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Show Warning Toast
        </button>

        <button
          onClick={() =>
            addToast({
              title: "Information",
              description: "Here's some helpful information for you.",
              variant: "info",
            })
          }
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Show Info Toast
        </button>
      </div>

      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </div>
  );
};
