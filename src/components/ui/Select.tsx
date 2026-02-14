import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold uppercase tracking-[0.05em] text-ink dark:text-paper"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 text-sm font-mono appearance-none
            bg-paper text-ink border-2 border-ink
            focus:outline-none focus:border-ink focus:shadow-[2px_2px_0_var(--st-border)]
            disabled:opacity-50 disabled:cursor-not-allowed
            dark:bg-paper-dark dark:text-paper dark:border-paper
            dark:focus:border-paper dark:focus:shadow-[2px_2px_0_var(--st-border)]
            ${error ? "border-accent-red dark:border-accent-red focus:border-accent-red dark:focus:border-accent-red" : ""}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-accent-red">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
export type { SelectProps };
