"use client";

import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { useUser } from "@/utils/supabase/use-user";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggleWrapper } from "./theme-toggle-wrapper";
import { Button } from "./ui/button";

export default function AuthButton() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  const isActiveLink = (path: string) => {
    return pathname.startsWith(path);
  };

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <ThemeToggleWrapper />
            <Button
              asChild
              size="sm"
              variant={"outline"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={"default"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <ThemeToggleWrapper />
        <Button size="sm" variant="outline" disabled>
          Loading...
        </Button>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      {/* <ThemeToggleWrapper /> */}
      <Link
        href="/settings"
        className={`hover:text-blue-500 transition-colors ${
          isActiveLink("/settings") ? "text-blue-500 font-medium" : ""
        }`}
      >
        Settings
      </Link>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="icon" title="Sign out">
          <LogOut className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Sign out</span>
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2 items-center">
      {/* <ThemeToggleWrapper /> */}
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
