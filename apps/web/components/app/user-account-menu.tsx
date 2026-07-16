"use client";

import { signOut } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/lib/auth";

import { getInitial } from "./utils";

type UserAccountMenuProps = {
  user: AuthUser;
};

export function UserAccountMenu({ user }: Readonly<UserAccountMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group focus-visible:ring-ring/50 cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-3"
        aria-label="Account menu"
      >
        <Avatar
          size="lg"
          className="origin-center group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-md motion-safe:transition-transform motion-safe:duration-150"
        >
          <AvatarFallback className="bg-action-subtle text-action text-[1.575rem] leading-none font-bold">
            {getInitial(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="space-y-3 px-2 py-2">
          <div>
            <p className="text-muted-foreground text-xs">Name</p>
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="text-sm">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem
            render={<button type="submit" className="w-full" />}
          >
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
