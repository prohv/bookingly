import React from 'react';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    variant?: 'danger' | 'success';
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Yes, I want to cancel",
    cancelText = "No, keep it",
    loading = false,
    variant = 'danger'
}: Props) {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100">
                <div className="text-center">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        {isDanger ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                        {message}
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        disabled={loading}
                        onClick={onConfirm}
                        className={`w-full py-4 px-6 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 ${isDanger ? 'bg-slate-900 hover:bg-red-600' : 'bg-slate-900 hover:bg-green-600'}`}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                    <button
                        disabled={loading}
                        onClick={onCancel}
                        className="w-full py-4 px-6 bg-white text-slate-400 rounded-2xl font-bold text-sm hover:text-slate-900 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}
