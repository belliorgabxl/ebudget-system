"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Save, ListChecks, Briefcase } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import {
  ActivitiesRow,
  BudgetTableValue,
  DateDurationValue,
  EstimateParams,
  ExpectParams,
  GeneralInfoCreateParams,
  GoalParams,
  KPIParams,
  ObjectiveParams,
  RegularWorkTemplate,
  StrategyParams,
  ValidationIssue,
} from "@/dto/projectDto";
import DateDurationSection from "@/components/project/new/DateDurationSection";
import { BudgetTable } from "@/components/project/new/BudgetTable";
import GeneralInfoTable from "@/components/project/new/GeneralInfoTable";
import StrategyForm from "@/components/project/new/StrategyForm";
import { BadgeCreateFormProject } from "@/components/project/Helper";
import GoalForm from "@/components/project/new/GoalForm";
import ActivitiesTable from "@/components/project/new/ActivitiesTable";
import KPIForm from "@/components/project/new/KPIForm";
import EstimateForm from "@/components/project/new/EstimateForm";
import ExpectForm from "@/components/project/new/ExpectForm";
import { CreateProjectPayload } from "@/dto/createProjectDto";
import { AuthUser } from "@/dto/userDto";
import { generateSixDigitCode } from "@/lib/util";
import ObjectiveForm from "@/components/project/new/ObjectiveForm";
import { toast } from "react-toastify";
import { validateStep } from "@/lib/helper";
import { createProject, getRegularWorkTemplates } from "@/api/project.client";

const steps = [
  "ข้อมูลพื้นฐาน",
  "ความสอดคล้องเชิงยุทธศาสตร์",
  "หลักการและเหตุผล",
  "วัตถุประสงค์ของโครงการ",
  "เป้าหมายของโครงการ",
  "ระยะเวลาดำเนินงาน",
  "สถานที่ดำเนินงาน",
  "งบประมาณ",
  "ขั้นตอนการดำเนินงานกิจกรรม",
  "ตัวชี้วัดความสำเร็จ (KPI)",
  "การติดตามและประเมินผล",
  "ผลที่คาดว่าจะได้รับ",
];

export default function CreateProjectPage() {
  const [authUser, setAuthUser] = useState<AuthUser>();
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        console.log("auth/me response status:", res);

        if (!res.ok) {
          throw new Error("Unauthenticated1");
        }

        const data = await res.json();

        if (!data.authenticated) {
          throw new Error("Unauthenticated2");
        }

        // Extract user data from response (route.ts returns flat user object)
        const { authenticated, ...userData } = data;
        setAuthUser(userData);
        console.log("Authenticated user data:", userData);
      } catch (err) {
        console.error("auth/me error:", err);
        setAuthUser(undefined);
      }
    };

    loadUser();
  }, []);

  // Project type selection state: null = not selected yet, "general" = ทั่วไป, "regular" = แผนงานประจำ
  const [projectTypeChoice, setProjectTypeChoice] = useState<"general" | "regular" | null>(null);
  const [regularTemplates, setRegularTemplates] = useState<RegularWorkTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RegularWorkTemplate | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const loadRegularTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const items = await getRegularWorkTemplates();
      setRegularTemplates(items);
    } catch {
      toast.error("โหลดแผนงานประจำไม่สำเร็จ");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // Auto-fill generalInfo when a regular template is selected
  const handleSelectTemplate = (template: RegularWorkTemplate) => {
    setSelectedTemplate(template);
    setGeneralInfo((prev) => ({
      ...prev,
      name: template.name,
      type: template.plan_type || "regular_work",
      description: template.description ?? "",
      department_id: template.department_id ?? prev.department_id,
      owner_user_id: prev.owner_user_id || authUser?.id || "",
    }));
    setEstimate((prev) => ({ ...prev, evaluator: prev.evaluator || authUser?.id || "" }));
    if (template.rationale) setRetional(template.rationale);
    if (template.quantitative_goal || template.qualitative_goal) {
      setGoal({
        quantityGoal: template.quantitative_goal ?? "",
        qualityGoal: template.qualitative_goal ?? "",
      });
    }
  };

  const filteredTemplates = regularTemplates.filter((t) =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const resetFormState = useCallback(() => {
    setGeneralInfo({ name: "", type: "", department_id: "", owner_user_id: "", description: "" });
    setRetional("");
    setGoal({ quantityGoal: "", qualityGoal: "" });
    setBudget(null);
    setKpi({ output: "", outcome: "" });
    setObjective({ results: [{ description: "", type: "objective" }] });
    setExpectation({ results: [{ description: "", type: "expectation" }] });
    setDateDur({ startDate: "", endDate: "", durationMonths: 0 });
    setLocation("");
    setStrategy({ schoolPlan: "", ovEcPolicy: "", qaIndicator: "" });
    setActivity([{ id: 1, activity: "", startDate: "", endDate: "", owner: "" }]);
    setEstimate({ estimateType: "", evaluator: "", startDate: "", endDate: "" });
    setStep(0);
    setFormKey((k) => k + 1);
  }, []);

  // Reset all form state every time the type-selection screen is shown (projectTypeChoice === null)
  useEffect(() => {
    if (projectTypeChoice === null) {
      resetFormState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectTypeChoice]);

  // Auto-fill owner_user_id, department_id from authUser when loaded
  useEffect(() => {
    if (!authUser) return;
    setGeneralInfo((prev) => ({
      ...prev,
      owner_user_id: prev.owner_user_id || authUser.id,
      department_id: prev.department_id || (authUser.department_id ?? ""),
    }));
    setEstimate((prev) => ({
      ...prev,
      evaluator: prev.evaluator || authUser.id,
    }));
  }, [authUser]);

  // setup state
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));

  const showValidationToast = (issues: ValidationIssue[]) => {
    issues.forEach((i) => toast.error(i.message));
  };
  const handleNext = () => {
    const issues = validateStep(step, {
      generalInfo,
      strategy,
      retaional,
      objective,
      goal,
      dateDur,
      location,
      budget,
      activity,
      kpi,
      estimate,
      expectation,
    });

    if (issues.length > 0) {
      showValidationToast(issues);
      return;
    }

    next();
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // general info part
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoCreateParams>({
    name: "",
    type: "",
    department_id: "",
    owner_user_id: "",
    description: "",
  });

  // location
  const [location, setLocation] = useState<string>("");

  const [objective, setObjective] = useState<ObjectiveParams>({
    results: [
      {
        description: "",
        type: "objective",
      },
    ],
  });

  // strategy part
  const [strategy, setStrategy] = useState<StrategyParams>({
    schoolPlan: "",
    ovEcPolicy: "",
    qaIndicator: "",
  });
  const handleStrategyChange = useCallback((v: StrategyParams) => {
    setStrategy(v);
  }, []);

  // retional
  const [retaional, setRetional] = useState<string>("");

  // duration section state
  const [dateDur, setDateDur] = useState<DateDurationValue>({
    startDate: "",
    endDate: "",
    durationMonths: 0,
  });

  // expectation part
  const [expectation, setExpectation] = useState<ExpectParams>({
    results: [
      {
        description: "",
        type: "expectation",
      },
    ],
  });
  const handleExpectChange = useCallback((v: ExpectParams) => {
    setExpectation(v);
  }, []);

  // budget part
  const [budget, setBudget] = useState<BudgetTableValue | null>(null);
  const handleBudgetChange = useCallback((v: BudgetTableValue) => {
    setBudget(v);
  }, []);

  // activity part
  const [activity, setActivity] = useState<ActivitiesRow[]>([
    { id: 1, activity: "", startDate: "", endDate: "", owner: "" },
  ]);
  const handleActivityChange = useCallback(
    (rows: ActivitiesRow[]) => setActivity(rows),
    []
  );

  // expectation part
  const [estimate, setEstimate] = useState<EstimateParams>({
    estimateType: "",
    evaluator: "",
    startDate: "",
    endDate: "",
  });
  const handleEstimateChange = useCallback((v: EstimateParams) => {
    setEstimate(v);
  }, []);

  // goal part
  const [goal, setGoal] = useState<GoalParams>({
    quantityGoal: "",
    qualityGoal: "",
  });
  const handleGoalChange = useCallback((v: GoalParams) => {
    setGoal(v);
  }, []);

  // kpi part
  const [kpi, setKpi] = useState<KPIParams>({
    output: "",
    outcome: "",
  });
  const handleKpiChange = useCallback((v: KPIParams) => {
    setKpi(v);
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const buildCreateProjectPayload = (): CreateProjectPayload => {
    const projectCode = generateSixDigitCode();

    return {
      name: generalInfo.name,
      department_id: generalInfo.department_id,
      organization_id: String(authUser?.organization_id) ?? "",
      owner_user_id: generalInfo.owner_user_id,
      plan_type: generalInfo.type,
      description: generalInfo.description,
      start_date: dateDur.startDate,
      end_date: dateDur.endDate,

      location: location,

      code: projectCode,
      quantitative_goal: goal.quantityGoal,
      qualitative_goal: goal.qualityGoal,
      rationale: retaional,
      updated_by: generalInfo.owner_user_id,
      regular_work_template_id: selectedTemplate?.id ?? undefined,

      budgets: budget
        ? {
            budget_amount: budget.total,

            budget_items: budget.rows.map((row) => ({
              name: row.name,
              amount: Number(row.amount),
              remark: row.remark ?? "",
            })),

            budget_source: budget.sources.source,
            budget_source_department: budget.sources.externalAgency || "",

            fiscal_year: new Date().getFullYear(),

            organization_id: String(authUser?.organization_id),

            plan_number: "",
            status: "draft",

            approved_at: "",
            closed_at: "",
            created_at: "",
            rejected_at: "",
            submitted_at: "",
            updated_at: "",
            updated_by: generalInfo.owner_user_id,
            current_approval_level: 0,
          }
        : undefined,

      project_kpis:
        kpi.output || kpi.outcome
          ? [
              ...(kpi.output
                ? [
                    {
                      id: 0,
                      indicator: "Output",
                      target_value: "",
                      description: kpi.output,
                    },
                  ]
                : []),
              ...(kpi.outcome
                ? [
                    {
                      id: 0,
                      indicator: "Outcome",
                      target_value: "",
                      description: kpi.outcome,
                    },
                  ]
                : []),
            ]
          : undefined,

      project_objective_and_outcomes: [
        ...objective.results
          .filter((item) => item.description.trim() !== "")
          .map((item) => ({
            description: item.description.trim(),
            type: "objective",
          })),
        ...(expectation?.results
          ?.filter((item) => item.description.trim() !== "")
          .map((item) => ({
            description: item.description,
            type: item.type ?? "expectation",
          })) ?? []),
      ],
      project_progress:
        activity
          ?.filter((a) => a.activity.trim() !== "")
          .map((a) => ({
            description: a.activity,
            start_date: a.startDate,
            end_date: a.endDate,
            remarks: "",
            responsible_name: a.owner,
            updated_by: generalInfo.owner_user_id,
          })) ?? undefined,

      project_strategy: [],

      project_qa_indicators: [],
      evaluation: {
        start_date: estimate.startDate,
        end_date: estimate.endDate,
        estimate_type: estimate.estimateType,
        evaluator_user_id: estimate.evaluator,
      },
    };
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = buildCreateProjectPayload();
      const res = await createProject(payload);
      console.log(payload);
      setSuccess(res.message ?? "สร้างโครงการสำเร็จแล้ว");
      toast.success("สร้างโครงการสำเร็จ");
      setTimeout(() => {
        router.push("/success-screen");
      }, 500);
    } catch (err: any) {
      console.error("createProject error:", err);
      setError(err?.message ?? "สร้างโครงการไม่สำเร็จ");
      router.push("/failed-screen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="lg:mx-auto lg:max-w-7xl w-full px-2 lg:px-6 py-0">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1 mt-10">
        สร้างโครงการใหม่
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        กรอกข้อมูลทั้งหมดเพื่อสร้างโครงการ
      </p>

      {/* ── Step 0: Project type selection ── */}
      {projectTypeChoice === null && (
        <AnimatePresence mode="wait">
          <motion.div
            key="type-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => router.back()}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
              </button>
            </div>
            <p className="text-base font-medium text-gray-700">
              เลือกประเภทโครงการที่ต้องการสร้าง
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {/* ทั่วไป */}
              <button
                onClick={() => {
                  resetFormState();
                  setProjectTypeChoice("general");
                  setGeneralInfo({ name: "", type: "project", department_id: authUser?.department_id ?? "", owner_user_id: authUser?.id ?? "", description: "" });
                  setEstimate((prev) => ({ ...prev, evaluator: authUser?.id ?? "" }));
                }}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <Briefcase className="h-10 w-10 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-base font-semibold text-gray-800 group-hover:text-indigo-700">
                  ทั่วไป
                </span>
                <span className="text-xs text-gray-500 text-center">
                  สร้างโครงการใหม่ตามแบบฟอร์มมาตรฐาน
                </span>
              </button>

              {/* แผนงานประจำ */}
              <button
                onClick={() => {
                  resetFormState();
                  setProjectTypeChoice("regular");
                  loadRegularTemplates();
                }}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <ListChecks className="h-10 w-10 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-base font-semibold text-gray-800 group-hover:text-indigo-700">
                  แผนงานประจำ
                </span>
                <span className="text-xs text-gray-500 text-center">
                  เลือกแผนงานประจำที่มีในระบบเพื่อสร้างแผนงบประมาณ
                </span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Step 0.5: Regular template picker ── */}
      {projectTypeChoice === "regular" && selectedTemplate === null && (
        <AnimatePresence mode="wait">
          <motion.div
            key="template-picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => { setProjectTypeChoice(null); setSelectedTemplate(null); setRegularTemplates([]); setTemplateSearch(""); resetFormState(); }}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
              </button>
            </div>
            <p className="text-base font-medium text-gray-700">
              เลือกแผนงานประจำ
            </p>
            <input
              type="text"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="ค้นหาแผนงานประจำ..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            {loadingTemplates ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                ไม่พบแผนงานประจำในระบบ
              </p>
            ) : (
              <ul className="divide-y border rounded-lg overflow-hidden">
                {filteredTemplates.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => handleSelectTemplate(t)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors"
                    >
                      <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                      {t.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Main form (shown after type selection) ── */}
      {(projectTypeChoice === "general" || (projectTypeChoice === "regular" && selectedTemplate !== null)) && (
        <React.Fragment key={formKey}>
          {/* Show selected template badge for regular plan */}
          {projectTypeChoice === "regular" && selectedTemplate && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2 text-sm">
              <ListChecks className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="text-gray-700">
                แผนงานประจำ:{" "}
                <span className="font-semibold text-indigo-700">{selectedTemplate.name}</span>
              </span>
              <button
                onClick={() => { setSelectedTemplate(null); resetFormState(); }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-700"
              >
                เปลี่ยน
              </button>
            </div>
          )}

          <div className="flex items-start gap-2 mb-6">
            {steps.map((label, index) => (
              <div key={index} className="flex-1">
                <div
                  className={`h-2 rounded-full ${
                    index <= step ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
                <p
                  className={`text-[10px] lg:block hidden mt-1 text-center ${
                    index === step ? "text-indigo-700 font-medium" : "text-gray-500"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <GeneralInfoTable
                key={selectedTemplate?.id ?? "default"}
                onChange={setGeneralInfo}
                value={generalInfo}
                lockedFields={projectTypeChoice === "regular" ? ["name" as const, "type" as const, "description" as const, "department_id" as const] : ["type" as const]}
              />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <StrategyForm value={strategy} onChange={handleStrategyChange} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <BadgeCreateFormProject title="หลักการและเหตุผล" />
              <textarea
                onChange={(e) => projectTypeChoice !== "regular" && setRetional(e.target.value)}
                value={retaional}
                readOnly={projectTypeChoice === "regular"}
                className={`input min-h-[120px] w-full py-1 px-4 rounded-lg border ${
                  projectTypeChoice === "regular"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-800 cursor-not-allowed"
                    : "border-gray-300"
                }`}
                placeholder="ระบุหลักการและเหตุผล..."
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              {/* <BadgeCreateFormProject title="วัตถุประสงค์ของโครงการ" />
              <textarea
                onChange={(e) => setObjective(e.target.value)}
                value={objective}
                className="input min-h-[120px] w-full py-1 px-4 rounded-lg border border-gray-300"
                placeholder="ระบุวัตถุประสงค์ของโครงการ..."
              /> */}

              <ObjectiveForm value={objective} onChange={setObjective} locked={false} />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <GoalForm value={goal} onChange={handleGoalChange} locked={projectTypeChoice === "regular" && !!(selectedTemplate?.quantitative_goal || selectedTemplate?.qualitative_goal)} />
            </motion.div>
          )}
          {step === 5 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <DateDurationSection value={dateDur} onChange={setDateDur} />
            </motion.div>
          )}
          {step === 6 && (
            <motion.div
              key="step-7"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <BadgeCreateFormProject title="สถานที่ดำเนินงาน" />
              <textarea
                onChange={(e) => setLocation(e.target.value)}
                value={location}
                className="input min-h-[120px] w-full py-1 px-4 rounded-lg border border-gray-300"
                placeholder="สถานที่ดำเนินงาน..."
              />
            </motion.div>
          )}
          {step === 7 && (
            <motion.div
              key="step-8"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-6"
            >
              <BudgetTable
                value={budget ?? undefined}
                onChange={handleBudgetChange}
              />
            </motion.div>
          )}
          {step === 8 && (
            <motion.div
              key="step-9"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <ActivitiesTable
                value={activity}
                onChange={handleActivityChange}
              />
            </motion.div>
          )}

          {step === 9 && (
            <motion.div
              key="step-10"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <KPIForm value={kpi} onChange={handleKpiChange} locked={false} />
            </motion.div>
          )}
          {step === 10 && (
            <motion.div
              key="step-11"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-6"
            >
              <EstimateForm value={estimate} onChange={handleEstimateChange} />
            </motion.div>
          )}
          {step === 11 && (
            <motion.div
              key="step-12"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <ExpectForm value={expectation} onChange={handleExpectChange} locked={false} />
            </motion.div>
          )}
          {/* {step === 12 && (
            <motion.div
              key="step-13"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <BadgeCreateFormProject title="ข้อเสนอแนะ" />
              <textarea
                className="input min-h-[120px] w-full py-1 px-4 rounded-lg border border-gray-300"
                placeholder="ข้อเสนอแนะ..."
              />
            </motion.div>
          )} */}
          {/* {step === 13 && (
            <motion.div
              key="step-14"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-4"
            >
              <ApproveForm onChange={handleApproveChange} value={approve} />
            </motion.div>
          )} */}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={step === 0 ? () => { setProjectTypeChoice(null); setSelectedTemplate(null); setRegularTemplates([]); setTemplateSearch(""); } : prev}
          className="flex items-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-slate-200 py-1 px-4 rounded-sm"
        >
          <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            ถัดไป <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                handleSubmit();
              }}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300
               bg-green-600 hover:bg-green-700 hover:scale-[102%] duration-300 text-white px-4 py-2 text-sm   "
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 " />
              ) : (
                <Save className="h-4 w-4" />
              )}{" "}
              สร้างและบันทึกโครงงาน
            </button>
          </div>
        )}
      </div>
        </React.Fragment>
      )}
    </main>
  );
}
