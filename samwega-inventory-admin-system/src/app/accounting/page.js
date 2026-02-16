"use client";

import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Banknote,
    Receipt,
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign
} from "lucide-react";
import api from "../../lib/api";


export default function AccountingDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Date range filter (default last 30 days)
    const getLast30Days = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const defaultRange = getLast30Days();
    const [startDate, setStartDate] = useState(defaultRange.start);
    const [endDate, setEndDate] = useState(defaultRange.end);

    useEffect(() => {
        fetchStats();
    }, [startDate, endDate]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const filters = { startDate, endDate };
            const response = await api.getAccountingStats(filters);
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error("Error fetching accounting stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subValue, icon: Icon, color, trend }) => (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                {trend === 'up' && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} /> Positive
                    </span>
                )}
                {trend === 'down' && (
                    <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingDown size={12} /> Negative
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subValue && <p className="text-sm opacity-75 mt-1">{subValue}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            <div className="p-6">
                <div className="mx-auto max-w-[1600px] space-y-6">

                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Wallet className="text-violet-600" />
                                Accounting Dashboard
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Financial overview: Revenue, Invoices, Expenses, and Profit</p>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-md text-sm text-slate-700 focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors w-40"
                                    />
                                </div>
                                <span className="text-slate-400 text-sm">to</span>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="pl-4 pr-4 py-2 bg-slate-50 border-none rounded-md text-sm text-slate-700 focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors w-40"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const reset = getLast30Days();
                                    setStartDate(reset.start);
                                    setEndDate(reset.end);
                                }}
                                className="text-xs text-rose-500 font-medium hover:text-rose-700 px-2"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-slate-500">Loading accounting stats...</div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total Revenue"
                                    value={`KSh ${stats?.totalRevenue?.toLocaleString() || 0}`}
                                    icon={Banknote}
                                    color="bg-emerald-500"
                                    trend="up"
                                />
                                <StatCard
                                    title="Supplier Invoices"
                                    value={`KSh ${stats?.totalInvoices?.toLocaleString() || 0}`}
                                    icon={Receipt}
                                    color="bg-blue-500"
                                    subValue="Inventory Purchases"
                                />
                                <StatCard
                                    title="Total Expenses"
                                    value={`KSh ${stats?.totalExpenses?.toLocaleString() || 0}`}
                                    icon={ArrowDownRight}
                                    color="bg-amber-500"
                                    subValue="Ops & Overheads"
                                />
                                <StatCard
                                    title="Net Profit"
                                    value={`KSh ${stats?.netProfit?.toLocaleString() || 0}`}
                                    icon={DollarSign}
                                    color={stats?.netProfit >= 0 ? "bg-violet-600" : "bg-rose-600"}
                                    trend={stats?.netProfit >= 0 ? "up" : "down"}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Selling Items */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-900">Top Selling Items</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Qty</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {stats?.topSellingItems?.map((item, i) => (
                                                    <tr key={i} className="hover:bg-slate-50">
                                                        <td className="px-6 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                                                        <td className="px-6 py-3 text-sm text-right text-slate-600">{item.qty}</td>
                                                        <td className="px-6 py-3 text-sm text-right font-semibold text-emerald-600">
                                                            KSh {item.revenue?.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!stats?.topSellingItems || stats.topSellingItems.length === 0) && (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400">No data available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Top Expenses */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-900">Top Expenses</h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {stats?.topExpenses?.map((expense, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                                                        {i + 1}
                                                    </div>
                                                    <span className="font-medium text-slate-700 capitalize">{expense.category}</span>
                                                </div>
                                                <span className="font-bold text-slate-900">KSh {expense.amount?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {(!stats?.topExpenses || stats.topExpenses.length === 0) && (
                                            <div className="text-center py-8 text-slate-400">No expense data available</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
