'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { InvoicePDF } from './InvoicePDF';
import { PackingSlipPDF } from './PackingSlipPDF';
import { PackingSlipHTML } from './PackingSlipHTML';
import { ShippingLabelPDF } from './ShippingLabelPDF';
import { addTimelineEvent } from '@/app/admin/invoices/actions';
import { toast } from 'sonner';
import { FileText, Download, Printer, Box, Mail, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

interface PDFControlsProps {
  invoice: any;
  logoUrl?: string;
  qrCodeUrl?: string;
}

export const PDFControls: React.FC<PDFControlsProps> = ({ invoice, logoUrl, qrCodeUrl }) => {
  const [isClient, setIsClient] = useState(false);
  const [generatingPng, setGeneratingPng] = useState(false);
  const packingSlipRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadLog = async (type: string) => {
    const res = await addTimelineEvent(invoice.id, 'Downloaded', `${type} Downloaded`);
    if (res.success) {
      toast.success(`${type} download logged.`);
    }
  };

  const handleDownloadPackingSlipPNG = async () => {
    if (!packingSlipRef.current) return;
    setGeneratingPng(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(packingSlipRef.current, { quality: 1, pixelRatio: 2 });
      
      const link = document.createElement('a');
      link.download = `PackingSlip_${invoice.invoiceNumber}.png`;
      link.href = dataUrl;
      link.click();
      
      await handleDownloadLog('Packing Slip PNG');
    } catch (err) {
      console.error('Failed to generate PNG', err);
      toast.error('Failed to generate PNG');
    } finally {
      setGeneratingPng(false);
    }
  };

  if (!isClient) return null; // avoid hydration mismatch for @react-pdf/renderer

  const invoiceDoc = <InvoicePDF invoice={invoice} logoUrl={logoUrl} qrCodeUrl={qrCodeUrl} />;
  const packingDoc = <PackingSlipPDF invoice={invoice} logoUrl={logoUrl} />;
  const labelDoc = <ShippingLabelPDF invoice={invoice} logoUrl={logoUrl} />;

  return (
    <div className="flex flex-wrap gap-4 items-center">
      
      {/* INVOICE CONTROLS */}
      <Dialog>
        <DialogTrigger 
          render={
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Preview Invoice
            </Button>
          }
        />
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogTitle>Invoice Preview</DialogTitle>
          <PDFViewer width="100%" height="100%">
            {invoiceDoc}
          </PDFViewer>
        </DialogContent>
      </Dialog>

      <PDFDownloadLink document={invoiceDoc} fileName={`${invoice.invoiceNumber}.pdf`}>
        {({ loading }) => (
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            disabled={loading}
            onClick={() => handleDownloadLog('Invoice')}
          >
            <Download className="w-4 h-4" /> {loading ? 'Generating...' : 'Download Invoice'}
          </Button>
        )}
      </PDFDownloadLink>

      {/* PACKING SLIP CONTROLS */}
      <Dialog>
        <DialogTrigger 
          render={
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Box className="w-4 h-4" /> Preview Packing Slip
            </Button>
          }
        />
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogTitle>Packing Slip Preview</DialogTitle>
          <PDFViewer width="100%" height="100%">
            {packingDoc}
          </PDFViewer>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled={generatingPng}
        onClick={handleDownloadPackingSlipPNG}
      >
        <ImageIcon className="w-4 h-4" /> {generatingPng ? 'Generating...' : 'Download Packing Slip (PNG)'}
      </Button>

      {/* SHIPPING LABEL CONTROLS */}
      <PDFDownloadLink document={labelDoc} fileName={`Label_${invoice.invoiceNumber}.pdf`}>
        {({ loading }) => (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={loading}
            onClick={() => handleDownloadLog('Shipping Label')}
          >
            <Mail className="w-4 h-4" /> {loading ? 'Generating...' : 'Download Label'}
          </Button>
        )}
      </PDFDownloadLink>
      
      {/* Hidden element for PNG generation */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <PackingSlipHTML ref={packingSlipRef} invoice={invoice} logoUrl={logoUrl} />
      </div>
    </div>
  );
};
