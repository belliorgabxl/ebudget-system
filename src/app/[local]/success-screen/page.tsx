"use client";
import BackGroundLight from "@/components/background/bg-light";
import Link from "next/link";
import React from "react";

export default function SuccessScreenPage() {
  return (
    <BackGroundLight>
      <div className="min-h-screen w-ful flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white border border-emerald-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400" />

            <div className="p-6 sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="currentColor"
                    className="text-emerald-600"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="mt-5 text-center text-xl sm:text-2xl font-semibold text-slate-900">
                เสร็จสิ้น
              </h1>
              <p className="mt-2 text-center text-sm text-slate-600 leading-6">
                คลิกเพื่อกลับไปที่หน้าหลัก
              </p>

              <div className="mt-5 rounded-2xl border text-center border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-medium text-emerald-700">
                  วันและเวลาทำรายการ
                </p>
                <p className="mt-1 font-mono text-sm text-slate-900">
                  22 ธันวาคม 2025 เวลา 14:35 น.
                </p>
              </div>
              <div className="mt-6 flex justify-center items-center gap-3">
                <Link
                  href={"/"}
                  className="rounded-2xl text-center bg-emerald-600 w-full py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  กลับหน้าหลัก
                </Link>
              </div>
              <div className="mt-4 text-center text-xs text-slate-400">
                e-Budget School
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackGroundLight>
  );
}
