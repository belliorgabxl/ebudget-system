"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { createProject } from "@/api/project.client";

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

        if (!res.ok) {
          throw new Error("Unauthenticated");
        }

        const data = await res.json();

        if (!data.authenticated) {
          throw new Error("Unauthenticated");
        }

        setAuthUser(data.user);
      } catch (err) {
        console.error("auth/me error:", err);
        setAuthUser(undefined);
      }
    };

    loadUser();
  }, []);

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
      organization_id: String(authUser?.org_id) ?? "",
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

      budgets: budget
        ? {
            budget_amount: budget.total,

            budget_items: budget.rows.map((row) => ({
              name: row.item,
              amount: Number(row.amount),
              remark: row.note ?? "",
            })),

            budget_source: budget.sources.source,
            budget_source_department: budget.sources.externalAgency || "",

            fiscal_year: new Date().getFullYear(),

            organization_id: String(authUser?.org_id),

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
              ...(kpi.output ? [{ description: kpi.output }] : []),
              ...(kpi.outcome ? [{ description: kpi.outcome }] : []),
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
      toast.success("สร้างโปรเจ็คสำเร็จ");
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        สร้างโปรเจ็คใหม่
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        กรอกข้อมูลทั้งหมดเพื่อสร้างโปรเจ็ค
      </p>
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
              <GeneralInfoTable onChange={setGeneralInfo} value={generalInfo} />
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
                onChange={(e) => setRetional(e.target.value)}
                value={retaional}
                className="input min-h-[120px] w-full py-1 px-4 rounded-lg border border-gray-300"
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

              <ObjectiveForm value={objective} onChange={setObjective} />
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
              <GoalForm value={goal} onChange={handleGoalChange} />
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
              <KPIForm value={kpi} onChange={handleKpiChange} />
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
              <ExpectForm value={expectation} onChange={handleExpectChange} />
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
          onClick={prev}
          disabled={step === 0}
          className="flex items-center gap-1 text-gray-700 hover:text-gray-900 enabled:hover:bg-slate-200 
          py-1 px-4 rounded-sm disabled:opacity-40"
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
    </main>
  );
}
