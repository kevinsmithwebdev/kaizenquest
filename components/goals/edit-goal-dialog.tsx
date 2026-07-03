"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Goal } from "@/lib/goals/goal.types";

type EditGoalDialogProps = {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
}: Readonly<EditGoalDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-bold">Edit Goal</DialogTitle>
          <DialogDescription>
            {goal
              ? `Edit form for "${goal.name}" will go here.`
              : "Edit form will go here."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
