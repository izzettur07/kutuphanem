import { Card } from "@/components/ui/Card";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-paper-dark dark:bg-ink-muted ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink dark:border-paper">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-16" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
        <Card>
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </Card>
      </div>
    </div>
  );
}
