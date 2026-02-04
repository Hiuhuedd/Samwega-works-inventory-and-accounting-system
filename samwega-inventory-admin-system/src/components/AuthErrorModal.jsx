'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut } from 'lucide-react';

export default function AuthErrorModal({ isOpen, onClose, message }) {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            // Auto-redirect after 5 seconds
            const timer = setTimeout(() => {
                handleLogout();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleLogout = () => {
        // Clear auth data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        onClose();
        router.push('/login');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-3 bg-white/20 rounded-full">
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Session Expired</h2>
                            <p className="text-sm text-white/90">Authentication Required</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-slate-700">
                        {message || 'Your session has expired. Please log in again to continue.'}
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800">
                            <strong>Note:</strong> You will be automatically redirected to the login page in 5 seconds.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        Stay Here
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Log In Again
                    </button>
                </div>
            </div>
        </div>
    );
}
