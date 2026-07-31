"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { BackgroundDecor } from "@/components/layout/background-decor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth-service";

export default function SignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      // const response = await AuthService.signup({
      //   fullName,
      //   email,
      //   username,
      //   password,
      // });

      // if (!response.success) {
      //   toast.error(response.message ?? "Signup failed");
      //   return;
      // }

      // await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      // toast.success("Account created", {
      //   description: "Welcome to your contributor workspace.",
      // });
      toast(
        "Signup is currently under development. Please contact admins if you want to access the platform"
      );
      // router.push("/user/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundDecor />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-24 sm:px-12">
        <Card className="w-full max-w-md border shadow-none backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border">
                <UserPlus className="h-6 w-6" />
              </div>
            </div>

            <CardTitle>Create your HimVirasat account</CardTitle>
            <CardDescription>
              Contributor signup creates a public contributor workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Input
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-foreground">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
