import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { invoices: true } } },
  });

  const customerToDelete = customers.find(c => c.name.trim() === 'Aditya kaushik' && c._count.invoices === 0);

  if (customerToDelete) {
    console.log('Deleting customer:', customerToDelete.id, 'with name:', customerToDelete.name);
    await prisma.customer.delete({ where: { id: customerToDelete.id } });
    console.log('Deleted successfully.');
  } else {
    console.log('No 0-order customer found for "Aditya kaushik"');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
