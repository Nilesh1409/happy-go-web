import type * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#F47B20]/50 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#F47B20] text-white shadow-md hover:bg-[#E06A0F] hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg",
        outline:
          "border-2 border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover:border-[#F47B20] hover:text-[#F47B20] hover:shadow-md",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 hover:shadow-md",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-[#F47B20] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-md gap-1.5 px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base font-semibold",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
