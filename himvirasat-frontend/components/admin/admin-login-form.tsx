"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthService } from "@/lib/services/auth-service";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(username, password);

      if (!response.success) {
        toast.error(response.message ?? "Authentication failed");
        return;
      }

      // Immediately refetch the user query so components react to the active session
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      const roleTitles: Record<string, string> = {
        super_admin: "Super Admin",
        language_head: "Language Head",
        language_expert: "Language Expert",
        contributor: "Contributor",
      };

      const userRole = response.user?.role;
      if (userRole && roleTitles[userRole]) {
        toast.success(`Logged in as ${roleTitles[userRole]}`, {
          duration: 5000,
        });
      } else {
        toast.success("Successfully logged in", { duration: 5000 });
      }

      router.push(response.user?.role === "contributor" ? "/user" : "/admin");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border shadow-none backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border">
            <LogIn className="h-6 w-6" />
          </div>
        </div>

        <CardTitle>Sign in to HimVirasat</CardTitle>

        <CardDescription>
          One account for contributors, experts, language heads, and admins.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New to HimVirasat?{" "}
            <Link href="/signup" className="font-medium text-foreground">
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
