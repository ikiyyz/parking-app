"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

type DecodedResult = {
  raw: string;
  ticketCode: string | null;
};

type PayResult = {
  hours: number;
  total_price: number;
  entry_time: string;
};

export default function PayPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<DecodedResult | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const decodeQrFromFile = async (file: File) => {
    setError("");
    setDecoded(null);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    const img = new Image();
    img.src = imageUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Gagal membaca gambar"));
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas tidak tersedia");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qr = jsQR(imageData.data, imageData.width, imageData.height);

    if (!qr) {
      throw new Error(
        "QR tidak terdeteksi. Coba gambar lain yang lebih jelas.",
      );
    }

    const raw = qr.data; // bisa JSON atau string biasa
    let ticketCode: string | null = null;

    // mendukung 2 format:
    // 1) raw string ticket_code
    // 2) JSON: { ticket_code: "..." }
    try {
      const parsed = JSON.parse(raw);
      ticketCode = parsed?.ticket_code ?? null;
    } catch {
      ticketCode = raw;
    }

    setDecoded({ raw, ticketCode });
  };

  const resetPay = () => {
    setPreview(null);
    setDecoded(null);
    setPayResult(null);
    setError("");
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await decodeQrFromFile(file);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal decode QR");
    }
  };

  const [payResult, setPayResult] = useState<PayResult | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const handleHitungTarif = async () => {
    if (!decoded?.ticketCode) {
      setError("Ticket code belum terbaca dari QR.");
      return;
    }
    setPayLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_code: decoded.ticketCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menghitung tarif");
      }
      setPayResult(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Pembayaran Parkir</h1>
        <p className="text-sm text-gray-600 mb-5">
          Upload gambar QR dari tiket untuk membaca ticket code.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block w-full text-sm mb-4"
        />

        {preview && (
          <img
            src={preview}
            alt="QR preview"
            className="w-56 h-56 object-contain border rounded"
          />
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {decoded && (
          <>
            <div className="mt-4 p-3 border rounded bg-gray-50 text-sm">
              <p>
                <b>QR Raw:</b> {decoded.raw}
              </p>
              <p>
                <b>Ticket Code:</b> {decoded.ticketCode ?? "-"}
              </p>
            </div>
            <button
              onClick={handleHitungTarif}
              disabled={payLoading}
              className="mt-4 w-full py-2 rounded bg-green-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {payLoading ? "Menghitung..." : "Hitung Durasi & Harga"}
            </button>
            {payResult && (
              <div className="mt-4 p-3 border rounded bg-emerald-50 text-sm">
                <p>
                  <b>Entry Time:</b>{" "}
                  {new Date(payResult.entry_time).toLocaleString("id-ID")}
                </p>
                <p>
                  <b>Durasi:</b> {payResult.hours} jam
                </p>
                <p>
                  <b>Total Harga:</b> Rp{" "}
                  {payResult.total_price.toLocaleString("id-ID")}
                </p>
                <p className="mt-3 font-semibold text-emerald-700">
                  Pembayaran Berhasil
                </p>
                <p className="text-emerald-700">Pintu Terbuka 🚗</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => router.push("/")}
                    className="flex-1 py-2 rounded bg-blue-600 text-white text-sm font-semibold"
                  >
                    Kembali ke Beranda
                  </button>
                  <button
                    onClick={resetPay}
                    className="flex-1 py-2 rounded border text-sm font-semibold"
                  >
                    Bayar Tiket Lain
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
