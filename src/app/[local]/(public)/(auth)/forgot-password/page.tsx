"use client";

import { useState } from "react";
import SciFiBackgroundNormal from "@/components/background/bg-normal";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        setSubmitted(true);
        setLoading(false);
    };
    return (
        <div className="min-h-[100dvh] w-full">
            <SciFiBackgroundNormal>
                <main className="flex min-h-[100dvh] items-center justify-center px-4">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-md rounded-3xl border border-indigo-200/50 bg-white/80 backdrop-blur-lg shadow-[0_10px_40px_rgba(99,102,241,0.15)] p-8 space-y-5"
                    >
                        <div className="text-center space-y-1">
                            <h1 className="text-2xl font-semibold text-slate-800">ลืมรหัสผ่าน</h1>
                            <p className="text-sm text-slate-600">
                                ใส่อีเมลของคุณ แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้ (Mock)
                            </p>
                        </div>

                        {!submitted ? (
                            <>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        อีเมล
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-2 w-full rounded-xl border border-indigo-300/60 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="group relative inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 px-4 text-sm font-medium text-white shadow transition active:scale-[0.99] disabled:opacity-80"
                                >
                                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 opacity-0 transition group-hover:opacity-100" />
                                    <span className="relative">
                                        {loading ? "กำลังส่งลิงก์…" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                                    </span>
                                </button>
                            </>
                        ) : (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                ส่งคำขอรีเซ็ตรหัสผ่านไปยัง <b>{email}</b>
                            </div>
                        )}

                        <div className="pt-2 text-center text-sm">
                            <a href="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                                กลับไปหน้าเข้าสู่ระบบ
                            </a>
                        </div>
                    </form>
                </main>
            </SciFiBackgroundNormal>
        </div>
    );
}
