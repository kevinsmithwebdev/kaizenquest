"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { Goal } from "@/lib/goals/goal.types";
import { Card, CardFooter } from "@/components/ui/card";
import { ScrollFade } from "@/components/ui/scroll-fade";

import { AddEventDialog } from "./add-event-dialog";
import { GoalListItem } from "./goal-list-item";

type GoalsListProps = {
  goals: Goal[];
};

export function GoalsList({ goals }: GoalsListProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  return (
    <>
      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        <ScrollFade className="min-h-0 flex-1">
          {goals.length === 0 ? (
            <p className="text-muted-foreground px-(--card-spacing) py-8 text-center text-sm">
              No goals yet. Add one to get started.
            </p>
          ) : (
            <ul className="grid grid-cols-[2.5rem_minmax(0,1fr)_0_8.5rem_1.75rem] gap-x-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_8.5rem_1.75rem]">
              {goals.map((goal, index) => (
                <GoalListItem
                  key={goal.id}
                  goal={goal}
                  colorIndex={index}
                  onSelect={() => setSelectedGoal(goal)}
                />
              ))}
            </ul>
          )}
        </ScrollFade>

        <CardFooter className="border-border bg-card shrink-0 border-t">
          <button
            type="button"
            className="text-action hover:text-action/80 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            <Plus className="size-4" />
            Add another goal
          </button>
        </CardFooter>
      </Card>

      <AddEventDialog
        goal={selectedGoal}
        open={selectedGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGoal(null);
          }
        }}
      />
    </>
  );
}
