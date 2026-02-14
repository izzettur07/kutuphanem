interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        bg-paper border-2 border-ink p-4
        dark:bg-paper-dark dark:border-paper
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`
        pb-3 mb-3 border-b-2 border-ink
        dark:border-paper
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3
      className={`
        text-sm font-semibold uppercase tracking-[0.05em] text-ink
        dark:text-paper
        ${className}
      `}
    >
      {children}
    </h3>
  );
}

export { Card, CardHeader, CardTitle };
export type { CardProps, CardHeaderProps, CardTitleProps };
