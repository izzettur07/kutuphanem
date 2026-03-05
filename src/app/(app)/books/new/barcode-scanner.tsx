"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scannerId = "barcode-reader";
    let scanner: Html5Qrcode | null = null;

    async function startScanner() {
      try {
        scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 120 },
          },
          (decodedText) => {
            // Clean ISBN: remove dashes and spaces
            const cleaned = decodedText.replace(/[-\s]/g, "");
            // Validate it looks like an ISBN (10 or 13 digits)
            if (/^\d{10,13}$/.test(cleaned)) {
              onDetected(cleaned);
              stopScanner();
            }
          },
          () => {
            // Ignore scan failures (no code found in frame)
          }
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setError("Kamera erişimi sağlanamadı. Lütfen kamera izni verin.");
      }
    }

    async function stopScanner() {
      if (scanner && scanner.isScanning) {
        try {
          await scanner.stop();
        } catch {
          // ignore
        }
      }
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onDetected]);

  return (
    <div className="border-2 border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-ink">
          Barkod Okuyucu
        </p>
        <button
          onClick={onClose}
          className="text-ink-muted hover:text-ink transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {error ? (
        <div className="text-xs text-accent-red py-4 text-center">{error}</div>
      ) : (
        <p className="text-[10px] text-ink-muted text-center">
          Kitabın barkodunu kameraya gösterin
        </p>
      )}

      <div
        ref={containerRef}
        id="barcode-reader"
        className="w-full overflow-hidden"
        style={{ minHeight: 200 }}
      />
    </div>
  );
}
