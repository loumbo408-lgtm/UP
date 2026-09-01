import { redirect } from "next/navigation";

export default function DashboardAdminLoginRedirect() {
  redirect("/admin");
}
