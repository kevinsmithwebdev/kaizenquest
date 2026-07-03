"use client";

import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Goal } from "@/lib/goals/goal.types";

type GoalListItemMenuProps = {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
};

export function GoalListItemMenu({
  goal,
  onEdit,
  onDelete,
}: Readonly<GoalListItemMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground shrink-0"
          />
        }
        aria-label={`Actions for ${goal.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => onEdit()} className="cursor-pointer">
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete()}
          className="cursor-pointer"
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
