import { Button } from "@/components/ui/button";
import { primaryButtonStyles } from "@/lib/constants";

import { Plus } from "lucide-react";

export function ExpertsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Language Experts</h1>

        <p className="text-muted-foreground">
          Manage language experts and dialect assignments.
        </p>
      </div>

      <Button className={`"h-4 w-4"` + primaryButtonStyles}>
        <Plus />
        Create Expert
      </Button>
    </div>
  );
}
