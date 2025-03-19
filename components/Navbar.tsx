"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HeaderAuth from "./header-auth";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActiveLink = (path: string) => {
    return pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    // Close mobile menu when navigating to a new page
    setIsMobileMenuOpen(false);

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [pathname, isMobileMenuOpen]);

  return (
    <nav className="w-full border-b border-b-foreground/10 h-16">
      <div className="mx-auto container h-full flex justify-between items-center text-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg">
            <span className="text-primary">Invoice</span>Light
          </Link>

          {/* Desktop Navigation */}
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
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/settings"
            className={`hover:text-blue-500 transition-colors ${
              isActiveLink("/settings") ? "text-blue-500 font-medium" : ""
            }`}
          >
            Settings
          </Link>
          <HeaderAuth />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            onClick={toggleMobileMenu}
            variant="ghost"
            size="sm"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute top-16 inset-x-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div className="p-4 space-y-4">
            <Link
              href="/dashboard"
              className={`block p-2 rounded-md ${
                isActiveLink("/dashboard")
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/invoices"
              className={`block p-2 rounded-md ${
                isActiveLink("/invoices")
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Invoices
            </Link>
            <Link
              href="/clients"
              className={`block p-2 rounded-md ${
                isActiveLink("/clients")
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Clients
            </Link>
            <Link
              href="/settings"
              className={`block p-2 rounded-md ${
                isActiveLink("/settings")
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="p-2">
                <HeaderAuth />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
