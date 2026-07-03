"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Goal } from "@/lib/goals/goal.types";

type DeleteGoalDialogProps = {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type DeleteGoalFormProps = {
  goal: Goal;
  onClose: () => void;
};

function DeleteGoalForm({ goal, onClose }: Readonly<DeleteGoalFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteGoal(goal.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      onClose();
      router.refresh();
    });
  };

  return (
    <>
      <DialogHeader className="text-center">
        <DialogTitle className="font-bold">Delete Goal</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete{" "}
          <span className="text-foreground font-semibold">{goal.name}</span>?
          Once a goal is deleted, it and all its data will be unrecoverable.
        </DialogDescription>
      </DialogHeader>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          Delete Goal
        </Button>
      </DialogFooter>
    </>
  );
}

export function DeleteGoalDialog({
  goal,
  open,
  onOpenChange,
}: Readonly<DeleteGoalDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        {goal ? (
          <DeleteGoalForm
            key={goal.id}
            goal={goal}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
