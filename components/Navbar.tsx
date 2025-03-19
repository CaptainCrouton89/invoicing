import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuth from "./header-auth";

export default function Navbar() {
  const pathname = usePathname();

  const isActiveLink = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="w-full border-b border-b-foreground/10 h-16">
      <div className="app-container h-full flex justify-between items-center text-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg">
            Invoicing App
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={`hover:text-blue-500 transition-colors ${
                isActiveLink("/dashboard") ? "text-blue-500 font-medium" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/invoices"
              className={`hover:text-blue-500 transition-colors ${
                isActiveLink("/invoices") ? "text-blue-500 font-medium" : ""
              }`}
            >
              Invoices
            </Link>
            <Link
              href="/clients"
              className={`hover:text-blue-500 transition-colors ${
                isActiveLink("/clients") ? "text-blue-500 font-medium" : ""
              }`}
            >
              Clients
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
