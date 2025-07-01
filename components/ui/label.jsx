// components/ui/label.jsx
"use client";

import { forwardRef } from "react";

const Label = forwardRef(
  (
    { htmlFor, size = "default", className = "", children, icon, ...props },
    ref
  ) => {
    const sizeClasses = {
      default: "text-sm",
      large: "text-base font-medium",
    };

    const baseClasses = "text-gray-700 block mb-1 cursor-pointer select-none";
    const iconClasses = icon ? "flex items-center gap-2" : "";

    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`${baseClasses} ${sizeClasses[size]} ${iconClasses} ${className}`}
        {...props}
      >
        {icon && <span>{icon}</span>}
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
