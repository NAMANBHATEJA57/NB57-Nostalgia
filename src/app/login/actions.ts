"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email: username },
  });

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return { error: "Invalid credentials" };
  }

  // Create session
  await createSession(user.id, user.role);

  return { success: true };
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
