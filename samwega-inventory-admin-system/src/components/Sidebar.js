"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Home,
    Users,
    FileText,
    BarChart,
    Wallet,
    Calculator,
    Truck,
    LogOut,
    Settings,
    Package,
    ShoppingCart,
    ArrowRightLeft,
    Contact,
    PlusCircle
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        api.logout();
        router.push("/login");
    };

    const menuItems = [
        { name: "Inventory", href: "/dashboard", icon: Package },
        { name: "Add Stock", href: "/dashboard/add", icon: PlusCircle },
        { name: "Transfer Stock", href: "/issue-stock", icon: ArrowRightLeft },
        { name: "Sales", href: "/sales-dashboard", icon: ShoppingCart },
        { name: "Vehicles", href: "/vehicles", icon: Truck },
        { name: "Sales Team", href: "/sales-team", icon: Contact },
        { name: "Suppliers", href: "/suppliers", icon: Users },
        { name: "Invoices", href: "/invoices", icon: FileText },
        { name: "Expenses", href: "/expenses", icon: Wallet },
        { name: "Accounting", href: "/accounting", icon: Calculator },
        { name: "Reports", href: "/reports", icon: BarChart },
    ];

    const isActive = (path) => {
        if (path === "/dashboard" && pathname === "/dashboard") return true;
        if (path !== "/dashboard" && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white text-slate-900 lg:flex h-screen sticky top-0">
            {/* Brand */}
            <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 shadow-sm shadow-sky-200">
                    <span className="text-sm font-bold text-white">S</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-wide text-slate-900">SAMWEGA</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">WORKS LTD</span>
                </div>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(item.href)
                            ? "bg-sky-50 text-sky-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <item.icon size={18} />
                        {item.name}
                    </Link>
                ))}
            </div>

            {/* Footer / Logout */}
            <div className="border-t border-slate-100 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
