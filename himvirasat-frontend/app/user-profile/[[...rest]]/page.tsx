"use client";

import { useRouter } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";

import { BackgroundDecor } from "@/components/layout/background-decor";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ADMIN_ROLES } from "@himvirasat/shared";

export default function UserProfilePage() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const admin = currentUser ? ADMIN_ROLES.includes(currentUser.role) : false;

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(admin ? "/admin/settings" : "/user/settings");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundDecor />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-24 sm:px-12">
        <div className="mb-4 flex w-full max-w-6xl px-1 sm:px-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
            <ArrowLeft className="size-4" />
            Back to Settings
          </Button>
        </div>
        <UserProfile
          routing="path"
          path="/user-profile"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-6xl px-0",
              cardBox:
                "w-full rounded-lg border bg-background/95 shadow-none backdrop-blur-sm",
              navbarButton: "text-foreground",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90",
            },
          }}
        />
      </main>
    </div>
  );
}
