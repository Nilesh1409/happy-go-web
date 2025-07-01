// components/ui/separator.jsx
"use client";

import { forwardRef } from "react";

const Separator = forwardRef(
  ({ orientation = "horizontal", className = "", ...props }, ref) => {
    const baseClasses = "bg-gray-200";
    const orientationClasses =
      orientation === "vertical" ? "h-full w-px" : "w-full h-px";

    return (
      <div
        ref={ref}
        role="separator"
        className={`${baseClasses} ${orientationClasses} ${className}`}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

export { Separator };
