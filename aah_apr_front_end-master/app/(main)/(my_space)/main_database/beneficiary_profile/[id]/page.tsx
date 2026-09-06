"use client";

import SessionsPage from "@/components/global/BnfProfileTest";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import MealToolForm from "@/components/global/MealToolForm";
import SubHeader from "@/components/global/SubHeader";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Tabs, TabsContent } from "@/components/ui/tabs";

import { Textarea } from "@/components/ui/textarea";

import { useParentContext } from "@/contexts/ParentContext";

import { MainDatabaseBeneficiaryProfileInterface } from "@/interfaces/Interfaces";

import {
  BeneficiaryEvaluationSubmitButtonMessage,
  MealToolDeleteButtonMessage,
} from "@/constants/ConfirmationModelsTexts";

import { BeneficiaryEvaluationDefault } from "@/constants/FormsDefaultValues";

import { clientSatisfactionOptions } from "@/constants/SingleAndMultiSelectOptionsList";

import { withPermission } from "@/lib/withPermission";

import {
  BeneficiaryEvaluationType,
  MainDatabaseBeneficiaryProfileInfoType,
  MainDatabaseProgram,
} from "@/types/Types";

import { use, useEffect, useState } from "react";

import ChromeTabs from "@/app/(main)/projects/Components/ChromeTab";

import { IsIdFeild } from "@/constants/Constants";

import {
  Activity,
  CalendarDays,
  Check,
  ClipboardCheck,
  Edit,
  HeartHandshake,
  Info,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Utensils,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Session = {
  id: number | null;
  group: string | null;
  session: string;
  date: string;
  topic: string;
};

type Dessaggregation = {
  id: string;
  description: string;
};

type IndicatorState = {
  id: number;
  indicatorRef: string;
  type: string;
  sessions: Session[];
  dessaggregations: Dessaggregation[];
};

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const clientEvaluationOptions = [
  "New information",
  "Time and place to relax",
  "Learning new practice",
  "Improve wellbeing",
  "A listing space",
  "Improve Mother-child bonding",
  "Meet other people",
  "Other, specify",
  "Avoid isolation",
  "Sharing experience",
  "Quiet and safe place",
];

const dischargeOptions = [
  "PSS cycle completed",
  "Improved wellbeing",
  "No longer interested",
  "Other child(ren) at home",
  "Referral",
  "Husband/family not granting permission",
  "No improvement",
  "Non-attendance",
  "Other, specify",
  "Displacement",
  "Workload",
  "Insecurity",
  "Death of Child",
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const formatLabel = (value: string) => {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

// -----------------------------------------------------------------------------
// Reusable UI
// -----------------------------------------------------------------------------

const InfoItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: unknown;
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <div
      className="
        group rounded-xl border border-border/60
        bg-card p-4
        transition-all duration-200
        hover:border-emerald-500/30
        hover:bg-emerald-50/20
        hover:shadow-sm
        dark:hover:bg-emerald-500/5
      "
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        )}

        <span>{label}</span>
      </div>

      <div
        className="
          mt-2 truncate
          text-sm font-semibold
          text-foreground
        "
        title={formatValue(value)}
      >
        {formatValue(value)}
      </div>
    </div>
  );
};

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) => {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-lg
          bg-emerald-50
          text-emerald-600
          ring-1 ring-emerald-600/10
          dark:bg-emerald-500/10
          dark:text-emerald-400
        "
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>

        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

const BooleanBadge = ({ value }: { value: boolean }) => {
  return value ? (
    <Badge
      variant="outline"
      className="
        gap-1.5
        border-emerald-200
        bg-emerald-50
        text-emerald-700
        dark:border-emerald-800
        dark:bg-emerald-500/10
        dark:text-emerald-400
      "
    >
      <Check className="h-3 w-3" />
      Active
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="
        gap-1.5
        border-muted
        bg-muted/50
        text-muted-foreground
      "
    >
      <X className="h-3 w-3" />
      Inactive
    </Badge>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => {
  return (
    <div
      className="
        flex min-h-[240px]
        flex-col items-center justify-center
        rounded-xl border border-dashed
        border-border/70
        bg-muted/20
        px-6 text-center
      "
    >
      <div
        className="
          flex h-12 w-12 items-center justify-center
          rounded-full
          bg-muted
          text-muted-foreground
        "
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

const BeneficiaryProfilePage: React.FC<
  MainDatabaseBeneficiaryProfileInterface
> = (params: MainDatabaseBeneficiaryProfileInterface) => {
  const { id } = use(params.params);

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [beneficiaryInfo, setBeneficiaryInfo] =
    useState<MainDatabaseBeneficiaryProfileInfoType>();

  const [evaluationForm, setEvaluationForm] =
    useState<BeneficiaryEvaluationType>(BeneficiaryEvaluationDefault());

  const [programInfo, setProgramInfo] = useState<MainDatabaseProgram[]>();

  const [mealTools, setMealTools] = useState<any[]>([]);

  const [reqForMealToolForm, setReqForMealToolForm] = useState(false);

  const [mealToolId, setMealToolId] = useState<number | null>(null);

  const [reqForMealToolEditForm, setReqForMealToolEditForm] = useState(false);

  const [currentTab, setCurrentTab] = useState("beneficiaryInfo");

  const [indicators, setIndicators] = useState<IndicatorState[]>([]);

  const [loading, setLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState<number | false>(false);

  // ---------------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------------

  const individualSessions = indicators.reduce(
    (total, indicator) =>
      total +
      indicator.sessions.filter((session) => session.group === null).length,
    0
  );

  const groupSessions = indicators.reduce(
    (total, indicator) =>
      total +
      indicator.sessions.filter((session) => session.group !== null).length,
    0
  );

  // ---------------------------------------------------------------------------
  // Form handlers
  // ---------------------------------------------------------------------------

  const handleEvaluationFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setEvaluationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleArrayValue = (
    field: "clientSessionEvaluation" | "dischargeReason",
    value: string
  ) => {
    setEvaluationForm((prev) => {
      const current = prev[field];

      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleSubmitEvaluationForm = (e: React.FormEvent) => {
    e.preventDefault();

    const hasError = Object.values(evaluationForm).some(
      (value) =>
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0)
    );

    if (hasError) {
      reqForToastAndSetMessage("Please fill all the fields!", "warning");

      return;
    }

    requestHandler()
      .post(`main_db/beneficiary/evaluation/${id}`, {
        evaluation: evaluationForm,
      })
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Unable to save evaluation.",
          "error"
        );
      });
  };

  const handleDeleteMealtool = (index: number, mealToolId: number | null) => {
    if (!mealToolId) {
      setMealTools((prev) => prev.filter((_, i) => i !== index));

      return;
    }

    setDeleteLoading(mealToolId);

    requestHandler()
      .delete(`/main_db/beneficiary/mealtool/${mealToolId}`)
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");

        setMealTools((prev) => prev.filter((_, i) => i !== index));
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Unable to delete meal tool.",
          "error"
        );
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  // ---------------------------------------------------------------------------
  // Fetch beneficiary + program
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [beneficiaryResponse, programResponse] = await Promise.all([
          requestHandler().get(`/main_db/beneficiary/${id}`),
          requestHandler().get(`main_db/program/${id}`),
        ]);

        if (!mounted) return;

        if (beneficiaryResponse.data.status) {
          setBeneficiaryInfo(beneficiaryResponse.data.data);
        }

        if (programResponse.data.status) {
          setProgramInfo(programResponse.data.data);
        }
      } catch (error: any) {
        if (!mounted) return;

        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "Unable to load beneficiary information.",
          "error"
        );
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ---------------------------------------------------------------------------
  // Fetch meal tools
  // ---------------------------------------------------------------------------

  useEffect(() => {
    requestHandler()
      .get(`main_db/beneficiary/mealtool/${id}`)
      .then((response: any) => {
        if (response.data?.data) {
          setMealTools(
            Array.isArray(response.data.data)
              ? response.data.data
              : [response.data.data]
          );
        }
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Unable to load meal tools.",
          "error"
        );
      });
  }, [id]);

  // ---------------------------------------------------------------------------
  // Fetch evaluation
  // ---------------------------------------------------------------------------

  useEffect(() => {
    requestHandler()
      .get(`main_db/beneficiary/evaluation/${id}`)
      .then((response: any) => {
        if (response.data?.data) {
          setEvaluationForm(response.data.data);
        }
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Unable to load evaluation.",
          "error"
        );
      });
  }, [id]);

  // ---------------------------------------------------------------------------
  // Fetch indicators
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setLoading(true);

    requestHandler()
      .get(`/main_db/indicators/${id}`)
      .then((response: any) => {
        const mapped = (response.data?.data ?? []).map((ind: any) => ({
          id: ind.id,
          indicatorRef: ind.indicatorRef,
          type: ind.type,

          sessions: (ind.sessions ?? []).map((session: any) => ({
            id: session.id,
            group: session.group,
            session: session.session,
            date: session.date,
            topic: session.topic,
          })),

          dessaggregations: (ind.dessaggregations ?? []).map((d: any) => ({
            id: d.id,
            description: d.description,
          })),
        }));

        setIndicators(mapped);
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error fetching indicators.",
          "error"
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-full min-h-0 w-full flex-col p-2">
      <Navbar14 />

      <div className="my-2">
        <BreadcrumbWithCustomSeparator />
      </div>

      <SubHeader pageTitle="Beneficiary Profile" />

      {/* ------------------------------------------------------------------ */}
      {/* Profile Header                                                     */}
      {/* ------------------------------------------------------------------ */}

      <Card
        className="
          mt-4 overflow-hidden
          rounded-2xl
          border-border/60
          shadow-sm
        "
      >
        <CardContent className="p-0">
          <div
            className="
              relative overflow-hidden
              bg-gradient-to-r
              from-emerald-50
              via-background
              to-background
              px-6 py-5
              dark:from-emerald-500/10
            "
          >
            <div
              className="
                absolute -right-16 -top-20
                h-48 w-48 rounded-full
                bg-emerald-500/5
              "
            />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex h-14 w-14 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-emerald-600
                    text-white
                    shadow-sm
                  "
                >
                  <UserRound className="h-6 w-6" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-bold tracking-tight">
                      Beneficiary Profile
                    </h1>

                    <Badge
                      variant="outline"
                      className="
                        border-emerald-200
                        bg-emerald-50
                        text-emerald-700
                        dark:border-emerald-800
                        dark:bg-emerald-500/10
                        dark:text-emerald-400
                      "
                    >
                      Active Record
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Beneficiary ID:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {id}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 sm:flex">
                  <Activity className="h-4 w-4 text-emerald-600" />

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Sessions
                    </p>

                    <p className="text-sm font-semibold">
                      {individualSessions + groupSessions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Tabs                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="mt-4 min-h-0 flex-1">
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="flex h-full min-h-0 flex-col"
        >
          <ChromeTabs
            currentTab={currentTab}
            onCurrentTabChange={setCurrentTab}
            initialTabs={[
              {
                value: "beneficiaryInfo",
                title: "Beneficiary",
              },
              {
                value: "activity",
                title: "Activity",
                hoverTitle:
                  `Individual sessions: ${individualSessions}\n` +
                  `Group sessions: ${groupSessions}`,
              },
              {
                value: "mealtool",
                title: "Meal Tools",
                hoverTitle: `Number of meal tools: ${mealTools.length}`,
              },
              {
                value: "evaluation",
                title: "Evaluation",
              },
            ]}
          />

          {/* ================================================================ */}
          {/* BENEFICIARY                                                      */}
          {/* ================================================================ */}

          <TabsContent value="beneficiaryInfo" className="mt-3 min-h-0 flex-1">
            <Card className="h-full overflow-auto rounded-2xl border-border/60 shadow-sm">
              <CardContent className="space-y-8 p-5 sm:p-6">
                {/* Beneficiary information */}

                <section className="space-y-4">
                  <SectionHeader
                    icon={UserRound}
                    title="Beneficiary Information"
                    description="Personal and registration information."
                  />

                  {beneficiaryInfo ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {Object.entries(beneficiaryInfo).map(([key, value]) => {
                        if (IsIdFeild(key)) return null;

                        return (
                          <InfoItem
                            key={key}
                            label={formatLabel(key)}
                            value={value}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="
                              h-[74px]
                              animate-pulse
                              rounded-xl
                              bg-muted/40
                            "
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Divider */}

                <div className="h-px bg-border/60" />

                {/* Program information */}

                <section className="space-y-4">
                  <SectionHeader
                    icon={ShieldCheck}
                    title="Program Information"
                    description="Programs and services associated with this beneficiary."
                  />

                  {programInfo ? (
                    <div className="space-y-4">
                      {programInfo.map((program, index) => (
                        <div
                          key={index}
                          className="
                            rounded-xl
                            border border-border/60
                            bg-muted/10
                            p-4
                          "
                        >
                          <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-background ring-1 ring-border">
                              <HeartHandshake className="h-3.5 w-3.5 text-emerald-600" />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Program {index + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {Object.entries(program).map(([key, value]) => (
                              <InfoItem
                                key={key}
                                label={formatLabel(key)}
                                value={value}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="
                              h-[74px]
                              animate-pulse
                              rounded-xl
                              bg-muted/40
                            "
                        />
                      ))}
                    </div>
                  )}
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================================================================ */}
          {/* ACTIVITY                                                         */}
          {/* ================================================================ */}

          <TabsContent value="activity" className="mt-3 min-h-0 flex-1">
            <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-border/60 shadow-sm">
              <CardHeader className="border-b bg-muted/10 px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <SectionHeader
                    icon={Activity}
                    title="Beneficiary Activity"
                    description="Sessions and service delivery history."
                  />

                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {groupSessions} Group
                    </Badge>

                    <Badge variant="secondary" className="gap-1.5">
                      <UserRound className="h-3.5 w-3.5" />
                      {individualSessions} Individual
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-4">
                <SessionsPage
                  indicatorStateSetter={setIndicators}
                  indicators={indicators}
                  isLoading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================================================================ */}
          {/* MEAL TOOLS                                                       */}
          {/* ================================================================ */}

          <TabsContent value="mealtool" className="mt-3 min-h-0 flex-1">
            <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 px-5 py-4">
                <SectionHeader
                  icon={Utensils}
                  title="Meal Tools"
                  description={`${mealTools.length} meal tool${
                    mealTools.length === 1 ? "" : "s"
                  } recorded`}
                />

                <Button
                  size="sm"
                  onClick={() => setReqForMealToolForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Meal Tool
                </Button>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-4">
                {mealTools.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-2">
                    {mealTools.map((tool, index) => (
                      <AccordionItem
                        key={tool.id ?? index}
                        value={`meal-tool-${index}`}
                        className="
                          overflow-hidden
                          rounded-xl
                          border border-border/60
                          px-4
                          data-[state=open]:border-emerald-500/30
                        "
                      >
                        <AccordionTrigger className="py-4 hover:no-underline">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-lg
                                bg-emerald-50
                                text-emerald-600
                                dark:bg-emerald-500/10
                                dark:text-emerald-400
                              "
                            >
                              <Utensils className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 text-left">
                              <p className="truncate text-sm font-semibold">
                                {tool.type || "Meal Tool"}
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {tool.baselineDate
                                  ? `Baseline: ${tool.baselineDate}`
                                  : "No baseline date"}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pb-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <InfoItem
                              label="Baseline Date"
                              value={tool.baselineDate}
                              icon={CalendarDays}
                            />

                            <InfoItem
                              label="Endline Date"
                              value={tool.endlineDate}
                              icon={CalendarDays}
                            />

                            <InfoItem
                              label="Baseline Score"
                              value={tool.baselineTotalScore}
                            />

                            <InfoItem
                              label="Endline Score"
                              value={tool.endlineTotalScore}
                            />

                            <InfoItem
                              label="Improvement"
                              value={tool.improvementPercentage}
                            />

                            <div className="rounded-xl border border-border/60 bg-card p-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Baseline Status
                              </p>

                              <div className="mt-2">
                                <BooleanBadge
                                  value={Boolean(tool.isBaselineActive)}
                                />
                              </div>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-card p-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Endline Status
                              </p>

                              <div className="mt-2">
                                <BooleanBadge
                                  value={Boolean(tool.isEndlineActive)}
                                />
                              </div>
                            </div>

                            <InfoItem label="Baseline" value={tool.baseline} />

                            <InfoItem label="Endline" value={tool.endline} />

                            <InfoItem
                              label="Evaluation"
                              value={tool.evaluation}
                            />
                          </div>

                          <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                setMealToolId(tool.id);
                                setReqForMealToolEditForm(true);
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              disabled={deleteLoading === tool.id}
                              onClick={() =>
                                reqForConfirmationModelFunc(
                                  MealToolDeleteButtonMessage,
                                  () => handleDeleteMealtool(index, tool.id)
                                )
                              }
                            >
                              {deleteLoading === tool.id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <EmptyState
                    icon={Utensils}
                    title="No meal tools yet"
                    description="No meal tool has been recorded for this beneficiary."
                    action={
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setReqForMealToolForm(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Meal Tool
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================================================================ */}
          {/* EVALUATION                                                       */}
          {/* ================================================================ */}

          <TabsContent value="evaluation" className="mt-3 min-h-0 flex-1">
            <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-border/60 shadow-sm">
              <CardHeader className="border-b bg-muted/10 px-5 py-4">
                <SectionHeader
                  icon={ClipboardCheck}
                  title="Beneficiary Evaluation"
                  description="Record client feedback, satisfaction and discharge information."
                />
              </CardHeader>

              <CardContent className="min-h-0 flex-1 overflow-auto p-5 sm:p-6">
                <div className="mx-auto max-w-6xl space-y-8">
                  {/* -------------------------------------------------------- */}
                  {/* Client evaluation                                        */}
                  {/* -------------------------------------------------------- */}

                  <section className="rounded-xl border border-border/60 bg-card p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <HeartHandshake className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">
                          Evaluation of the Client
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          What did the client gain from the session?
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 max-w-xs">
                      <Label
                        htmlFor="eval-date"
                        className="mb-2 block text-xs font-medium"
                      >
                        Date
                      </Label>

                      <Input
                        id="eval-date"
                        name="date"
                        value={evaluationForm.date}
                        type="date"
                        onChange={handleEvaluationFormChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {clientEvaluationOptions.map((item) => (
                        <label
                          key={item}
                          htmlFor={`client-${item}`}
                          className="
                              flex cursor-pointer
                              items-center gap-3
                              rounded-lg
                              border border-transparent
                              px-3 py-2.5
                              transition-colors
                              hover:bg-muted/60
                            "
                        >
                          <Checkbox
                            id={`client-${item}`}
                            checked={evaluationForm.clientSessionEvaluation.includes(
                              item
                            )}
                            onCheckedChange={() =>
                              toggleArrayValue("clientSessionEvaluation", item)
                            }
                          />

                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>

                    <Textarea
                      placeholder="If other, please specify..."
                      className="mt-4 resize-none"
                      name="otherClientSessionEvaluation"
                      value={evaluationForm.otherClientSessionEvaluation}
                      onChange={handleEvaluationFormChange}
                      rows={3}
                    />
                  </section>

                  {/* -------------------------------------------------------- */}
                  {/* Satisfaction                                             */}
                  {/* -------------------------------------------------------- */}

                  <section className="rounded-xl border border-border/60 bg-card p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <HeartHandshake className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">
                          Client Satisfaction
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          How satisfied was the client?
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 max-w-xs">
                      <Label
                        htmlFor="sat-date"
                        className="mb-2 block text-xs font-medium"
                      >
                        Date
                      </Label>

                      <Input
                        id="sat-date"
                        type="date"
                        name="satisfactionDate"
                        value={evaluationForm.satisfactionDate}
                        onChange={handleEvaluationFormChange}
                      />
                    </div>

                    <RadioGroup
                      value={evaluationForm.clientSatisfaction}
                      onValueChange={(value) =>
                        setEvaluationForm((prev) => ({
                          ...prev,
                          clientSatisfaction: value,
                        }))
                      }
                      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
                    >
                      {clientSatisfactionOptions.map((option) => (
                        <label
                          key={option.label}
                          htmlFor={`satisfaction-${option.label}`}
                          className="
                              flex cursor-pointer
                              flex-col items-center
                              justify-center
                              gap-2
                              rounded-xl
                              border
                              p-4
                              transition-all
                              hover:border-emerald-500/40
                              hover:bg-emerald-50/30
                              data-[selected=true]:border-emerald-500
                            "
                        >
                          <span className="text-3xl">{option.emoji}</span>

                          <span className="text-xs font-medium text-center">
                            {option.label}
                          </span>

                          <RadioGroupItem
                            value={option.label}
                            id={`satisfaction-${option.label}`}
                          />
                        </label>
                      ))}
                    </RadioGroup>
                  </section>

                  {/* -------------------------------------------------------- */}
                  {/* Discharge                                                */}
                  {/* -------------------------------------------------------- */}

                  <section className="rounded-xl border border-border/60 bg-card p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Info className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">Discharge</h3>

                        <p className="text-xs text-muted-foreground">
                          Reason for discharge from the program.
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 max-w-xs">
                      <Label
                        htmlFor="dis-date"
                        className="mb-2 block text-xs font-medium"
                      >
                        Date
                      </Label>

                      <Input
                        id="dis-date"
                        type="date"
                        name="dischargeReasonDate"
                        value={evaluationForm.dischargeReasonDate}
                        onChange={handleEvaluationFormChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {dischargeOptions.map((item) => (
                        <label
                          key={item}
                          htmlFor={`discharge-${item}`}
                          className="
                              flex cursor-pointer
                              items-center gap-3
                              rounded-lg
                              border border-transparent
                              px-3 py-2.5
                              transition-colors
                              hover:bg-muted/60
                            "
                        >
                          <Checkbox
                            id={`discharge-${item}`}
                            checked={evaluationForm.dischargeReason.includes(
                              item
                            )}
                            onCheckedChange={() =>
                              toggleArrayValue("dischargeReason", item)
                            }
                          />

                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>

                    <Textarea
                      placeholder="If other, please specify..."
                      className="mt-4 resize-none"
                      name="otherDischargeReasone"
                      value={evaluationForm.otherDischargeReasone}
                      onChange={handleEvaluationFormChange}
                      rows={3}
                    />
                  </section>
                </div>
              </CardContent>

              <CardFooter
                className="
                  flex justify-end
                  border-t
                  bg-muted/10
                  px-5 py-4
                "
              >
                <Button
                  className="gap-2"
                  onClick={(e) =>
                    reqForConfirmationModelFunc(
                      BeneficiaryEvaluationSubmitButtonMessage,
                      () => handleSubmitEvaluationForm(e)
                    )
                  }
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Save Evaluation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Meal Tool Forms                                                    */}
      {/* ------------------------------------------------------------------ */}

      {reqForMealToolForm && (
        <MealToolForm
          open={reqForMealToolForm}
          onOpenChange={setReqForMealToolForm}
          mealToolsStateSetter={setMealTools}
          mode="create"
        />
      )}

      {reqForMealToolEditForm && mealToolId && (
        <MealToolForm
          open={reqForMealToolEditForm}
          onOpenChange={setReqForMealToolEditForm}
          mealToolsStateSetter={setMealTools}
          mealtoolId={mealToolId}
          mode="edit"
        />
      )}
    </div>
  );
};

export default withPermission(BeneficiaryProfilePage, "Maindatabase.view");
