import { redirect } from "next/navigation";

export default function AdminRoot() {
  redirect("/admin/dashboard");
}

// This tells Next.js not to cache this route
export const dynamic = "force-dynamic";