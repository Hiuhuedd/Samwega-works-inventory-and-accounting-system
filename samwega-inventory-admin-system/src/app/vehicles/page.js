"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, TrendingUp, Truck, X, User, ArrowRight, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import api from "../../lib/api";

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ vehicleName: "", vehicleNumber: "" });
    const [submitting, setSubmitting] = useState(false);

    // Fetch vehicles
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await api.getVehicles();
                console.log("Raw API response:", response);
                // Response is: { success, message, data: { vehicles: [...], pagination: {...} } }
                const vList = response?.data?.vehicles || response?.vehicles || response?.data || [];
                console.log("Extracted vehicles:", vList);
                setVehicles(Array.isArray(vList) ? vList : []);
            } catch (err) {
                console.error("Failed to fetch vehicles", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        alert("Form submitted with: " + formData.vehicleNumber);  // Debug

        if (!formData.vehicleNumber) {
            alert("Please enter a vehicle number");
            return;
        }

        setSubmitting(true);
        try {
            console.log("Creating vehicle:", formData);
            const newVehicle = await api.createVehicle({
                vehicleName: formData.vehicleName || formData.vehicleNumber,
                vehicleNumber: formData.vehicleNumber
            });
            console.log("Vehicle created:", newVehicle);
            alert("Vehicle created successfully!");

            // Refresh vehicles list
            const data = await api.getVehicles();
            console.log("Fetched vehicles data:", data);
            const vList = data?.vehicles || data?.data || data || [];
            console.log("Extracted vehicles list:", vList);
            alert("Fetched " + vList.length + " vehicles");
            setVehicles(Array.isArray(vList) ? vList : []);
            setFormData({ vehicleName: "", vehicleNumber: "" });
            setShowModal(false);
        } catch (err) {
            console.error("Error adding vehicle", err);
            alert(err.message || "Failed to add vehicle");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-sky-600" />
                    <p className="text-sm text-slate-500">Loading vehicles…</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 text-slate-900">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Sales Vehicles</h1>
                    <p className="text-sm text-slate-500">Manage your fleet and track stock issuances</p>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <button
                        onClick={() => setShowModal(true)}
                        className="ml-2 btn-primary text-xs shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all"
                    >
                        <Plus size={14} className="mr-1" />
                        Add Vehicle
                    </button>
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{vehicle.vehicleName || "Vehicle"}</h3>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                        {vehicle.vehicleNumber}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Driver Info */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <User size={14} className="text-slate-400" />
                                <span className="truncate">{vehicle.assignedUserName || "No driver assigned"}</span>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="border-t border-slate-100 pt-3 mt-3">
                            <Link
                                href={`/vehicles/${vehicle.id}`}
                                className="flex items-center justify-center w-full px-4 py-2 bg-sky-50 hover:bg-sky-100 rounded-lg text-sm font-medium text-sky-700 transition-colors border border-sky-100"
                            >
                                <span>View Issue History</span>
                                <ArrowRight size={16} className="ml-2" />
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add New Card */}
                {vehicles.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                        <Truck size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium text-slate-600">No vehicles found</p>
                        <p className="text-sm mb-6">Get started by adding your first vehicle</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary text-sm"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Vehicle
                        </button>
                    </div>
                )}
            </div>

            {/* Add Vehicle Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">Add New Vehicle</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Vehicle Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Van A"
                                    value={formData.vehicleName}
                                    onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Vehicle Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. KDV 123B"
                                    value={formData.vehicleNumber}
                                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-700 disabled:opacity-70 transition-all"
                                >
                                    {submitting ? "Saving..." : "Save Vehicle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
