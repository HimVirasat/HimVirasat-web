import { Construction, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserDashboardPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-dashed text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
            <Construction className="size-7 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Early Access — Under Construction</CardTitle>
          <CardDescription className="mx-auto max-w-lg leading-relaxed">
            Thank you for signing up for early access to HimVirasat! The
            contributor workspace is still being built. We will notify you as
            soon as contribution tools go live.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="size-4" />
            <span>Watch your inbox for launch updates.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
