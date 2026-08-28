import { SignIn } from "@clerk/nextjs";

import { BackgroundDecor } from "@/components/layout/background-decor";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundDecor />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-24 sm:px-12">
        <SignIn
          signUpUrl="/signup"
          transferable={false}
          fallbackRedirectUrl="/post-login"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-md",
              cardBox:
                "w-full rounded-lg border bg-background/95 shadow-none backdrop-blur-sm",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90",
              footerActionLink: "text-foreground",
            },
          }}
        />
      </main>
    </div>
  );
}
