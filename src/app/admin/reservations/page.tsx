import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReservationTable } from "@/components/admin/reservation/ReservationTable";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: {
      item: { select: { name: true, sku: true, coverImage: true, askingPrice: true } },
      customer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reservations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track reserved items ({reservations.length} total)
          </p>
        </div>
        <Link href="/admin/reservations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Reserve Item
          </Button>
        </Link>
      </div>

      <ReservationTable reservations={reservations} />
    </div>
  );
}
