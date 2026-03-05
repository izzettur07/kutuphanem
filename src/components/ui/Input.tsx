import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold uppercase tracking-[0.05em] text-ink"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 text-sm font-mono
            bg-paper text-ink border-2 border-border
            placeholder:text-ink-muted
            focus:outline-none focus:border-border focus:shadow-[2px_2px_0_var(--st-border)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-accent-red focus:border-accent-red" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-accent-red">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
