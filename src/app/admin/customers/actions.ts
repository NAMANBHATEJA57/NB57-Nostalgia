"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const country = formData.get("country") as string;
  const pin = formData.get("pin") as string;
  const gstNumber = formData.get("gstNumber") as string;
  const notes = formData.get("notes") as string;

  if (!name) {
    throw new Error("Name is required");
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || "India",
      pin: pin || null,
      gstNumber: gstNumber || null,
      notes: notes || null,
    },
  });

  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${customer.id}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const country = formData.get("country") as string;
  const pin = formData.get("pin") as string;
  const gstNumber = formData.get("gstNumber") as string;
  const notes = formData.get("notes") as string;

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || "India",
      pin: pin || null,
      gstNumber: gstNumber || null,
      notes: notes || null,
    },
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  redirect(`/admin/customers/${id}`);
}
