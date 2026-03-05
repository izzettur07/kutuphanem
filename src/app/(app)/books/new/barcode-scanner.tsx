"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type ScanStatus =
  | "initializing"
  | "scanning"
  | "detected"
  | "error"
  | "permission-denied";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const [status, setStatus] = useState<ScanStatus>("initializing");
  const [error, setError] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [frameCount, setFrameCount] = useState(0);

  const scannerInstanceRef = useRef<import("html5-qrcode").Html5Qrcode | null>(
    null
  );
  const detectedRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerInstanceRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // ignore stop errors
      }
      try {
        scanner.clear();
      } catch {
        // ignore clear errors
      }
      scannerInstanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frameInterval: ReturnType<typeof setInterval> | null = null;
    // Generate a unique ID for this effect run
    const scannerId = `barcode-reader-${Date.now()}`;

    async function initScanner() {
      // Stop any leftover scanner from a previous effect run (strict mode)
      await stopScanner();

      if (cancelled) return;

      // Assign the unique ID to the container div
      const container = containerRef.current;
      if (!container) {
        if (!cancelled) {
          setStatus("error");
          setError("Tarayıcı bileşeni bulunamadı.");
        }
        return;
      }

      // Clear any leftover content in the container
      container.innerHTML = "";
      container.id = scannerId;

      // Wait a bit for DOM to be fully ready
      await new Promise((r) => setTimeout(r, 300));
      if (cancelled) return;

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode(scannerId);
        scannerInstanceRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 120 },
            aspectRatio: 1.5,
          },
          (decodedText) => {
            if (detectedRef.current || cancelled) return;
            // Clean ISBN: remove dashes and spaces
            const cleaned = decodedText.replace(/[-\s]/g, "");
            // Accept any numeric barcode (ISBN-10, ISBN-13, or EAN)
            if (/^\d{10,13}$/.test(cleaned)) {
              detectedRef.current = true;
              setScannedCode(cleaned);
              setStatus("detected");

              // Stop scanner and notify parent after brief delay
              setTimeout(async () => {
                await stopScanner();
                onDetectedRef.current(cleaned);
              }, 600);
            }
          },
          () => {
            // No code in this frame — bump counter for visual feedback
            if (!cancelled && !detectedRef.current) {
              setFrameCount((c) => c + 1);
            }
          }
        );

        if (!cancelled) {
          setStatus("scanning");
          // Periodic frame counter pulse
          frameInterval = setInterval(() => {
            if (!detectedRef.current) {
              setFrameCount((c) => c + 1);
            }
          }, 2000);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Scanner error:", err);
        const errMsg = String(err);
        if (
          errMsg.includes("NotAllowedError") ||
          errMsg.includes("Permission")
        ) {
          setStatus("permission-denied");
          setError(
            "Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini verin."
          );
        } else if (errMsg.includes("NotFoundError")) {
          setStatus("error");
          setError(
            "Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun."
          );
        } else {
          setStatus("error");
          setError(
            "Kamera erişimi sağlanamadı. Lütfen kamera izni verin ve sayfayı yenileyin."
          );
        }
      }
    }

    initScanner();

    return () => {
      cancelled = true;
      if (frameInterval) clearInterval(frameInterval);
      // Fire-and-forget cleanup
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="border-2 border-border p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-ink">
          Barkod Okuyucu
        </p>
        <button
          onClick={async () => {
            await stopScanner();
            onClose();
          }}
          className="text-ink-muted hover:text-ink transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Status banner */}
      <div className="flex items-center justify-center gap-2 py-2 rounded text-xs">
        {status === "initializing" && (
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Loader2 size={14} className="animate-spin" />
            Kamera başlatılıyor...
          </span>
        )}
        {status === "scanning" && (
          <span className="flex items-center gap-1.5 text-accent-blue">
            <Camera size={14} className="animate-pulse" />
            Barkod aranıyor...
            <span className="text-[10px] text-ink-muted tabular-nums">
              ({frameCount} kare tarandı)
            </span>
          </span>
        )}
        {status === "detected" && (
          <span className="flex items-center gap-1.5 text-accent-green font-medium">
            <CheckCircle2 size={14} />
            Barkod okundu:{" "}
            <span className="font-semibold">{scannedCode}</span>
          </span>
        )}
        {(status === "error" || status === "permission-denied") && (
          <span className="flex items-center gap-1.5 text-accent-red">
            <AlertCircle size={14} />
            {error}
          </span>
        )}
      </div>

      {/* Hint text */}
      {status === "scanning" && (
        <p className="text-[10px] text-ink-muted text-center">
          Kitabın arka kapağındaki barkodu kameraya gösterin
        </p>
      )}

      {/* Scanner viewport */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded"
        style={{ minHeight: 220 }}
      />
    </div>
  );
}
