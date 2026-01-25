"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

type AnnualBudgetModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { year: string; maxBudget: number }) => void
  initialData?: { year: string; maxBudget: number }
  existingYears: string[]
}

export function AnnualBudgetModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingYears,
}: AnnualBudgetModalProps) {
  const [year, setYear] = useState("")
  const [maxBudget, setMaxBudget] = useState("")
  const [errors, setErrors] = useState<{ year?: string; maxBudget?: string }>(
    {}
  )

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setYear(initialData.year)
        setMaxBudget(initialData.maxBudget.toString())
      } else {
        setYear("")
        setMaxBudget("")
      }
      setErrors({})
    }
  }, [isOpen, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: { year?: string; maxBudget?: string } = {}

    if (!year.trim()) {
      newErrors.year = "กรุณากรอกปีงบประมาณ"
    } else if (!/^\d{4}$/.test(year)) {
      newErrors.year = "กรุณากรอกปีงบประมาณเป็นตัวเลข 4 หลัก"
    } else if (
      !initialData &&
      existingYears.includes(year)
    ) {
      newErrors.year = "ปีงบประมาณนี้มีอยู่ในระบบแล้ว"
    }

    if (!maxBudget.trim()) {
      newErrors.maxBudget = "กรุณากรอกงบประมาณสูงสุด"
    } else if (isNaN(Number(maxBudget)) || Number(maxBudget) <= 0) {
      newErrors.maxBudget = "กรุณากรอกงบประมาณเป็นตัวเลขที่มากกว่า 0"
    } else if (Number(maxBudget) > 1000000000000) {
      newErrors.maxBudget = "งบประมาณสูงเกินกว่าที่กำหนด (สูงสุด 1,000,000 ล้าน)"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Save
    onSave({
      year: year.trim(),
      maxBudget: Number(maxBudget),
    })

    // Reset
    setYear("")
    setMaxBudget("")
    setErrors({})
  }

  const handleClose = () => {
    setYear("")
    setMaxBudget("")
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? "แก้ไขงบประมาณประจำปี" : "เพิ่มงบประมาณประจำปี"}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 space-y-6">
              {/* Year Input */}
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ปีงบประมาณ (พ.ศ.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="เช่น 2568"
                  disabled={!!initialData}
                  className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.year
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  } ${initialData ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  maxLength={4}
                />
                {errors.year && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.year}</p>
                )}
              </div>

              {/* Budget Input */}
              <div>
                <label
                  htmlFor="maxBudget"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  งบประมาณสูงสุด (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="maxBudget"
                  value={maxBudget}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    setMaxBudget(value)
                  }}
                  placeholder="เช่น 20000000"
                  className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.maxBudget
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {errors.maxBudget && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.maxBudget}
                  </p>
                )}
                {maxBudget && !errors.maxBudget && (
                  <p className="mt-1.5 text-sm text-gray-500">
                    {Number(maxBudget).toLocaleString("th-TH")} บาท
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-sm text-blue-800">
                  <strong>หมายเหตุ:</strong> งบประมาณที่ตั้งไว้จะถูกใช้ในการคำนวณงบประมาณคงเหลือของแต่ละปี
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                {initialData ? "บันทึกการแก้ไข" : "เพิ่มงบประมาณ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
