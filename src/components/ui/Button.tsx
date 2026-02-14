import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-ink text-paper border-2 border-ink hover:bg-transparent hover:text-ink dark:bg-paper dark:text-ink dark:border-paper dark:hover:bg-transparent dark:hover:text-paper",
  secondary:
    "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper dark:text-paper dark:border-paper dark:hover:bg-paper dark:hover:text-ink",
  danger:
    "bg-accent-red text-paper border-2 border-accent-red hover:bg-transparent hover:text-accent-red",
  ghost:
    "bg-transparent text-ink border-2 border-ink-muted hover:border-ink dark:text-paper dark:border-ink-muted dark:hover:border-paper",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center font-mono font-semibold
          uppercase tracking-[0.05em] transition-colors duration-150 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
