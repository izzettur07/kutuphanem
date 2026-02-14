"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="text-center max-w-sm">
        <p className="text-2xl font-semibold text-accent-red mb-2">Hata</p>
        <p className="text-sm text-ink-muted mb-4">
          {error.message || "Beklenmeyen bir hata oluştu."}
        </p>
        <Button variant="secondary" onClick={reset}>
          Tekrar Dene
        </Button>
      </Card>
    </div>
  );
}
