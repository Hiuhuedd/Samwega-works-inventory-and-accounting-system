"use client";

import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Calendar,
    Truck,
    CreditCard,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Banknote,
    Smartphone,
    Landmark,
    Clock,
    Trash2,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

import DeleteSaleModal from "../../components/KKCalcModal";


export default function SalesDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [sales, setSales] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSales, setSelectedSales] = useState([]);

    // Filters
    const [selectedVehicle, setSelectedVehicle] = useState("");

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
    // Default to All Time (empty dates)
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");


    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        fetchData();
    }, [selectedVehicle, startDate, endDate]);

    const fetchVehicles = async () => {
        try {
            const response = await api.getVehicles();
            // Backend returns { success: true, data: { vehicles: [...], pagination: {...} } }
            if (response.success && response.data && Array.isArray(response.data.vehicles)) {
                setVehicles(response.data.vehicles);
            } else if (response.success && Array.isArray(response.data)) {
                // Fallback in case structure changes
                setVehicles(response.data);
            } else {
                setVehicles([]);
            }
        } catch (err) {
            console.error("Error fetching vehicles:", err);
            setVehicles([]);
        }
    };

    // Helper function to convert Firestore timestamp to Date
    const convertTimestamp = (timestamp) => {
        if (!timestamp) return null;
        // Handle Firestore Timestamp object
        if (timestamp._seconds) {
            return new Date(timestamp._seconds * 1000);
        }
        // Handle already converted date
        if (timestamp instanceof Date) {
            return timestamp;
        }
        // Handle string dates
        if (typeof timestamp === 'string') {
            return new Date(timestamp);
        }
        return null;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (startDate && endDate) {
                filters.startDate = startDate;
                filters.endDate = endDate;
                filters.type = 'custom';
            } else {
                filters.type = 'all';
            }

            if (selectedVehicle) filters.vehicleId = selectedVehicle;

            // For stats, we need to aggregate all vehicles if no specific vehicle selected
            // The backend expects vehicleId, so we'll fetch stats for the first vehicle or handle differently
            let statsPromise;
            if (selectedVehicle) {
                statsPromise = api.getSalesStats(filters);
            } else {
                // When no vehicle selected, try to get stats without vehicleId filter
                // or aggregate from all sales
                statsPromise = api.getSalesStats(filters);
            }

            const [statsData, salesData] = await Promise.all([
                statsPromise,
                api.getSales({ ...filters, limit: 50 })
            ]);

            console.log('=== STATS DEBUG ===');
            console.log('Stats API Response:', statsData);
            console.log('Stats Data:', statsData?.data);
            console.log('Sales API Response:', salesData);
            console.log('Number of sales returned:', salesData?.data?.sales?.length);
            if (salesData?.data?.sales?.length > 0) {
                console.log('First sale date:', salesData.data.sales[0].saleDate);
                console.log('First sale grandTotal:', salesData.data.sales[0].grandTotal);
                console.log('First sale paymentMethod:', salesData.data.sales[0].paymentMethod);
            }

            if (statsData.success && statsData.data) {
                console.log('Setting stats to:', statsData.data);
                setStats(statsData.data);
            } else {
                console.warn('Stats API failed, using defaults');
                // Set default stats if API fails
                setStats({
                    totalRevenue: 0,
                    totalTransactions: 0,
                    totalItemsSold: 0,
                    paymentMethods: { cash: 0, mpesa: 0, bank: 0, credit: 0, mixed: 0 }
                });
            }


            if (salesData.success && salesData.data && Array.isArray(salesData.data.sales)) {
                setSales(salesData.data.sales);
            } else if (salesData.success && Array.isArray(salesData.data)) {
                // Fallback in case structure changes
                setSales(salesData.data);
            } else {
                setSales([]);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            // Check if it's a token expiration error

            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSaleSelection = (saleId) => {
        setSelectedSales(prev =>
            prev.includes(saleId)
                ? prev.filter(id => id !== saleId)
                : [...prev, saleId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedSales.length === sales.length) {
            setSelectedSales([]);
        } else {
            setSelectedSales(sales.map(s => s.id));
        }
    };

    const handleDeleteSuccess = () => {
        setSelectedSales([]);
        fetchData();
    };

    const StatCard = ({ title, value, subValue }) => (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">{title}</h3>
            <div className="flex items-baseline justify-between">
                <p className="text-2xl font-semibold text-slate-900">{value}</p>
                {subValue && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                        <ArrowUpRight size={12} />
                        {subValue}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            <div className="p-6">
                <div className="mx-auto max-w-[1600px] space-y-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                                Sales Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                disabled={selectedSales.length === 0}
                                className="flex items-center gap-2 bg-white text-rose-600 px-3 py-1.5 rounded border border-rose-200 text-sm font-medium hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Trash2 size={14} />
                                Delete {selectedSales.length > 0 ? `(${selectedSales.length})` : ''}
                            </button>

                            <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-200">
                                <div className="relative">
                                    <select
                                        value={selectedVehicle}
                                        onChange={(e) => setSelectedVehicle(e.target.value)}
                                        className="py-1 bg-transparent border-none text-sm text-slate-700 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="">All Vehicles</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.vehicleName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="py-1 bg-transparent border-none text-sm text-slate-700 focus:ring-0 cursor-pointer w-32"
                                    />
                                    <span className="text-slate-400 text-xs">-</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="py-1 bg-transparent border-none text-sm text-slate-700 focus:ring-0 cursor-pointer w-32"
                                    />
                                </div>
                                {(selectedVehicle || startDate || endDate) && (
                                    <button
                                        onClick={() => {
                                            setSelectedVehicle("");
                                            const reset = getLast30Days();
                                            setStartDate(reset.start);
                                            setEndDate(reset.end);
                                        }}
                                        className="text-xs text-rose-500 font-medium hover:text-rose-700 px-2"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard
                            title="Total Revenue"
                            value={`KSh ${stats?.totalRevenue?.toLocaleString() || 0}`}
                            subValue={`${stats?.totalTransactions || 0} sales`}
                        />
                        <StatCard
                            title="Cash Sales"
                            value={`KSh ${stats?.paymentMethods?.cash?.toLocaleString() || 0}`}
                        />
                        <StatCard
                            title="M-Pesa Sales"
                            value={`KSh ${stats?.paymentMethods?.mpesa?.toLocaleString() || 0}`}
                        />
                        <StatCard
                            title="Bank Sales"
                            value={`KSh ${stats?.paymentMethods?.bank?.toLocaleString() || 0}`}
                        />
                        <StatCard
                            title="Debt Sales"
                            value={`KSh ${stats?.paymentMethods?.credit?.toLocaleString() || 0}`}
                        />
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mt-6">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search sales..."
                                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-slate-400"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedSales.length === sales.length && sales.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-6 py-3 font-medium">Receipt</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Vehicle</th>
                                        <th className="px-6 py-3 font-medium">Items</th>
                                        <th className="px-6 py-3 font-medium">Payment</th>
                                        <th className="px-6 py-3 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : sales.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                                No sales found.
                                            </td>
                                        </tr>
                                    ) : (
                                        sales.map((sale) => {
                                            const vehicle = vehicles.find(v => v.id === sale.vehicleId);
                                            const isSelected = selectedSales.includes(sale.id);
                                            return (
                                                <tr
                                                    key={sale.id}
                                                    className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-slate-50' : ''}`}
                                                >
                                                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSaleSelection(sale.id)}
                                                            className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td
                                                        className="px-6 py-3 font-mono text-slate-600 cursor-pointer text-xs"
                                                        onClick={() => router.push(`/sales/${sale.id}`)}
                                                    >
                                                        {sale.receiptNumber || `#${sale.id.substring(0, 8)}`}
                                                    </td>
                                                    <td
                                                        className="px-6 py-3 text-slate-900 cursor-pointer"
                                                        onClick={() => router.push(`/sales/${sale.id}`)}
                                                    >
                                                        <div className="text-sm">
                                                            {convertTimestamp(sale.saleDate)?.toLocaleDateString() || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {convertTimestamp(sale.saleDate)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="px-6 py-3 cursor-pointer"
                                                        onClick={() => router.push(`/sales/${sale.id}`)}
                                                    >
                                                        <span className="text-slate-700">
                                                            {vehicle ? vehicle.vehicleName : '-'}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className="px-6 py-3 cursor-pointer"
                                                        onClick={() => router.push(`/sales/${sale.id}`)}
                                                    >
                                                        <div className="text-slate-700 truncate max-w-[200px]" title={sale.items.map(i => i.productName).join(', ')}>
                                                            {sale.items[0]?.productName} {sale.items.length > 1 && <span className="text-slate-400 text-xs">+{sale.items.length - 1}</span>}
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="px-6 py-3 cursor-pointer"
                                                        onClick={() => router.push(`/sales/${sale.id}`)}
                                                    >
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border
                                                        ${sale.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                sale.paymentMethod === 'mpesa' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                                                                    'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                            {sale.paymentMethod}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className="px-6 py-3 text-right font-medium text-slate-900 cursor-pointer"
                                                        onClick={() => router.push(`/sales/${sale.id}`)}
                                                    >
                                                        {parseFloat(sale.grandTotal).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <DeleteSaleModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onSuccess={handleDeleteSuccess}
                    selectedSales={selectedSales}
                    sales={sales}
                />
            </div>
        </div>
    );
}
