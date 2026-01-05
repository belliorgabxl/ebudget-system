"use client";

import BackGroundLight from "@/components/background/bg-light";
import Link from "next/link";
import React from "react";

export default function FailedScreenPage() {
  return (
    <BackGroundLight>
      <div className="min-h-screen w-full flex items-center justify-center ">
        <div className="w-full max-w-md z-10">
          <div className="rounded-3xl bg-white border border-rose-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-400" />

            <div className="p-6 sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v4"
                    stroke="currentColor"
                    className="text-rose-600"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 17h.01"
                    stroke="currentColor"
                    className="text-rose-600"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                    stroke="currentColor"
                    className="text-rose-600"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="mt-5 text-center text-xl sm:text-2xl font-semibold text-slate-900">
                ไม่สำเร็จ
              </h1>
              <p className="mt-2 text-center text-sm text-slate-600 leading-6">
                กรุณาลองใหม่อีกครั้งภายหลัง
              </p>
              <div className="mt-5 rounded-2xl  text-center border border-rose-100 bg-rose-50/60 p-4">
                <p className="text-xs font-medium text-rose-700">
                  วันและเวลาทำรายการ
                </p>
                <p className="mt-1 font-mono text-sm text-slate-900">
                  22 ธันวาคม 2025 เวลา 14:35 น.
                </p>

                <div className="mt-3 h-px w-full bg-rose-100" />
              </div>

              <div className="mt-6 flex justify-center items-center gap-3">
                <Link
                  href={"/"}
                  className="rounded-2xl text-center bg-rose-600 w-full py-3 text-sm font-semibold text-white hover:bg-rose-700 transition"
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
