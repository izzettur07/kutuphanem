"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const detectedRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

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
            aspectRatio: 1.5,
          },
          (decodedText) => {
            if (detectedRef.current) return;
            // Clean ISBN: remove dashes and spaces
            const cleaned = decodedText.replace(/[-\s]/g, "");
            // Accept any numeric barcode (ISBN-10 or ISBN-13 or EAN)
            if (/^\d{10,13}$/.test(cleaned)) {
              detectedRef.current = true;
              setScannedCode(cleaned);
              // Stop scanner and notify parent
              stopScanner().then(() => {
                onDetectedRef.current(cleaned);
              });
            }
          },
          () => {
            // Ignore scan failures (no code found in frame)
          }
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setError("Kamera erişimi sağlanamadı. Lütfen kamera izni verin ve sayfayı yenileyin.");
      }
    }

    async function stopScanner() {
      if (scanner && scanner.isScanning) {
        try {
          await scanner.stop();
          await scanner.clear();
        } catch {
          // ignore
        }
      }
    }

    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      ) : scannedCode ? (
        <p className="text-xs text-accent-green text-center py-2">
          Barkod okundu: <span className="font-semibold">{scannedCode}</span>
        </p>
      ) : (
        <p className="text-[10px] text-ink-muted text-center">
          Kitabın barkodunu kameraya gösterin
        </p>
      )}

      <div
        id="barcode-reader"
        className="w-full overflow-hidden"
        style={{ minHeight: 200 }}
      />
    </div>
  );
}
