import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-paper-dark px-4">
      <Card className="text-center max-w-sm">
        <p className="text-6xl font-semibold text-ink dark:text-paper mb-2">404</p>
        <p className="text-sm text-ink-muted mb-6">
          Aradığınız sayfa bulunamadı.
        </p>
        <Link href="/dashboard">
          <Button variant="secondary">Ana Sayfaya Dön</Button>
        </Link>
      </Card>
    </div>
  );
}
