"use client";

import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Simple breadcrumb or title based on path
  const getTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace("-", " ");
    }
    return "Home";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-800">{getTitle()}</h1>
      <div className="flex items-center gap-4">
        {/* User profile or actions can go here */}

      </div>
    </header>
  );
}