"use client";

import { useState } from "react";
import { X, Calculator, Trash2, ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function KKCalcModal({ isOpen, onClose, onSuccess }) {
    const [targetAmount, setTargetAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [deleting, setDeleting] = useState(false);

    if (!isOpen) return null;

    const handleFind = async (e) => {
        e.preventDefault();
        if (!targetAmount) return;

        setLoading(true);
        setResult(null);
        try {
            const amount = parseFloat(targetAmount);
            const response = await api.findSalesCombination(amount);
            if (response.success) {
                setResult(response.data);
            } else {
                alert("Failed to find sales: " + response.message);
            }
        } catch (error) {
            console.error("KK-Calc Error:", error);
            alert("An error occurred while searching for sales.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!result || !result.sales.length) return;
        if (!confirm(`Are you sure you want to delete ${result.sales.length} sales totaling KSh ${result.foundAmount?.toLocaleString()}? This cannot be undone.`)) return;

        setDeleting(true);
        try {
            const saleIds = result.sales.map(s => s.id);
            const response = await api.deleteSalesBatch(saleIds);
            if (response.success) {
                alert("Sales deleted successfully.");
                onSuccess();
                onClose();
            } else {
                alert("Failed to delete sales: " + response.message);
            }
        } catch (error) {
            console.error("Delete Batch Error:", error);
            alert("An error occurred while deleting sales.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Smart Sales Deletion</h2>
                            <p className="text-xs text-slate-500">Find and remove sales by target amount</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {!result ? (
                        <form onSubmit={handleFind} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount to Delete (KSh)</label>
                                <input
                                    type="number"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    placeholder="e.g. 50000"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-lg font-medium"
                                    autoFocus
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    The system will use the "KK-Calc" algorithm to find a combination of existing sales that match this amount exactly or as closely as possible.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !targetAmount}
                                className="w-full py-3 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Searching...' : 'Find Sales'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Target</p>
                                    <p className="text-lg font-medium text-slate-700">KSh {parseFloat(targetAmount).toLocaleString()}</p>
                                </div>
                                <ArrowRight className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Found</p>
                                    <p className="text-lg font-bold text-emerald-600">KSh {result.foundAmount?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Diff</p>
                                    <p className="text-sm font-medium text-rose-500">{Math.abs(result.difference).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">{result.count}</span>
                                    Sales Selected
                                </h3>
                                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                    {result.sales.map((sale) => (
                                        <div key={sale.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}
                                                    <span className="text-xs text-slate-400 ml-2">
                                                        {new Date(sale.saleDate || sale.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-slate-500 line-clamp-1">{sale.items?.map(i => i.productName).join(', ')}</p>
                                            </div>
                                            <span className="font-mono font-bold text-slate-700">KSh {sale.grandTotal?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setResult(null)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel / Reselect
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    {deleting ? 'Deleting...' : 'Delete Sales'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
