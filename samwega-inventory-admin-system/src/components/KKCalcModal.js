"use client";

import { useState } from "react";
import { X, Trash2, AlertCircle, Clock } from "lucide-react";
import api from "@/lib/api";

export default function DeleteSaleModal({ isOpen, onClose, onSuccess, selectedSales = [], sales = [] }) {
    const [actionType, setActionType] = useState("void"); // "void" or "delete"
    const [voidReason, setVoidReason] = useState("Cancelled by Manager");
    const [deleting, setDeleting] = useState(false);

    if (!isOpen) return null;

    // Get full sale details for selected IDs
    const selectedSaleDetails = sales.filter(sale => selectedSales.includes(sale.id));
    const totalAmount = selectedSaleDetails.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);

    const handleAction = async () => {
        if (selectedSales.length === 0) return;

        if (actionType === 'void' && !voidReason.trim()) {
            alert("Please provide a reason for voiding.");
            return;
        }

        const actionWord = actionType === 'void' ? 'reverse' : 'permanently delete';
        const confirmMessage = selectedSales.length === 1
            ? `Are you sure you want to ${actionWord} this sale?\n\nReceipt: ${selectedSaleDetails[0].receiptNumber}\nAmount: KSh ${selectedSaleDetails[0].grandTotal?.toLocaleString()}\n\nThis action cannot be undone.`
            : `Are you sure you want to ${actionWord} ${selectedSales.length} sales?\n\nTotal Amount: KSh ${totalAmount.toLocaleString()}\n\nThis action cannot be undone.`;

        if (!confirm(confirmMessage)) {
            return;
        }

        setDeleting(true);
        try {
            if (actionType === 'void') {
                const results = await Promise.all(selectedSales.map(id => api.voidSale(id, voidReason)));
                const failed = results.filter(r => !r.success);

                if (failed.length === 0) {
                    alert(`${selectedSales.length} sale(s) reversed successfully.`);
                    onSuccess();
                    onClose();
                } else {
                    alert(`Failed to reverse some sales: ${failed.map(f => f.message).join(', ')}`);
                }
            } else {
                // Use batch delete for multiple sales, single delete for one
                if (selectedSales.length === 1) {
                    const response = await api.deleteSale(selectedSales[0]);
                    if (response.success) {
                        alert("Sale deleted successfully.");
                        onSuccess();
                        onClose();
                    } else {
                        alert("Failed to delete sale: " + response.message);
                    }
                } else {
                    const response = await api.deleteSalesBatch(selectedSales);
                    if (response.success) {
                        alert(`${selectedSales.length} sales deleted successfully.`);
                        onSuccess();
                        onClose();
                    } else {
                        alert("Failed to delete sales: " + response.message);
                    }
                }
            }
        } catch (error) {
            console.error(`${actionType === 'void' ? 'Reverse' : 'Delete'} Error:`, error);
            alert(`An error occurred while ${actionType === 'void' ? 'reversing' : 'deleting'} the sale(s).`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">
                                {actionType === 'void' ? 'Reverse' : 'Delete'} {selectedSales.length} Sale{selectedSales.length !== 1 ? 's' : ''}
                            </h2>
                            <p className="text-xs text-slate-500">Review and confirm action</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {selectedSales.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
                            <p className="text-slate-600 font-medium">No sales selected</p>
                            <p className="text-sm text-slate-500 mt-2">Please select sales from the table to proceed</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Action Choice */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setActionType("void")}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${actionType === 'void'
                                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                                        : 'border-slate-100 hover:border-slate-200 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-1.5 rounded-lg ${actionType === 'void' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <Clock size={16} />
                                        </div>
                                        <span className={`font-bold ${actionType === 'void' ? 'text-amber-900' : 'text-slate-700'}`}>Reverse Sale</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Inventory is restored to the vehicle and the record is kept for auditing. Best for customer returns or cancellations.
                                    </p>
                                </button>

                                <button
                                    onClick={() => setActionType("delete")}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${actionType === 'delete'
                                        ? 'border-rose-500 bg-rose-50 shadow-sm'
                                        : 'border-slate-100 hover:border-slate-200 bg-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-1.5 rounded-lg ${actionType === 'delete' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <Trash2 size={16} />
                                        </div>
                                        <span className={`font-bold ${actionType === 'delete' ? 'text-rose-900' : 'text-slate-700'}`}>Hard Delete</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Permanently destroys the record. Inventory is NOT restored. Best for correcting internal testing or human input errors.
                                    </p>
                                </button>
                            </div>

                            {/* Reversal Reason */}
                            {actionType === 'void' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Reason for Reversal</label>
                                    <textarea
                                        value={voidReason}
                                        onChange={(e) => setVoidReason(e.target.value)}
                                        placeholder="Enter the reason (e.g., Customer return, Wrong products selected...)"
                                        className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 min-h-[100px] transition-colors"
                                    />
                                </div>
                            )}

                            {/* Summary Card */}
                            <div className={`${actionType === 'void' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'} border rounded-lg p-5 transition-colors`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs ${actionType === 'void' ? 'text-amber-600' : 'text-rose-600'} uppercase font-bold tracking-wider mb-1`}>Selected Sales</p>
                                        <p className={`text-2xl font-bold ${actionType === 'void' ? 'text-amber-900' : 'text-rose-900'}`}>{selectedSales.length}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs ${actionType === 'void' ? 'text-amber-600' : 'text-rose-600'} uppercase font-bold tracking-wider mb-1`}>Total Amount</p>
                                        <p className={`text-2xl font-bold ${actionType === 'void' ? 'text-amber-900' : 'text-rose-900'}`}>KSh {totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sales List */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3">Targeted transactions:</h3>
                                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                                    {selectedSaleDetails.map((sale) => (
                                        <div key={sale.id} className="p-3 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-mono font-bold text-slate-900 text-sm">
                                                        {sale.receiptNumber || `#${sale.id.substring(0, 8)}`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">
                                                        {new Date(sale.saleDate || sale.createdAt).toLocaleDateString()} • {sale.grandTotal?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] bg-white border border-slate-100 px-1.5 py-0.5 rounded text-slate-400 capitalize">
                                                    {sale.paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={deleting}
                                    className={`flex-1 py-3 ${actionType === 'void' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-lg font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2`}
                                >
                                    {actionType === 'void' ? <Clock size={18} /> : <Trash2 size={18} />}
                                    {deleting ? 'Processing...' : (actionType === 'void' ? `Reverse ${selectedSales.length} Sale${selectedSales.length !== 1 ? 's' : ''}` : `Delete ${selectedSales.length} Sale${selectedSales.length !== 1 ? 's' : ''}`)}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
