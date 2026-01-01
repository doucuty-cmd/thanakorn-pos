import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-white border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#06C755] focus:border-[#06C755] block p-3 outline-none transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";