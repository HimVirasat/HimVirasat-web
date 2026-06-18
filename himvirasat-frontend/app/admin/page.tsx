import { BackgroundDecor } from "@/components/layout/background-decor";

import { AdminLoginForm } from "../../components/admin/admin-login-form";

export default function AdminPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundDecor />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-24 sm:px-12">
        <AdminLoginForm />
      </main>
    </div>
  );
}
