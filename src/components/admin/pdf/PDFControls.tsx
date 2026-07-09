'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { InvoicePDF } from './InvoicePDF';
import { PackingSlipPDF } from './PackingSlipPDF';
import { ShippingLabelPDF } from './ShippingLabelPDF';
import { addTimelineEvent } from '@/app/admin/invoices/actions';
import { toast } from 'sonner';
import { FileText, Download, Printer, Box, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

interface PDFControlsProps {
  invoice: any;
  logoUrl?: string;
  qrCodeUrl?: string;
}

export const PDFControls: React.FC<PDFControlsProps> = ({ invoice, logoUrl, qrCodeUrl }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadLog = async (type: string) => {
    const res = await addTimelineEvent(invoice.id, 'Downloaded', `${type} PDF Downloaded`);
    if (res.success) {
      toast.success(`${type} download logged.`);
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
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Preview Invoice
          </Button>
        </DialogTrigger>
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
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Box className="w-4 h-4" /> Preview Packing Slip
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogTitle>Packing Slip Preview</DialogTitle>
          <PDFViewer width="100%" height="100%">
            {packingDoc}
          </PDFViewer>
        </DialogContent>
      </Dialog>

      <PDFDownloadLink document={packingDoc} fileName={`PackingSlip_${invoice.invoiceNumber}.pdf`}>
        {({ loading }) => (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={loading}
            onClick={() => handleDownloadLog('Packing Slip')}
          >
            <Download className="w-4 h-4" /> {loading ? 'Generating...' : 'Download Packing Slip'}
          </Button>
        )}
      </PDFDownloadLink>

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
      
    </div>
  );
};
