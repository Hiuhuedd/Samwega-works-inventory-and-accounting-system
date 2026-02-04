"use client"
import { useState, useEffect } from "react";
import { Plus, Search, CheckCircle, XCircle, Clock, Calendar, Filter, Truck, User, Fuel, Wrench, Briefcase, Calculator } from "lucide-react";
import api from "../../lib/api";

const CATEGORY_ICONS = {
    fuel: Fuel,
    maintenance: Wrench,
    salary: User,
    rent: Briefcase,
    utilities: Calculator,
    other: DollarSignIcon
};

function DollarSignIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Filters
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Data
    const [vehicles, setVehicles] = useState([]);
    const [categoryStats, setCategoryStats] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        description: "",
        vehicleId: "",
        expenseDate: new Date().toISOString().split('T')[0],
        receiptUrl: ""
    });

    useEffect(() => {
        fetchVehicles();
        // Default to all-time (empty dates)
    }, []);

    useEffect(() => {
        // Fetch data whenever filters change
        fetchExpenses();
        fetchCategoryStats();
    }, [startDate, endDate, vehicleFilter]);

    const fetchVehicles = async () => {
        try {
            const response = await api.getVehicles();
            setVehicles(response?.data?.vehicles || response?.vehicles || []);
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
        }
    };

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const filters = {};

            // Only add filters if they have values
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (vehicleFilter) filters.vehicleId = vehicleFilter;

            const response = await api.getExpenses(filters);
            if (response.success && response.data) {
                // Handle different response structures (pagination wrapper vs direct array)
                const expensesList = response.data.expenses || response.data || [];
                setExpenses(expensesList);
            }
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryStats = async () => {
        try {
            // If no dates selected, use a wide range for "all time" stats
            // or default to current year/context if prefered, but "all time" requested.
            const statsStartDate = startDate || '2020-01-01';
            const statsEndDate = endDate || new Date().toISOString().split('T')[0];

            const response = await api.getExpensesByCategory(statsStartDate, statsEndDate);
            if (response.success) {
                setCategoryStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch category stats:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create payload and remove empty optional fields
            const payload = { ...formData };
            if (!payload.vehicleId) delete payload.vehicleId;
            if (!payload.receiptUrl) delete payload.receiptUrl;
            if (!payload.notes) delete payload.notes;

            await api.createExpense(payload);
            setShowAddModal(false);
            setFormData({
                category: "",
                amount: "",
                description: "",
                vehicleId: "",
                expenseDate: new Date().toISOString().split('T')[0],
                receiptUrl: ""
            });
            fetchExpenses();
            fetchCategoryStats();
        } catch (error) {
            console.error("Failed to create expense:", error);
            alert("Failed to create expense");
        }
    };



    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = !search ||
            expense.description?.toLowerCase().includes(search.toLowerCase()) ||
            expense.category?.toLowerCase().includes(search.toLowerCase()) ||
            expense.vehicleName?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Expenses</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage all money-out records</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <Plus className="mr-2" size={16} />
                    New Expense
                </button>
            </div>

            {/* Stats Overview */}
            {categoryStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel px-5 py-5 border-l-4 border-l-sky-500">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Expenses</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">KSh {categoryStats.totalExpenses.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 mt-2">{categoryStats.totalCount} records</p>
                    </div>
                    {categoryStats.categories.slice(0, 3).map((cat) => {
                        const Icon = CATEGORY_ICONS[cat.category.toLowerCase()] || DollarSignIcon;
                        return (
                            <div key={cat.category} className="glass-panel px-5 py-5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{cat.category}</p>
                                    <Icon size={16} className="text-slate-400" />
                                </div>
                                <p className="text-xl font-semibold text-slate-900">KSh {cat.totalAmount.toLocaleString()}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Filters */}
            <div className="glass-panel p-5 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field w-full text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field w-full text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle</label>
                            <select
                                value={vehicleFilter}
                                onChange={(e) => setVehicleFilter(e.target.value)}
                                className="input-field w-full text-sm"
                            >
                                <option value="">All Vehicles</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.vehicleName}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search description, category or vehicle..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-9 w-full"
                    />
                </div>
            </div>

            {/* Expenses List */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Entity / Vehicle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Amount</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                                            {new Date(expense.expenseDate || expense.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-900">
                                            {expense.vehicleName ? (
                                                <span className="flex items-center gap-1.5 text-slate-700">
                                                    <Truck size={14} className="text-slate-400" />
                                                    {expense.vehicleName}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-slate-500 italic">
                                                    <User size={14} />
                                                    {expense.submittedByName || 'Admin'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200 uppercase">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={expense.description}>
                                            {expense.description}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 whitespace-nowrap">
                                            KSh {expense.amount.toLocaleString()}
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                        No expenses found for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-panel p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold text-slate-900">New Expense</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        value={formData.expenseDate}
                                        onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (KSh)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="input-field w-full"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field w-full"
                                    required
                                >
                                    <option value="">Select category</option>
                                    <option value="fuel">Fuel</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="salary">Salary</option>
                                    <option value="rent">Rent</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign to Vehicle (Optional)</label>
                                <select
                                    value={formData.vehicleId}
                                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    className="input-field w-full"
                                >
                                    <option value="">None (General Expense)</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.vehicleName} - {v.registrationNumber}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field w-full"
                                    rows="3"
                                    placeholder="Enter details about this expense..."
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Create Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
