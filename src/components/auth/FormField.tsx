import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  id,
  label,
  error,
  hint,
  className,
  children,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-medium tracking-wide text-mist/80"
      >
        {label}
      </label>
      {children ?? (
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn("input-shell", className)}
          {...inputProps}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] text-bad" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-mute-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
