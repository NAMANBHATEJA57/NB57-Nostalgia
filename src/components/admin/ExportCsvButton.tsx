'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportCsvButtonProps {
  items: any[];
}

export function ExportCsvButton({ items }: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!items || items.length === 0) return;

    // Define CSV headers
    const headers = [
      "SKU",
      "Name",
      "Category",
      "Series",
      "Condition",
      "Availability",
      "Asking Price",
      "Fair Value Max",
      "Sealed",
      "Featured",
      "Created At"
    ];

    // Map items to CSV rows
    const rows = items.map(item => [
      item.sku || '',
      `"${(item.name || '').replace(/"/g, '""')}"`, // escape quotes
      `"${(item.category?.name || '').replace(/"/g, '""')}"`,
      `"${(item.series || '').replace(/"/g, '""')}"`,
      item.condition || '',
      item.availability || '',
      item.askingPrice || '',
      item.fairValueMax || '',
      item.sealed ? 'Yes' : 'No',
      item.featured ? 'Yes' : 'No',
      item.createdAt ? new Date(item.createdAt).toISOString() : ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
