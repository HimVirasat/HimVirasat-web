"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { primaryButtonStyles } from "@/lib/constants";
import { UserService } from "@/lib/services/admin/user-service";
import { toast } from "sonner";

interface CreateExpertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateExpertDialog({
  open,
  onOpenChange,
}: CreateExpertDialogProps) {
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    const username = formData.get("username")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const dialectsInput = formData.get("dialects")?.toString() ?? "";
    const dialects = dialectsInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      const ret = await UserService.createLanguageExpert({
        fullName,
        email,
        username,
        password,
        dialects,
      });
      // console.log(ret);
      if (ret.success) {
        toast.success(`Language Expert ${fullName} created successfully.`, { duration: 5000 });
      }
      onOpenChange(true);

    } catch (error) {
      toast.error(`Unable to create Language Expert ${error}`, { duration: 5000 });
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Create Expert
          </DialogTitle>

          <DialogDescription>
            Create a new language expert and assign supported dialects.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name
            </Label>

            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              name="email"
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Username
            </Label>

            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialects">
              Dialects
            </Label>

            <Input
              id="dialects"
              name="dialects"
              placeholder="Kangri, Mandyali, Kinnauri"
              required
            />

            <p className="text-xs text-muted-foreground">
              Enter dialects separated by commas.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" className={"rounded-b-none" + primaryButtonStyles}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
