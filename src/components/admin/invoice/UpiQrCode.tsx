"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatCurrency } from "@/lib/constants";
import { CheckCircle } from "lucide-react";

interface UpiQrCodeProps {
  amount: number;
  invoiceNumber: string;
  customerName: string;
  isPaid: boolean;
  upiId?: string;
}

export function UpiQrCode({
  amount,
  invoiceNumber,
  customerName,
  isPaid,
  upiId = "nb57nostalgia@upi",
}: UpiQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (isPaid) return;

    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("NB57's Nostalgia")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${invoiceNumber} - ${customerName}`)}`;

    QRCode.toDataURL(upiUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#09090B", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl).catch(console.error);
  }, [amount, invoiceNumber, customerName, isPaid, upiId]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        UPI Payment
      </p>

      {isPaid ? (
        <div className="py-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="text-lg font-bold">PAID</span>
          </div>
        </div>
      ) : (
        <>
          {qrDataUrl && (
            <div className="inline-block rounded-lg border border-border p-2 bg-white mb-3">
              <img src={qrDataUrl} alt="UPI QR Code" className="w-44 h-44" />
            </div>
          )}
          <p className="text-lg font-bold tabular-nums">{formatCurrency(amount)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{invoiceNumber}</p>
          <p className="text-[10px] text-muted-foreground">Scan with any UPI app</p>
        </>
      )}
    </div>
  );
}
