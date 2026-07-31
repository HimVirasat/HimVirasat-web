import { redirect } from "next/navigation";

export default function LegacyDashboardSubmissionsPage() {
  redirect("/user/dashboard/submissions");
}
