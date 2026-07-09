"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ItemsTableDeleteDialogProps {
  open: boolean;
  type: 'single' | 'bulk';
  itemId?: string;
  selectedIdsLength: number;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmBulk: () => void;
  onConfirmSingle: (id: string) => void;
}

export function ItemsTableDeleteDialog({
  open,
  type,
  itemId,
  selectedIdsLength,
  isPending,
  onOpenChange,
  onConfirmBulk,
  onConfirmSingle
}: ItemsTableDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {type === 'bulk' 
              ? `This action cannot be undone. This will permanently delete ${selectedIdsLength} items from the database.`
              : `This action cannot be undone. This will permanently delete the item from the database.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              if (type === 'bulk') {
                onConfirmBulk();
              } else if (itemId) {
                onConfirmSingle(itemId);
              }
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
