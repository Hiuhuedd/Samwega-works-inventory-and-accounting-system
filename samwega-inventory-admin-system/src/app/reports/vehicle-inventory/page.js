'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Filter,
    Download,
    Truck,
    Package,
    AlertCircle,
    CheckCircle2,
    MapPin,
    Home,
    Search
} from 'lucide-react';
import api from '@/lib/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function VehicleInventoryReport() {
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        vehicleId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchVehicles();
        // Initial fetch if needed, or wait for user interaction
        fetchReport();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.getVehicles({ isActive: true });
            if (response.data && response.data.vehicles) {
                setVehicles(response.data.vehicles);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            // Filter out empty strings
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await api.getVehicleInventoryReport(activeFilters);
            if (response.data) {
                setReportData(response.data);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchReport();
    };

    const exportPDF = () => {
        if (!reportData || !reportData.data) return;

        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for many columns

        // Header
        doc.setFontSize(18);
        doc.text('Vehicle Inventory Report', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Summary Table
        const summary = reportData.summary;
        doc.autoTable({
            startY: 35,
            head: [['Metric', 'Value']],
            body: [
                ['Total Vehicles', summary.totalVehiclesTracked],
                ['Total Value Loaded', `KSh ${summary.totalValueLoadedStock.toLocaleString()}`],
                ['Total Value Sold', `KSh ${summary.totalValueSold.toLocaleString()}`],
                ['Total Value Remaining', `KSh ${summary.totalValueRemaining.toLocaleString()}`]
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
        });

        // Main Data Table
        const rows = reportData.data.map(row => [
            row.vehicleName,
            row.vehicleStatus,
            row.itemName,
            row.itemCategory,
            row.quantityLoaded,
            row.quantitySold,
            row.quantityRemaining,
            `KSh ${row.unitSellingPrice.toLocaleString()}`,
            `KSh ${row.totalValueRemaining.toLocaleString()}`
        ]);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Vehicle', 'Status', 'Item', 'Category', 'Loaded', 'Sold', 'Rem.', 'Price', 'Value Rem.']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Blue header
            styles: { fontSize: 8 },
            columnStyles: {
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' },
                7: { halign: 'right' },
                8: { halign: 'right' }
            },
            didParseCell: function (data) {
                // Highlight Low Stock/Out of Stock rows?
                // Or just standard styling
            }
        });

        doc.save(`vehicle-inventory-report-${Date.now()}.pdf`);
    };

    const getStatusBadge = (status) => {
        const styles = {
            'At Warehouse': 'bg-gray-100 text-gray-800',
            'On Route': 'bg-green-100 text-green-800',
            'In Transit': 'bg-blue-100 text-blue-800',
            'Returned': 'bg-yellow-100 text-yellow-800'
        };
        const icon = status === 'On Route' ? <Truck className="w-3 h-3 mr-1" /> : <Home className="w-3 h-3 mr-1" />;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles['At Warehouse']}`}>
                {icon}
                {status}
            </span>
        );
    };

    // Grouping helper
    const groupedData = reportData?.data ? reportData.data.reduce((acc, row) => {
        if (!acc[row.vehicleId]) {
            acc[row.vehicleId] = {
                details: {
                    name: row.vehicleName,
                    reg: row.registrationNumber,
                    status: row.vehicleStatus,
                    rep: row.salesRepresentative
                },
                items: []
            };
        }
        acc[row.vehicleId].items.push(row);
        return acc;
    }, {}) : {};

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehicle Inventory Report</h1>
                    <p className="text-sm text-gray-500 mt-1">Live view of stock, sales, and status per vehicle</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportPDF}
                        disabled={!reportData || loading}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </button>
                    <button
                        onClick={fetchReport}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-4">
                    <div className="w-full sm:w-64">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Select Vehicle</label>
                        <select
                            name="vehicleId"
                            value={filters.vehicleId}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Vehicles</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.vehicleName} ({v.vehicleNumber})</option>
                            ))}
                        </select>
                    </div>
                    {/* Optional Date Filters if needed for "Loaded Date" range, but mostly "Live" means now. 
                        Keeping them if user wants to filter history (backend supports it). */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date (Optional)</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date (Optional)</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                    >
                        Apply Filters
                    </button>
                </form>
            </div>

            {/* Summary Cards */}
            {reportData && reportData.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vehicles Tracked</div>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-2xl font-bold text-gray-900">{reportData.summary.totalVehiclesTracked}</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value Loaded</div>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-2xl font-bold text-gray-900">KSh {reportData.summary.totalValueLoadedStock.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value Sold</div>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-2xl font-bold text-green-600">KSh {reportData.summary.totalValueSold.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value Remaining</div>
                        <div className="mt-2 flex items-baseline">
                            <span className="text-2xl font-bold text-blue-600">KSh {reportData.summary.totalValueRemaining.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center text-gray-500">
                        Loading report data...
                    </div>
                ) : !reportData || reportData.data.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                        <Package className="w-12 h-12 text-gray-300 mb-3" />
                        <p>No inventory data found matching your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Item Name</th>
                                    <th className="px-6 py-3 font-medium">Category</th>
                                    <th className="px-6 py-3 font-medium text-right">Qty Loaded</th>
                                    <th className="px-6 py-3 font-medium text-right">Qty Sold</th>
                                    <th className="px-6 py-3 font-medium text-right">Qty Remaining</th>
                                    <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                                    <th className="px-6 py-3 font-medium text-right">Value Rem.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Object.values(groupedData).map(group => (
                                    <React.Fragment key={group.details.name}>
                                        {/* Vehicle Header Row */}
                                        <tr className="bg-gray-100">
                                            <td colSpan={7} className="px-6 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                            <Truck className="w-4 h-4" />
                                                        </span>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{group.details.name}</div>
                                                            <div className="text-xs text-gray-500">{group.details.reg} • Loaded: {new Date(group.items[0].stockLoadedDate).toLocaleDateString()}</div>
                                                        </div>
                                                        {getStatusBadge(group.details.status)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Sales Rep: <span className="font-medium text-gray-900">{group.details.rep}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Item Rows */}
                                        {group.items.map((item, idx) => (
                                            <tr key={`${item.vehicleId}-${idx}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium text-gray-900">
                                                    {item.itemName}
                                                </td>
                                                <td className="px-6 py-3 text-gray-500">
                                                    {item.itemCategory}
                                                </td>
                                                <td className="px-6 py-3 text-right font-medium text-gray-900">
                                                    {item.quantityLoaded}
                                                </td>
                                                <td className="px-6 py-3 text-right text-green-600 font-medium">
                                                    {item.quantitySold}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {item.quantityRemaining === 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            Out of Stock
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-gray-900">{item.quantityRemaining}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-right text-gray-500">
                                                    {item.unitSellingPrice.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-3 text-right font-medium text-blue-600">
                                                    {item.totalValueRemaining.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
