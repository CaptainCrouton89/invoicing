import Link from "next/link";
import HeaderAuth from "./header-auth";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-b-foreground/10 h-16">
      <div className="app-container h-full flex justify-between items-center text-sm">
        <div className="flex items-center">
          <Link href="/" className="font-bold">
            Starter Project
          </Link>
        </div>
        <HeaderAuth />
      </div>
    </nav>
  );
}
