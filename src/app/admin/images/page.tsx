import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function ImagesPage() {
  const images = await prisma.image.findMany({
    include: {
      item: {
        select: {
          id: true,
          name: true,
          sku: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Image Library</h2>
        <p className="text-muted-foreground mt-1">
          Manage all images uploaded to your inventory.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {images.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-white border rounded-xl border-dashed">
            No images found in your library.
          </div>
        ) : (
          images.map(image => (
            <div key={image.id} className="group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-square bg-slate-100">
                <Image 
                  src={image.url} 
                  alt={image.item.name} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105" 
                />
              </div>
              <div className="p-4 border-t bg-slate-50/50">
                <p className="text-sm font-medium truncate" title={image.item.name}>{image.item.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-sm">
                    {image.type}
                  </span>
                  <Link href={`/admin/items/${image.item.id}`} className="text-xs text-blue-600 hover:underline">
                    View Item
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
