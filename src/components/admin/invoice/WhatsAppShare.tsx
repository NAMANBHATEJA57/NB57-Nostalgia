"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getWhatsAppMessage } from "@/app/admin/invoices/actions";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink } from "lucide-react";

interface WhatsAppShareProps {
  invoiceId: string;
}

export function WhatsAppShare({ invoiceId }: WhatsAppShareProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleShare = () => {
    startTransition(async () => {
      const result = await getWhatsAppMessage(invoiceId);
      if (result.success) {
        setMessage(result.message || null);
        setWhatsappUrl(result.whatsappUrl || null);
        setShowPreview(true);
      } else {
        toast.error(result.error || "Failed to generate message");
      }
    });
  };

  const openWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={handleShare} disabled={isPending}>
        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
        WhatsApp
      </Button>

      {showPreview && message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">WhatsApp Message Preview</h3>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap font-mono">
              {message}
            </div>
            <div className="flex gap-2">
              <Button onClick={openWhatsApp} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open WhatsApp
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
