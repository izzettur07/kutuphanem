import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 text-sm font-mono resize-y min-h-[80px]
            bg-paper text-ink border-2 border-ink
            placeholder:text-ink-muted
            focus:outline-none focus:border-ink focus:shadow-[2px_2px_0_var(--st-border)]
            disabled:opacity-50 disabled:cursor-not-allowed
            dark:bg-paper-dark dark:text-paper dark:border-paper
            dark:placeholder:text-ink-muted
            dark:focus:border-paper dark:focus:shadow-[2px_2px_0_var(--st-border)]
            ${error ? "border-accent-red dark:border-accent-red focus:border-accent-red dark:focus:border-accent-red" : ""}
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

Textarea.displayName = "Textarea";
export { Textarea };
export type { TextareaProps };
