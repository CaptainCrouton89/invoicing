"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/utils/supabase/use-user";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuth from "./header-auth";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActiveLink = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="w-full border-b border-b-foreground/10 h-16">
      <div className="mx-auto container h-full flex justify-between items-center text-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg">
            <span className="text-primary">Invoice</span>Light
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className={`hover:text-accent transition-colors ${
                  isActiveLink("/dashboard") ? "text-primary font-medium" : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/invoices"
                className={`hover:text-accent transition-colors ${
                  isActiveLink("/invoices") ? "text-primary font-medium" : ""
                }`}
              >
                Invoices
              </Link>
              <Link
                href="/clients"
                className={`hover:text-accent transition-colors ${
                  isActiveLink("/clients") ? "text-primary font-medium" : ""
                }`}
              >
                Clients
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <HeaderAuth />
        </div>

        {/* Mobile Menu Button and Popover */}
        <div className="flex md:hidden items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-screen max-w-[300px] p-0 mt-2"
            >
              <div className="p-4 space-y-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`block p-2 rounded-md ${
                        isActiveLink("/dashboard")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/invoices"
                      className={`block p-2 rounded-md ${
                        isActiveLink("/invoices")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      Invoices
                    </Link>
                    <Link
                      href="/clients"
                      className={`block p-2 rounded-md ${
                        isActiveLink("/clients")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      Clients
                    </Link>
                    <Link
                      href="/settings"
                      className={`block p-2 rounded-md ${
                        isActiveLink("/settings")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      Settings
                    </Link>
                  </>
                ) : null}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="p-2">
                    <HeaderAuth />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
}
