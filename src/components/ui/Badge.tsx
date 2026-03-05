type Variant = "default" | "green" | "red" | "blue" | "amber" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default:
    "border-border text-ink",
  green:
    "border-accent-green text-accent-green",
  red:
    "border-accent-red text-accent-red",
  blue:
    "border-accent-blue text-accent-blue",
  amber:
    "border-accent-amber text-accent-amber",
  purple:
    "border-accent-purple text-accent-purple",
};

function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-semibold uppercase tracking-[0.05em] font-mono
        border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };
