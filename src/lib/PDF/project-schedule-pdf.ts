"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import THSarabunFont from "../Font/THSarabunFont";
import THSarabunFontBold from "../Font/THSarabunBold";

const projectMock = {
  project: {
    project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",

    name: "โครงการพัฒนาศักยภาพผู้เรียนด้านดิจิทัล",
    plan_type: "project",
    department: "หน่วยปราบปรามเกย์",
    owner_user: "ราชาเกย์ พ่อตูดหล่อ",

    project_strategy: {
      strategic_plan: "",
    },

    project_qa_indicators: {
      organization_id: "org_1f931b21-55b7-48d1-8fb9-fdf487214321",
      project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",
      qa_indicator_id: "qa_67f70244-b8ad-4f1a-8a7f-e748edcda84e",
    },

    rationale:
      "เพื่อยกระดับทักษะดิจิทัลของผู้เรียนให้เท่าทันเทคโนโลยีในศตวรรษที่ 21",

    project_objective_and_outcomes: [
      {
        project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",
        type: "objective",
        description:
          "ผู้เรียนสามารถใช้เครื่องมือดิจิทัลพื้นฐานในการทำงานและการเรียนรู้",
      },
      {
        project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",
        type: "expectation",
        description: "ผู้เรียนมีความมั่นใจและทักษะด้านเทคโนโลยีเพิ่มขึ้น",
      },
    ],

    quantitative_goal: "ผู้เรียนอย่างน้อย 80% ผ่านการประเมินทักษะดิจิทัล",
    qualitative_goal: "ผู้เรียนมีทัศนคติเชิงบวกต่อการใช้เทคโนโลยีในการเรียนรู้",

    start_date: "2025-01-15",
    end_date: "2025-03-30",

    location: "อาคารเรียนรวม 1 ห้องปฏิบัติการคอมพิวเตอร์",

    budgets: {
      organization_id: "org_1f931b21-55b7-48d1-8fb9-fdf487214321",
      project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",
      budget_amount: 75000,
      budget_source: "school_budget",
      budget_source_department: null,

      budget_items: [
        {
          budget_plan_id: "bp_49da8891-f336-4af1-b2cf-6ea8efc558ea",
          name: "ค่าครุภัณฑ์คอมพิวเตอร์",
          amount: 50000,
          remark: "ซื้ออุปกรณ์ใหม่สำหรับการอบรม",
        },
        {
          budget_plan_id: "bp_49da8891-f336-4af1-b2cf-6ea8efc558ea",
          name: "ค่าอบรมวิทยากร",
          amount: 25000,
          remark: "ค่าตอบแทนวิทยากรภายนอก",
        },
      ],
    },

    project_progress: {
      project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",
      start_date: "2025-01-15",
      end_date: "2025-02-01",
      sequence_number: 1,
      description: "ดำเนินการจัดเตรียมห้องและติดตั้งโปรแกรม",
      responsible_name: "ครูวิทยาการคอมพิวเตอร์",
      remark: "",
    },

    kpi: {
      project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",
      kpi_id: "kpi_102aa29b-f507-407b-8788-6e00e7495910",
    },

    estimate: {
      project_id: "proj_9f2b0b92-7b88-4aa0-9b1a-12cf02d61c11",
      evaluation_user_id: "user_7b6e1e32-27fd-454e-ba26-0f102d25bcc0",
      start_date: "2025-03-01",
      end_date: "2025-03-30",
      estimate_type: "internal_evaluation",
      suggestions:
        "ควรเพิ่มระยะเวลาในการทำกิจกรรมเพื่อให้ผู้เรียนได้ลงมือปฏิบัติมากขึ้น",
    },
  },
};
export function downloadExamplePdf() {
  const doc = new jsPDF();
  doc.addFileToVFS("THSarabun.ttf", THSarabunFont);
  doc.addFont("THSarabun.ttf", "THSarabun", "normal");

  doc.addFileToVFS("THSarabunBold.ttf", THSarabunFontBold);

  doc.addFont("THSarabunBold.ttf", "THSarabun", "bold");

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(20);
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.text("ตัวอย่างเอกสารโครงงาน", pageWidth / 2, 10, {
    align: "center",
  });

  doc.setFontSize(14);
  doc.line(5, 27, 100, 27);

  doc.line(5, 27, 5, 45);
  doc.line(100, 27, 100, 45);

  doc.line(5, 45, 100, 45);

  doc.setFont("THSarabun", "bold");
  doc.text("ชื่อโครงงาน :", 10, 35);

  doc.setFont("THSarabun", "normal");
  doc.text(projectMock.project.name, 30, 35);

  doc.setFont("THSarabun", "bold");
  doc.text("ประเภทโครงการ :", 10, 40);

  doc.setFont("THSarabun", "normal");
  doc.text(projectMock.project.plan_type, 35, 40);
  doc.line(5, 50, 205, 50);

  doc.setFont("THSarabun", "bold");
  doc.text("ระยะเวลาดำเนินงาน :", 120, 32);

  doc.setFont("THSarabun", "normal");
  doc.text("13 พ.ย. 2568 - 1 ม.ค. 2568", 155, 32);

  doc.setFont("THSarabun", "bold");
  doc.text("ระยะเวลา", 120, 37);
  doc.setFont("THSarabun", "normal");
  doc.text("6 วัน", 135, 37);

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(`สอดคล้องกับแผนยุทธศาสตร์ของสถานศึกษา`, 10, 60);
  doc.setFont("THSarabun", "normal");
  doc.setFontSize(14);
  doc.text("•", 10, 65);
  doc.text(
    `แผนยุทธศาสตร์ทะลวงตูดเพื่อเสรีภาพ และ ส่งเสริมทักษะดิจิทัลของผู้เรียน ตามแผนยุทธศาสตร์การพัฒนาคุณภาพการศึกษา.`,
    15,
    65
  );
  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);

  doc.text(
    `สอดคล้องกับนโยบาย / ยุทธศาสตร์ของสำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.)`,
    10,
    75
  );
  doc.setFontSize(14);
  doc.setFont("THSarabun", "normal");
  doc.text("•", 10, 80);
  doc.text(
    `พัฒนากำลังแรงงานคุณภาพตามยุทธศาสตร์การยกระดับอาชีวศึกษาไทยสู่มาตรฐานสากล`,
    15,
    80
  );
  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(
    `สอดคล้องกับตัวชี้วัดงานประกันคุณภาพภายใน(ระบุมาตรฐานและตัวบ่งชี้)`,
    10,
    90
  );
  doc.setFont("THSarabun", "normal");
  doc.setFontSize(14);
  doc.text("-", 10, 95);
  doc.text(`ไม่มี`, 15, 95);

  autoTable(doc, {
    startY: 100,
    margin: { left: 5, right: 5 },

    head: [["No.", "วัตถุประสงค์ของโครงการ"]],
    body: [
      [
        "1",
        "พัฒนาทักษะอาชีพของผู้เรียนให้สามารถประยุกต์ใช้ในสถานประกอบการได้จริง",
      ],
      [
        "2",
        "ส่งเสริมการเรียนรู้เชิงรุกและเพิ่มศักยภาพผู้เรียนให้ทันต่อเทคโนโลยีสมัยใหม่",
      ],
    ],

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

    alternateRowStyles: {
      fillColor: false,
    },

    bodyStyles: {
      fillColor: [255, 255, 255],
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { cellWidth: "auto" },
    },
  });

  const nextY = (doc as any).lastAutoTable.finalY + 10;

  // doc.setFont("THSarabun", "bold");
  // doc.setFontSize(16);
  // doc.text("เป้าหมายของโครงการ", pageWidth / 2, nextY, {
  //   align: "center",
  // });
  doc.setFontSize(14);

  autoTable(doc, {
    startY: nextY,
    margin: { left: 5, right: 5 },

    head: [["หัวข้อ", "เป้าหมายของโครงการ"]],
    body: [
      [
        "เป้าหมายเชิงปริมาณ",
        "พัฒนาทักษะอาชีพของผู้เรียนให้สามารถประยุกต์ใช้ในสถานประกอบการได้จริง",
      ],
      [
        "เป้าหมายเชิงคุณภาพ",
        "ส่งเสริมการเรียนรู้เชิงรุกและเพิ่มศักยภาพผู้เรียนให้ทันต่อเทคโนโลยีสมัยใหม่",
      ],
    ],

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
    alternateRowStyles: {
      fillColor: false,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
  });

  const nextY2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("THSarabun", "bold");
  doc.text("สถานที่ดำเนินงาน : ", 5, nextY2);
  doc.setFont("THSarabun", "normal");
  doc.text("โรงเรียนเตรียมชายแท้ให้เป็นเกย์", 35, nextY2);

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);

  doc.text(`ตัวชี้วัดผลผลิต (Output Indicators)`, 10, nextY2 + 10);
  doc.setFontSize(14);
  doc.setFont("THSarabun", "normal");
  doc.text("•", 10, nextY2 + 17);
  doc.text(
    `พัฒนากำลังแรงงานคุณภาพตามยุทธศาสตร์การยกระดับอาชีวศึกษาไทยสู่มาตรฐานสากล`,
    15,
    nextY2 + 17
  );

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text(`ตัวชี้วัดผลลัพธ์ (Outcome Indicators)`, 10, nextY2 + 27);
  doc.setFontSize(14);
  doc.setFont("THSarabun", "normal");
  doc.text("•", 10, nextY2 + 34);
  doc.text(
    `พัฒนากำลังแรงงานคุณภาพตามยุทธศาสตร์การยกระดับอาชีวศึกษาไทยสู่มาตรฐานสากล`,
    15,
    nextY2 + 34
  );

  const trackingY = nextY2 + 45;

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text("การติดตามและประเมินผล", 10, trackingY);

  doc.setFontSize(14);
  doc.text("วิธีการประเมินผล", 10, trackingY + 8);
  doc.setFont("THSarabun", "normal");
  // Checkbox 1 — แบบสอบถาม
  doc.rect(10, trackingY + 12, 4, 4);
  doc.text("แบบสอบถาม", 16, trackingY + 15);

  // Checkbox 2 — สัมภาษณ์
  doc.rect(50, trackingY + 12, 4, 4);
  doc.text("สัมภาษณ์", 56, trackingY + 15);

  // Checkbox 3 — สังเกตพฤติกรรม
  doc.rect(90, trackingY + 12, 4, 4);
  doc.text("สังเกตพฤติกรรม", 96, trackingY + 15);

  // Checkbox 4 — รายงานผล
  doc.rect(144, trackingY + 12, 4, 4);
  doc.text("รายงานผล", 150, trackingY + 15);

  doc.setFont("THSarabun", "bold");
  doc.text("ผู้รับผิดชอบการประเมินผล :", 10, trackingY + 25);

  doc.setFont("THSarabun", "normal");
  doc.text("ครูวิทยาการคอมพิวเตอร์", 60, trackingY + 25);

  doc.setFont("THSarabun", "bold");
  doc.text("ระยะเวลาการประเมินผล :", 10, trackingY + 32);

  doc.setFont("THSarabun", "normal");
  doc.text("พ.ย. 68 - ก.พ. 69", 60, trackingY + 32);

  doc.setFont("THSarabun", "bold");
  doc.text("วิธีการประเมินผล", 10, trackingY + 8);

  doc.addPage();

  const formatBaht = (amount: number) =>
    amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalBudget = projectMock.project.budgets.budget_amount;

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text("งบประมาณ", 10, 20);

  doc.setFontSize(14);
  doc.text("งบประมาณทั้งหมด :", 10, 30);
  doc.setFont("THSarabun", "normal");
  doc.text(`${formatBaht(totalBudget)} บาท`, 50, 30);

  doc.setFont("THSarabun", "bold");
  doc.text("แหล่งงบประมาณ", 10, 40);

  doc.setFont("THSarabun", "normal");

  doc.rect(10, 44, 4, 4);
  doc.text("งบสถานศึกษา", 16, 47);

  doc.rect(50, 44, 4, 4);
  doc.text("เงินรายได้", 56, 47);

  doc.rect(90, 44, 4, 4);
  doc.text("ภายนอก (ระบุหน่วยงาน)", 96, 47);

  doc.setFont("THSarabun", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("เช่น กระทรวงศึกษา", 96, 54);
  doc.setDrawColor(180, 180, 180);
  doc.line(95, 55, 200, 55);
  doc.setTextColor(0, 0, 0);

  const budgetItems = projectMock.project.budgets.budget_items;

  const budgetBody = budgetItems.map((item) => [
    item.name,
    formatBaht(item.amount),
    item.remark ?? "",
  ]);

  budgetBody.push(["รวม", formatBaht(totalBudget), ""]);

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

    alternateRowStyles: {
      fillColor: false,
    },

    bodyStyles: {
      fillColor: [255, 255, 255],
    },

    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 60 },
    },

    tableLineWidth: 0.3,
    tableLineColor: [0, 0, 0],
  });

  const nextBudgetY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFont("THSarabun", "bold");
  doc.setFontSize(16);
  doc.text("ขั้นตอนการดำเนินงานกิจกรรม", 10, nextBudgetY);

  const activityRows = [
    ["1", "ระบุกิจกรรม", "เช่น 1 ต.ค. 68 - 15 ต.ค. 68", "ชื่อผู้รับผิดชอบ"],
  ];

  autoTable(doc, {
    startY: nextBudgetY + 5,
    margin: { left: 5, right: 5 },

    head: [["ลำดับ", "กิจกรรม", "ระยะเวลา", "ผู้รับผิดชอบ"]],
    body: activityRows,

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

    alternateRowStyles: {
      fillColor: false,
    },

    bodyStyles: {
      fillColor: [255, 255, 255],
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { cellWidth: 80 },
      2: { halign: "center", cellWidth: 50 },
      3: { cellWidth: 50 },
    },

    tableLineWidth: 0.3,
    tableLineColor: [0, 0, 0],
  });

  doc.setFontSize(14);
  const nextOwenerY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont("THSarabun", "bold");
  doc.text("หน่วยงานที่รับผิดชอบ :", 5, nextOwenerY);

  doc.setFont("THSarabun", "normal");
  doc.text(projectMock.project.department, 40, nextOwenerY);

  doc.setFont("THSarabun", "bold");
  doc.text("ผู้รับผิดชอบ :", 5, nextOwenerY+5);

  doc.setFont("THSarabun", "normal");
  doc.text(projectMock.project.owner_user, 40, nextOwenerY+5);
  doc.save("example_ebudget.pdf");
}

