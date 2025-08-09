import { ToastProps, ToastVariant } from "@/components/ui/toast";

// Global toast functions - these will be set by the ToastProvider
let globalAddToast:
  | ((toast: Omit<ToastProps, "id" | "onClose">) => void)
  | null = null;

// Set the global add toast function
export const setGlobalToast = (
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void
) => {
  globalAddToast = addToast;
};

// Utility functions for different toast types
export const toast = {
  success: (title: string, description?: string) => {
    if (globalAddToast) {
      globalAddToast({
        title,
        description,
        variant: "success",
      });
    }
  },

  error: (title: string, description?: string) => {
    if (globalAddToast) {
      globalAddToast({
        title,
        description,
        variant: "error",
      });
    }
  },

  warning: (title: string, description?: string) => {
    if (globalAddToast) {
      globalAddToast({
        title,
        description,
        variant: "warning",
      });
    }
  },

  info: (title: string, description?: string) => {
    if (globalAddToast) {
      globalAddToast({
        title,
        description,
        variant: "info",
      });
    }
  },

  default: (title: string, description?: string) => {
    if (globalAddToast) {
      globalAddToast({
        title,
        description,
        variant: "default",
      });
    }
  },

  // Custom toast with full control
  custom: (options: Omit<ToastProps, "id" | "onClose">) => {
    if (globalAddToast) {
      globalAddToast(options);
    }
  },
};

// Convenience functions with common use cases
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showWarning = (message: string) => toast.warning(message);
export const showInfo = (message: string) => toast.info(message);

// More specific convenience functions
export const showApiError = (error: any) => {
  const message =
    error?.response?.data?.message || error?.message || "Something went wrong";
  toast.error("Error", message);
};

export const showLoadingError = (action: string) => {
  toast.error("Failed", `Couldn't ${action}. Try again?`);
};

export const showSaveSuccess = (item: string) => {
  toast.success("Saved", `${item} saved successfully`);
};

export const showDeleteSuccess = (item: string) => {
  toast.success("Deleted", `${item} removed successfully`);
};

export const showUpdateSuccess = (item: string) => {
  toast.success("Updated", `${item} updated successfully`);
};

export const showLoginSuccess = () => {
  toast.success("Welcome back!", "Successfully logged in");
};

export const showLogoutSuccess = () => {
  toast.info("See you soon!", "Successfully logged out");
};

export const showBookingSuccess = () => {
  toast.success("Booked!", "Your booking is confirmed");
};

export const showPaymentSuccess = () => {
  toast.success("Payment complete!", "Transaction successful");
};

export const showNetworkError = () => {
  toast.error("Connection issue", "Check your internet and try again");
};
