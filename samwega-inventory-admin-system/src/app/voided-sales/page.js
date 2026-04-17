"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Search,
    ArrowLeft,
    ChevronDown,
    X,
    Clock,
    AlertCircle,
    User,
    Calendar,
    Receipt,
    List
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const convertTimestamp = (ts) => {
    if (!ts) return null;
    if (ts._seconds) return new Date(ts._seconds * 1000);
    if (ts instanceof Date) return ts;
    if (typeof ts === "string") return new Date(ts);
    return null;
};

const fmt = (n) => Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Sub-components ───────────────────────────────────────────────────────────

const ReversedSaleCard = ({ sale }) => {
    const date = convertTimestamp(sale.voidedAt || sale.updatedAt || sale.saleDate);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Receipt size={14} className="text-slate-400" />
                    <span className="font-mono font-bold text-slate-700">{sale.receiptNumber || `#${sale.id.substring(0, 8)}`}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold uppercase tracking-wider">
                    <Clock size={10} />
                    Reversed
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-tight">Amount</p>
                        <p className="text-lg font-bold text-slate-900">KSh {fmt(sale.grandTotal)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-medium tracking-tight">Reversed On</p>
                        <p className="text-xs font-medium text-slate-700">{date ? date.toLocaleDateString() : '-'}</p>
                    </div>
                </div>

                <div className="bg-amber-50/30 rounded-lg p-3 border border-amber-100/50">
                    <p className="text-[10px] text-amber-600 uppercase font-bold mb-1 flex items-center gap-1">
                        <AlertCircle size={10} />
                        Reason
                    </p>
                    <p className="text-sm text-slate-700 italic">
                        "{sale.voidReason || 'No reason provided'}"
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={12} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-medium leading-none">Reversed By</p>
                            <p className="text-xs font-bold text-slate-700">{sale.voidedByName || 'Unknown Manager'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium leading-none">Customer</p>
                        <p className="text-xs font-bold text-slate-700">{sale.customerName || 'Walk-in'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ReversedSales() {
    const router = useRouter();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        fetchReversedSales();
    }, []);

    const fetchReversedSales = async () => {
        setLoading(true);
        try {
            // Get all sales with status=voided
            const res = await api.getSales({ status: 'voided', limit: 500 });
            if (res.success) {
                setSales(res.data?.sales || res.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = useMemo(() => {
        let result = sales;

        if (selectedDate) {
            result = result.filter(s => {
                const date = convertTimestamp(s.voidedAt || s.saleDate);
                return date && date.toISOString().split('T')[0] === selectedDate;
            });
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                (s.receiptNumber || "").toLowerCase().includes(q) ||
                (s.customerName || "").toLowerCase().includes(q) ||
                (s.voidReason || "").toLowerCase().includes(q) ||
                (s.voidedByName || "").toLowerCase().includes(q)
            );
        }

        return result;
    }, [sales, search, selectedDate]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 lg:p-6">
            <div className="mx-auto max-w-[1400px] space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Reversed Sales</h1>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {loading ? "Loading..." : `${filteredSales.length} reversed transactions found`}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search receipt, manager, reason..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 shadow-sm"
                            />
                        </div>

                        {/* Date Filter */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                            <Calendar size={14} className="text-slate-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none text-slate-700 focus:ring-0 cursor-pointer w-32 text-xs font-medium"
                            />
                        </div>

                        {(search || selectedDate) && (
                            <button
                                onClick={() => { setSearch(""); setSelectedDate(""); }}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <List size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No reversed sales found</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                            There are no transactions matching your current filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSales.map(sale => (
                            <ReversedSaleCard key={sale.id} sale={sale} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
