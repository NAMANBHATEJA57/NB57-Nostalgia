'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getAllItemsForExport } from "@/app/admin/items/actions";
import { toast } from "sonner";

interface ExportCsvButtonProps {
  items?: any[];
}

export function ExportCsvButton({ items: initialItems }: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllItemsForExport();
      
      if (!result.success || !result.items) {
        toast.error(result.error || "Failed to fetch items for export");
        return;
      }

      const itemsToExport = result.items;

      if (itemsToExport.length === 0) {
        toast.info("No items to export");
        return;
      }

      // Define CSV headers covering all item fields
      const headers = [
        "ID",
        "SKU",
        "Slug",
        "Name",
        "Description",
        "Specifications",
        "Private Notes",
        "Category",
        "Subcategory",
        "Series",
        "Character",
        "Manufacturer",
        "Release Year",
        "Condition",
        "Availability",
        "Asking Price",
        "Fair Value Min",
        "Fair Value Max",
        "Highest Seen Price",
        "Lowest Seen Price",
        "Price Confidence",
        "Price Source",
        "Purchase Price",
        "Purchase Date",
        "Sold Price",
        "Sold Date",
        "Sold To",
        "Notes",
        "Featured",
        "Show On Homepage",
        "Trending",
        "Recently Added",
        "Hide From Public",
        "Sealed",
        "Rare",
        "Limited",
        "Promo",
        "Duplicate",
        "Hidden",
        "Tags",
        "Quantity",
        "Cover Image",
        "Extra Images",
        "Meta Title",
        "Meta Description",
        "Open Graph Image",
        "Created At",
        "Updated At"
      ];

      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // If the string contains quotes, commas, or newlines, wrap it in quotes and escape internal quotes
        if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const formatDate = (date: any) => {
        if (!date) return '';
        try {
          return new Date(date).toISOString();
        } catch (e) {
          return date;
        }
      };

      // Map items to CSV rows
      const rows = itemsToExport.map(item => [
        escapeCSV(item.id),
        escapeCSV(item.sku),
        escapeCSV(item.slug),
        escapeCSV(item.name),
        escapeCSV(item.description),
        escapeCSV(item.specifications),
        escapeCSV(item.privateNotes),
        escapeCSV(item.category?.name),
        escapeCSV(item.subcategory),
        escapeCSV(item.series),
        escapeCSV(item.character),
        escapeCSV(item.manufacturer),
        escapeCSV(item.releaseYear),
        escapeCSV(item.condition),
        escapeCSV(item.availability),
        escapeCSV(item.askingPrice),
        escapeCSV(item.fairValueMin),
        escapeCSV(item.fairValueMax),
        escapeCSV(item.highestSeenPrice),
        escapeCSV(item.lowestSeenPrice),
        escapeCSV(item.priceConfidence),
        escapeCSV(item.priceSource),
        escapeCSV(item.purchasePrice),
        formatDate(item.purchaseDate),
        escapeCSV(item.soldPrice),
        formatDate(item.soldDate),
        escapeCSV(item.soldTo),
        escapeCSV(item.notes),
        item.featured ? 'Yes' : 'No',
        item.showOnHomepage ? 'Yes' : 'No',
        item.trending ? 'Yes' : 'No',
        item.recentlyAdded ? 'Yes' : 'No',
        item.hideFromPublic ? 'Yes' : 'No',
        item.sealed ? 'Yes' : 'No',
        item.rare ? 'Yes' : 'No',
        item.limited ? 'Yes' : 'No',
        item.promo ? 'Yes' : 'No',
        item.duplicate ? 'Yes' : 'No',
        item.hidden ? 'Yes' : 'No',
        escapeCSV((item.itemTags || []).map((it: any) => it.tag?.name).filter(Boolean).join(' | ')),
        escapeCSV(item.quantity),
        escapeCSV(item.coverImage),
        escapeCSV((item.images || []).map((img: any) => img.url).join(' | ')),
        escapeCSV(item.metaTitle),
        escapeCSV(item.metaDescription),
        escapeCSV(item.openGraphImage),
        formatDate(item.createdAt),
        formatDate(item.updatedAt)
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
      toast.success("Export successful");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export items");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}

