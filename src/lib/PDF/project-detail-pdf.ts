"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import THSarabunFont from "../Font/THSarabunFont";
import THSarabunFontBold from "../Font/THSarabunBold";
import { ProjectInformationResponse } from "@/dto/projectDto";
import { loadImageAsBase64, toThaiDate } from "../util";
import {
  diffDaysInclusive,
  drawCheckbox,
  drawTick,
  formatBaht,
  mapPlanTypeToThai,
  normThaiKey,
} from "../helper";

function normKey(s?: string) {
  return (s ?? "").toLowerCase().replace(/\s+/g, "").replace(/[_-]/g, "");
}

function mapBudgetSource(src?: string) {
  const k = normKey(src);

  return {
    school: k === "school" || k === "schoolbudget",
    revenue: k === "revenue" || k === "incomerevenue",
    external:
      k === "external" ||
      k === "externalagency" ||
      k === "outside" ||
      k === "outsidesource",
  };
}

export async function ProjectDetailPDF(p: ProjectInformationResponse) {
  const doc = new jsPDF();

  // Fonts
  doc.addFileToVFS("THSarabun.ttf", THSarabunFont);
  doc.addFont("THSarabun.ttf", "THSarabun", "normal");
  doc.addFileToVFS("THSarabunBold.ttf", THSarabunFontBold);
  doc.addFont("THSarabunBold.ttf", "THSarabun", "bold");

  const logoBase64 = await loadImageAsBase64("/ebudget-icon.png");

  const pageWidth = doc.internal.pageSize.getWidth();

  // ===== Page 1 =====
  doc.addImage(logoBase64, "PNG", 3, 2, 20, 20);

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(20);
  doc.text("เอกสารข้อมูลโครงการ", pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(14);
  doc.line(5, 24, 205, 24);
  doc.line(5, 24, 5, 45);
  doc.line(205, 24, 205, 45);
  doc.line(5, 45, 205, 45);

  doc.setFont("THSarabun", "bold");
  doc.text("ชื่อโครงงาน :", 10, 32);
  doc.setFont("THSarabun", "normal");
  doc.text(p.project_name ?? "—", 30, 32);

  doc.setFont("THSarabun", "bold");
  doc.text("ประเภทโครงการ :", 10, 39);
  doc.setFont("THSarabun", "normal");
  doc.text(mapPlanTypeToThai(p.plan_type), 35, 39);

  doc.setFont("THSarabun", "bold");
  doc.text("ระยะเวลา", 70, 39);
  doc.setFont("THSarabun", "normal");
  const days = diffDaysInclusive(p.start_date, p.end_date);
  doc.text(days ? `${days} วัน` : "—", 90, 39);

  doc.setFont("THSarabun", "bold");
  doc.text("ระยะเวลาดำเนินงาน :", 120, 39);

  doc.setFont("THSarabun", "normal");
  const dateRangeText = `${toThaiDate(p.start_date)} - ${toThaiDate(
    p.end_date
  )}`;
  doc.text(dateRangeText, 155, 39);

  doc.line(5, 50, 205, 50);

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(`รายละเอียดโครงการ`, 10, 60);
  doc.setFont("THSarabun", "normal");
  doc.setFontSize(12);
  doc.text("•", 10, 65);
  doc.text(p.project_description ?? "—", 13, 65);

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(`เหตุผลและความจำเป็นของโครงการ`, 10, 75);
  doc.setFont("THSarabun", "normal");
  doc.setFontSize(12);
  doc.text("•", 10, 80);
  doc.text(p.rationale ?? p.project_description ?? "—", 13, 80);

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(`ตัวชี้วัดงานประกันคุณภาพ/ตัวชี้วัดโครงการ`, 10, 92);
  doc.setFont("THSarabun", "normal");
  doc.setFontSize(12);
  const kpis = p.project_kpis ?? [];
  if (kpis.length === 0) {
    doc.text("-", 10, 97);
    doc.text("ไม่มี", 13, 97);
  } else {
    let y = 97;
    for (const k of kpis.slice(0, 3)) {
      doc.text("•", 10, y);
      doc.text(
        `${k.indicator ?? "—"}${k.description ? ` - ${k.description}` : ""}`,
        13,
        y
      );
      y += 5;
    }
  }
  const objectives = (p.project_objectives_and_outcomes ?? []).filter(
    (x) => (x.type ?? "").toLowerCase() === "objective"
  );

  autoTable(doc, {
    startY: 107,
    margin: { left: 5, right: 5 },
    head: [["No.", "วัตถุประสงค์ของโครงการ"]],
    body:
      objectives.length > 0
        ? objectives.map((o, i) => [String(i + 1), o.description ?? "—"])
        : [["1", "—"]],
    styles: {
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 12,
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 14,
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    alternateRowStyles: { fillColor: false },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { cellWidth: "auto" },
    },
  });

  const nextY = (doc as any).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: nextY,
    margin: { left: 5, right: 5 },
    head: [["หัวข้อ", "เป้าหมายของโครงการ"]],
    body: [
      ["เป้าหมายเชิงปริมาณ", p.quantitative_goal ?? "—"],
      ["เป้าหมายเชิงคุณภาพ", p.qualitative_goal ?? "—"],
    ],
    styles: {
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 12,
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 14,
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    alternateRowStyles: { fillColor: false },
    bodyStyles: { fillColor: [255, 255, 255] },
  });

  const nextY2 = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(14);
  doc.text("สถานที่ดำเนินงาน : ", 5, nextY2);
  doc.setFont("THSarabun", "normal");
  doc.text(p.location ?? "—", 35, nextY2);

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(`ตัวชี้วัดผลผลิต (Output Indicators)`, 10, nextY2 + 10);
  doc.setFont("THSarabun", "normal");
  doc.setFontSize(14);
  const output = kpis.slice(0, 1);
  if (output.length === 0) {
    doc.text("-", 10, nextY2 + 17);
    doc.text("ไม่มี", 15, nextY2 + 17);
  } else {
    doc.text("•", 10, nextY2 + 17);
    doc.text(
      `${output[0].indicator ?? "—"}${
        output[0].description ? ` - ${output[0].description}` : ""
      }`,
      15,
      nextY2 + 17
    );
  }

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(`ตัวชี้วัดผลลัพธ์ (Outcome Indicators)`, 10, nextY2 + 27);
  doc.setFont("THSarabun", "normal");
  doc.setFontSize(14);
  const outcome = kpis.slice(1, 2);
  if (outcome.length === 0) {
    doc.text("-", 10, nextY2 + 34);
    doc.text("ไม่มี", 15, nextY2 + 34);
  } else {
    doc.text("•", 10, nextY2 + 34);
    doc.text(
      `${outcome[0].indicator ?? "—"}${
        outcome[0].description ? ` - ${outcome[0].description}` : ""
      }`,
      15,
      nextY2 + 34
    );
  }

  const trackingY = nextY2 + 45;
  const eval0 = (p.project_evaluation ?? [])[0];

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text("การติดตามและประเมินผล", 10, trackingY);

  doc.setFontSize(14);
  doc.text("วิธีการประเมินผล", 10, trackingY + 8);
  doc.setFont("THSarabun", "normal");

  const estimateType = normThaiKey(eval0?.estimate_type);

  drawCheckbox(
    doc,
    10,
    trackingY + 12,
    "แบบสอบถาม",
    estimateType === normThaiKey("แบบสอบถาม")
  );
  drawCheckbox(
    doc,
    50,
    trackingY + 12,
    "สัมภาษณ์",
    estimateType === normThaiKey("สัมภาษณ์")
  );
  drawCheckbox(
    doc,
    90,
    trackingY + 12,
    "สังเกตพฤติกรรม",
    estimateType === normThaiKey("สังเกตพฤติกรรม")
  );
  drawCheckbox(
    doc,
    144,
    trackingY + 12,
    "รายงานผล",
    estimateType === normThaiKey("รายงานผล")
  );

  doc.setFont("THSarabun", "bold");
  doc.text("ผู้รับผิดชอบการประเมินผล :", 10, trackingY + 25);
  doc.setFont("THSarabun", "normal");
  doc.text(p.owner_user ?? "—", 60, trackingY + 25);

  doc.setFont("THSarabun", "bold");
  doc.text("ระยะเวลาการประเมินผล :", 10, trackingY + 32);
  doc.setFont("THSarabun", "normal");
  doc.text(
    `${toThaiDate(eval0?.start_date)} - ${toThaiDate(eval0?.end_date)}`,
    60,
    trackingY + 32
  );

  // ===== Page 2 (งบประมาณ + กิจกรรม + หน่วยงาน) =====
  doc.addPage();

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text("งบประมาณ", 10, 20);

  doc.setFontSize(14);
  doc.text("งบประมาณทั้งหมด :", 10, 30);
  doc.setFont("THSarabun", "normal");
  doc.text(`${formatBaht(p.budget_amount ?? 0)} บาท`, 50, 30);

  doc.setFont("THSarabun", "bold");
  doc.text("แหล่งงบประมาณ", 10, 40);

  doc.setFont("THSarabun", "normal");
  const src = mapBudgetSource(p.budget_source);

  // checkbox sources
  doc.rect(10, 44, 4, 4);
  if (src.school) drawTick(doc, 10, 44);
  doc.text("งบสถานศึกษา", 16, 47);

  doc.rect(50, 44, 4, 4);
  if (src.revenue) drawTick(doc, 50, 44);
  doc.text("เงินรายได้", 56, 47);

  doc.rect(90, 44, 4, 4);
  if (src.external) drawTick(doc, 90, 44);
  doc.text("ภายนอก (ระบุหน่วยงาน)", 96, 47);

  doc.setTextColor(150, 150, 150);
  doc.text(p.budget_source_department ?? "", 96, 54);
  doc.setDrawColor(180, 180, 180);
  doc.line(95, 55, 200, 55);
  doc.setTextColor(0, 0, 0);

  // budget items table
  const budgetItems = p.budget_items ?? [];
  const budgetBody = budgetItems.map((item) => [
    item.name ?? "—",
    formatBaht(item.amount ?? 0),
    item.remark ?? "",
  ]);
  budgetBody.push(["รวม", formatBaht(p.budget_amount ?? 0), ""]);

  autoTable(doc, {
    startY: 65,
    margin: { left: 5, right: 5 },
    head: [["รายการ", "จำนวนเงิน (บาท)", "หมายเหตุ"]],
    body: budgetBody,
    styles: {
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 14,
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 16,
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    alternateRowStyles: { fillColor: false },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 60 },
    },
    tableLineWidth: 0.3,
    tableLineColor: [0, 0, 0],
  });

  const nextBudgetY = (doc as any).lastAutoTable.finalY + 15;

  // ขั้นตอนการดำเนินงานกิจกรรม (จาก progress array)
  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text("ขั้นตอนการดำเนินงานกิจกรรม", 10, nextBudgetY);

  const progressRows = (p.progress ?? []).map((pr, i) => [
    String(pr.sequence_number ?? i + 1),
    pr.description ?? "—",
    `${toThaiDate(pr.start_date)} - ${toThaiDate(pr.end_date)}`,
    pr.responsible_name ?? "—",
  ]);

  autoTable(doc, {
    startY: nextBudgetY + 5,
    margin: { left: 5, right: 5 },
    head: [["ลำดับ", "กิจกรรม", "ระยะเวลา", "ผู้รับผิดชอบ"]],
    body: progressRows.length ? progressRows : [["1", "—", "—", "—"]],
    styles: {
      font: "THSarabun",
      fontStyle: "normal",
      fontSize: 14,
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      font: "THSarabun",
      fontStyle: "bold",
      fontSize: 16,
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    alternateRowStyles: { fillColor: false },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { cellWidth: 85 },
      2: { halign: "center", cellWidth: 50 },
      3: { cellWidth: 50 },
    },
    tableLineWidth: 0.3,
    tableLineColor: [0, 0, 0],
  });

  // หน่วยงาน + ผู้รับผิดชอบ
  const nextOwnerY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont("THSarabun", "bold");
  doc.setFontSize(14);
  doc.text("หน่วยงานที่รับผิดชอบ :", 5, nextOwnerY);
  doc.setFont("THSarabun", "normal");
  doc.text(p.department_name ?? "—", 40, nextOwnerY);

  doc.setFont("THSarabun", "bold");
  doc.text("ผู้รับผิดชอบ :", 5, nextOwnerY + 5);
  doc.setFont("THSarabun", "normal");
  doc.text(p.owner_user ?? "—", 40, nextOwnerY + 5);

  doc.save(`${p.project_name ?? "edudget_projectname"}.pdf`);
}
