import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/CategoryForm";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">
            Manage your collection taxonomy.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Thumbnail</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-center">Order</th>
              <th className="px-4 py-3 font-medium text-center">Featured</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No categories found. Create your first category to get started.
                </td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    {category.thumbnailImage ? (
                      <div className="w-12 h-12 relative rounded-md overflow-hidden bg-slate-100 border">
                        <Image src={category.thumbnailImage} alt={category.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-slate-100 border flex items-center justify-center text-slate-400 text-xs">No Img</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{category.description || "-"}</td>
                  <td className="px-4 py-3 text-center font-mono">{category.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    {category.featured ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Featured</Badge> : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
