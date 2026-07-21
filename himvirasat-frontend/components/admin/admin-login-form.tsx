"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
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
import { AdminAuthService } from "@/lib/services/admin/admin-auth-service";

export function AdminLoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await AdminAuthService.login(username, password);

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
      };

      const userRole = response.user?.role;
      if (userRole && roleTitles[userRole]) {
        toast.success(`Logged in as ${roleTitles[userRole]}`, { duration: 5000 });
      } else {
        toast.success("Successfully logged in", { duration: 5000 });
      }

      router.push("/admin/dashboard");
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
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <CardTitle>Administrator Portal</CardTitle>

        <CardDescription>
          Sign in with your administrator credentials.
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
        </form>
      </CardContent>
    </Card>
  );
}