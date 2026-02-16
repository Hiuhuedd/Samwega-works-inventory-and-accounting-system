"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
    const pathname = usePathname();
    // Don't show sidebar on login or splash screens
    const isPublic = pathname === "/login" || pathname === "/" || pathname === "/signup";

    if (isPublic) {
        return <>{children}</>;
    }

    // Sidebar Layout
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar fixed on left */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Content scrolls independently */}
                <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {children}
                </div>
            </div>
        </div>
    );
}
