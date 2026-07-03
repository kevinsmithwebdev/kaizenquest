"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Goal } from "@/lib/goals/goal.types";

type DeleteGoalDialogProps = {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteGoalDialog({
  goal,
  open,
  onOpenChange,
}: Readonly<DeleteGoalDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-bold">Delete Goal</DialogTitle>
          <DialogDescription>
            {goal
              ? `Delete confirmation for "${goal.name}" will go here.`
              : "Delete confirmation will go here."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
