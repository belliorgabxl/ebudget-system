"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = "success" | "error" | "info";
export type ToastOptions = { id?: string; title?: string; description?: string; timeout?: number };

type Toast = { id: string; type: ToastType; title?: string; description?: string; timeout: number };

const ToastContext = createContext<{
    push: (type: ToastType, title?: string, description?: string, opts?: Partial<ToastOptions>) => void;
}>({ push: () => { } });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const push = useCallback((type: ToastType, title?: string, description?: string, opts?: Partial<ToastOptions>) => {
        const id = opts?.id ?? String(Date.now()) + Math.random().toString(36).slice(2, 7);
        const timeout = opts?.timeout ?? 4000;
        const t: Toast = { id, type, title, description, timeout };
        setToasts((s) => [t, ...s]);

        // auto remove
        setTimeout(() => {
            setToasts((s) => s.filter((x) => x.id !== id));
        }, timeout);
    }, []);

    const remove = useCallback((id: string) => setToasts((s) => s.filter((t) => t.id !== id)), []);

    return (
        <ToastContext.Provider value={{ push }}>
            {children}

            <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md">
                {toasts.map((t, index) => (
                    <div
                        key={t.id}
                        style={{
                            animation: 'slideInRight 0.3s ease-out forwards',
                            animationDelay: `${index * 0.05}s`,
                        }}
                        className={`pointer-events-auto w-full sm:w-[380px] rounded-xl p-4 shadow-2xl border backdrop-blur-sm flex items-start gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                            t.type === "success" 
                                ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200" 
                                : t.type === "error" 
                                ? "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200" 
                                : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                        }`}
                    >
                        <div className={`flex-shrink-0 rounded-full p-1.5 ${
                            t.type === "success" 
                                ? "bg-emerald-100" 
                                : t.type === "error" 
                                ? "bg-rose-100" 
                                : "bg-blue-100"
                        }`}>
                            {t.type === "success" ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : t.type === "error" ? (
                                <AlertCircle className="h-5 w-5 text-rose-600" />
                            ) : (
                                <Info className="h-5 w-5 text-blue-600" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {t.title ? (
                                <div className={`text-sm font-semibold mb-0.5 ${
                                    t.type === "success" 
                                        ? "text-emerald-900" 
                                        : t.type === "error" 
                                        ? "text-rose-900" 
                                        : "text-blue-900"
                                }`}>
                                    {t.title}
                                </div>
                            ) : null}
                            {t.description ? (
                                <div className={`text-xs leading-relaxed ${
                                    t.type === "success" 
                                        ? "text-emerald-700" 
                                        : t.type === "error" 
                                        ? "text-rose-700" 
                                        : "text-blue-700"
                                }`}>
                                    {t.description}
                                </div>
                            ) : null}
                        </div>

                        <button
                            onClick={() => remove(t.id)}
                            className={`flex-shrink-0 rounded-lg p-1.5 transition-all duration-200 ${
                                t.type === "success" 
                                    ? "text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700" 
                                    : t.type === "error" 
                                    ? "text-rose-500 hover:bg-rose-100 hover:text-rose-700" 
                                    : "text-blue-500 hover:bg-blue-100 hover:text-blue-700"
                            }`}
                            aria-label="close toast"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
