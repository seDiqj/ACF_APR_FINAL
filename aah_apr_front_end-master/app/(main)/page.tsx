"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Filter,
  GraduationCap,
  LayoutDashboard,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";

/* =========================================================
   TYPES
========================================================= */

interface Overview {
  totalProjects?: number;
  activeProjects?: number;
  completedProjects?: number;
  totalBeneficiaries?: number;
  totalPrograms?: number;
  totalTrainings?: number;
  overallPerformance?: number;
}

interface ProjectPerformance {
  id?: number;
  name?: string;
  code?: string;
  performance?: number;
  progress?: number;
  completed?: number;
  total?: number;
}

interface IndicatorPerformance {
  id?: number;
  name?: string;
  code?: string;
  performance?: number;
  progress?: number;
  achieved?: number;
  target?: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface ActivityData {
  date?: string;
  label?: string;
  value?: number;
}

interface TrainingData {
  name?: string;
  modality?: string;
  participants?: number;
  date?: string;
}

interface ProgramData {
  id?: number;
  name?: string;
  performance?: number;
  progress?: number;
  total?: number;
  completed?: number;
}

interface DashboardData {
  overview: Overview;

  projectPerformance: ProjectPerformance[];

  indicatorPerformance: IndicatorPerformance[];

  beneficiaries: {
    gender?: ChartData[];
    registration?: ActivityData[];
    provinces?: ChartData[];
  };

  programs: ProgramData[];

  trainings: {
    modality?: ChartData[];
    participants?: ActivityData[];
    recent?: TrainingData[];
  };

  communityDialogues?: number;
  referrals?: number;
  aprs?: number;
  enacts?: number;

  activity?: ActivityData[];

  filters?: {
    projects?: {
      id: number;
      name: string;
    }[];

    provinces?: {
      id: number;
      name: string;
    }[];

    databases?: {
      id: number;
      name: string;
    }[];
  };
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

/* =========================================================
   DEFAULT
========================================================= */

const emptyData: DashboardData = {
  overview: {},

  projectPerformance: [],

  indicatorPerformance: [],

  beneficiaries: {
    gender: [],
    registration: [],
    provinces: [],
  },

  programs: [],

  trainings: {
    modality: [],
    participants: [],
    recent: [],
  },

  communityDialogues: 0,
  referrals: 0,
  aprs: 0,
  enacts: 0,

  activity: [],

  filters: {
    projects: [],
    provinces: [],
    databases: [],
  },
};

/* =========================================================
   HELPERS
========================================================= */

const number = (value?: number) =>
  new Intl.NumberFormat("en-US").format(value ?? 0);

const percentage = (value?: number) =>
  `${Math.round(value ?? 0)}%`;

const clamp = (value?: number) =>
  Math.min(Math.max(value ?? 0, 0), 100);

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
}) {
  const positive = (trend ?? 0) >= 0;

  return (
    <div className="group flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background/70 text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            {value}
          </span>

          {trend !== undefined && (
            <span
              className={`flex items-center text-[10px] font-semibold ${
                positive
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}

              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      )}

      <h2 className="text-lg font-semibold tracking-tight">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  text = "No data available",
}: {
  text?: string;
}) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </div>

      <p className="text-sm font-medium">{text}</p>

      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Data will appear here once information becomes available.
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

const DashboardPage = () => {
  const {
    requestHandler,
    reqForToastAndSetMessage,
  } = useParentContext();

  const [data, setData] =
    useState<DashboardData>(emptyData);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [projectId, setProjectId] =
    useState("all");

  const [provinceId, setProvinceId] =
    useState("all");

  const [databaseId, setDatabaseId] =
    useState("all");

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  /* =======================================================
     QUERY
  ======================================================= */

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (projectId !== "all") {
      params.set("project_id", projectId);
    }

    if (provinceId !== "all") {
      params.set("province_id", provinceId);
    }

    if (databaseId !== "all") {
      params.set("database_id", databaseId);
    }

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    return params.toString();
  }, [
    projectId,
    provinceId,
    databaseId,
    from,
    to,
  ]);

  /* =======================================================
     REQUEST
  ======================================================= */

  const loadDashboard = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const endpoint = queryString
          ? `/dashboard?${queryString}`
          : "/dashboard";

        const response =
          await requestHandler().get(endpoint);

        const json: ApiResponse =
          response.data;

        if (!json?.success) {
          throw new Error(
            json?.message ||
              "Unable to load dashboard"
          );
        }

        setData({
          ...emptyData,
          ...json.data,

          overview: {
            ...emptyData.overview,
            ...(json.data?.overview || {}),
          },

          beneficiaries: {
            ...emptyData.beneficiaries,
            ...(json.data?.beneficiaries || {}),
          },

          trainings: {
            ...emptyData.trainings,
            ...(json.data?.trainings || {}),
          },

          filters: {
            ...emptyData.filters,
            ...(json.data?.filters || {}),
          },
        });
      } catch (err: any) {
        console.error(
          "Dashboard request error:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard";

        setError(message);

        reqForToastAndSetMessage(
          message,
          "error"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      queryString,
      requestHandler,
      reqForToastAndSetMessage,
    ]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilters = () => {
    setProjectId("all");
    setProvinceId("all");
    setDatabaseId("all");
    setFrom("");
    setTo("");
  };

  /* =======================================================
     DATA
  ======================================================= */

  const overview = data.overview;

  const performance =
    clamp(overview.overallPerformance);

  const activity =
    data.activity ?? [];

  const gender =
    data.beneficiaries?.gender ?? [];

  const registration =
    data.beneficiaries?.registration ?? [];

  const provinces =
    data.beneficiaries?.provinces ?? [];

  const modalities =
    data.trainings?.modality ?? [];

  const participants =
    data.trainings?.participants ?? [];

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-full w-full bg-muted/20">
        <Navbar14 />

        <div className="mx-auto max-w-[1800px] p-4 lg:p-6">
          <div className="mb-6 h-5 w-48 animate-pulse rounded bg-muted" />

          <div className="mb-6 h-40 animate-pulse rounded-3xl bg-muted" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl bg-muted"
                />
              )
            )}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-7">
            <div className="h-[380px] animate-pulse rounded-3xl bg-muted xl:col-span-4" />

            <div className="h-[380px] animate-pulse rounded-3xl bg-muted xl:col-span-3" />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full w-full bg-muted/[0.18]">
      <Navbar14 />

      <main className="mx-auto w-full max-w-[1800px] p-3 sm:p-4 lg:p-6">
        {/* =================================================
            TOP
        ================================================= */}

        <div className="mb-4">
          <BreadcrumbWithCustomSeparator />
        </div>

        <SubHeader pageTitle="Dashboard">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="gap-2 rounded-xl"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </Button>
        </SubHeader>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mb-6 overflow-hidden rounded-[28px] border bg-card shadow-sm">
          {/* Decorative background */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-primary/[0.05] blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
              {/* LEFT */}

              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Portfolio Intelligence
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Good overview,
                  <br className="hidden sm:block" />{" "}
                  here&apos;s your portfolio.
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  A consolidated view of your projects,
                  beneficiaries, programs and
                  implementation performance.
                </p>
              </div>

              {/* PERFORMANCE */}

              <div className="flex items-center gap-5 rounded-2xl border bg-background/60 p-4 backdrop-blur-sm sm:p-5">
                <div className="relative h-24 w-24 shrink-0">
                  <svg
                    className="h-24 w-24 -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      className="text-muted"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${
                        performance * 2.513
                      } 251.3`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">
                      {percentage(performance)}
                    </span>

                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Score
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Overall performance
                  </p>

                  <p className="mt-1 text-base font-semibold">
                    Portfolio Health
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Current period</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <section className="mb-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 lg:mr-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Filters
                </p>

                <p className="text-[11px] text-muted-foreground">
                  Refine dashboard data
                </p>
              </div>
            </div>

            <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <Select
                value={projectId}
                onValueChange={setProjectId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Projects
                  </SelectItem>

                  {(
                    data.filters?.projects ?? []
                  ).map((item) => (
                    <SelectItem
                      key={item.id}
                      value={String(item.id)}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={provinceId}
                onValueChange={setProvinceId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Provinces
                  </SelectItem>

                  {(
                    data.filters?.provinces ?? []
                  ).map((item) => (
                    <SelectItem
                      key={item.id}
                      value={String(item.id)}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={databaseId}
                onValueChange={setDatabaseId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Database" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Databases
                  </SelectItem>

                  {(
                    data.filters?.databases ?? []
                  ).map((item) => (
                    <SelectItem
                      key={item.id}
                      value={String(item.id)}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={from}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
                className="rounded-xl"
              />

              <Input
                type="date"
                value={to}
                onChange={(e) =>
                  setTo(e.target.value)
                }
                className="rounded-xl"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="rounded-xl"
            >
              Reset
            </Button>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

              <div>
                <p className="text-sm font-semibold">
                  Dashboard could not be loaded
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {error}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                loadDashboard()
              }
              className="rounded-xl"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* =================================================
            KPI STRIP
        ================================================= */}

        <section className="mb-6 rounded-2xl border bg-card shadow-sm">
          <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
            <div className="p-4 sm:p-5">
              <MiniStat
                label="Projects"
                value={number(
                  overview.totalProjects
                )}
                icon={Target}
              />
            </div>

            <div className="p-4 sm:p-5">
              <MiniStat
                label="Active"
                value={number(
                  overview.activeProjects
                )}
                icon={Activity}
              />
            </div>

            <div className="p-4 sm:p-5">
              <MiniStat
                label="Beneficiaries"
                value={number(
                  overview.totalBeneficiaries
                )}
                icon={Users}
              />
            </div>

            <div className="p-4 sm:p-5">
              <MiniStat
                label="Trainings"
                value={number(
                  overview.totalTrainings
                )}
                icon={GraduationCap}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            ANALYTICS ROW
        ================================================= */}

        <section className="mb-6 grid gap-6 xl:grid-cols-7">
          {/* ACTIVITY */}

          <Card className="overflow-hidden rounded-[24px] border shadow-sm xl:col-span-4">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
              <SectionTitle
                eyebrow="Activity"
                title="Activity trend"
                description="Activity across the selected period"
              />

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-6 sm:p-6">
              {activity.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart
                      data={activity}
                      margin={{
                        top: 10,
                        right: 5,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="dashboardArea"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="currentColor"
                            stopOpacity={0.22}
                          />

                          <stop
                            offset="100%"
                            stopColor="currentColor"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        className="stroke-muted"
                      />

                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                      />

                      <Tooltip />

                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        fill="url(#dashboardArea)"
                        className="text-primary"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QUICK METRICS */}

          <Card className="rounded-[24px] border shadow-sm xl:col-span-3">
            <CardHeader>
              <SectionTitle
                eyebrow="Operations"
                title="Operational snapshot"
                description="Key operational activities"
              />
            </CardHeader>

            <CardContent className="space-y-1">
              {[
                {
                  label: "Completed Projects",
                  value:
                    overview.completedProjects,
                  icon: CheckCircle2,
                },
                {
                  label: "Programs",
                  value:
                    overview.totalPrograms,
                  icon: Target,
                },
                {
                  label: "Community Dialogues",
                  value:
                    data.communityDialogues,
                  icon: Users,
                },
                {
                  label: "Referrals",
                  value:
                    data.referrals,
                  icon: UserRoundCheck,
                },
                {
                  label: "APRs",
                  value: data.aprs,
                  icon: FileCheck2,
                },
                {
                  label: "Enacts",
                  value: data.enacts,
                  icon: CheckCircle2,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <span className="text-sm text-muted-foreground">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-sm font-bold">
                      {number(item.value)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* =================================================
            PROJECT PERFORMANCE
        ================================================= */}

        <section className="mb-6">
          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader className="border-b">
              <SectionTitle
                eyebrow="Performance"
                title="Project performance"
                description="Implementation progress across projects"
              />
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              {data.projectPerformance.length ===
              0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                  {data.projectPerformance.map(
                    (project, index) => {
                      const value = clamp(
                        project.performance ??
                          project.progress
                      );

                      return (
                        <div
                          key={
                            project.id ??
                            project.code ??
                            index
                          }
                          className="group"
                        >
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {project.name ||
                                  "Unnamed Project"}
                              </p>

                              {project.code && (
                                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {project.code}
                                </p>
                              )}
                            </div>

                            <span className="text-sm font-bold">
                              {percentage(value)}
                            </span>
                          </div>

                          <Progress
                            value={value}
                            className="h-1.5"
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* =================================================
            BENEFICIARIES
        ================================================= */}

        <section className="mb-6">
          <div className="mb-4">
            <SectionTitle
              eyebrow="Beneficiaries"
              title="People & geographic reach"
              description="Understand who is being reached and where"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-5">
            {/* GENDER */}

            <Card className="rounded-[24px] border shadow-sm xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  Gender distribution
                </CardTitle>
              </CardHeader>

              <CardContent>
                {gender.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="relative h-[280px]">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={gender}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {gender.map(
                            (_, index) => (
                              <Cell
                                key={index}
                                className={
                                  index === 0
                                    ? "fill-primary"
                                    : "fill-primary/30"
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {number(
                            gender.reduce(
                              (sum, item) =>
                                sum +
                                item.value,
                              0
                            )
                          )}
                        </p>

                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Total
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* REGISTRATION */}

            <Card className="rounded-[24px] border shadow-sm xl:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">
                  Registration trend
                </CardTitle>
              </CardHeader>

              <CardContent>
                {registration.length ===
                0 ? (
                  <EmptyState />
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={registration}
                      >
                        <defs>
                          <linearGradient
                            id="registrationGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="currentColor"
                              stopOpacity={0.18}
                            />

                            <stop
                              offset="100%"
                              stopColor="currentColor"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="4 4"
                          className="stroke-muted"
                        />

                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          fontSize={10}
                        />

                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={10}
                        />

                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="currentColor"
                          strokeWidth={2}
                          fill="url(#registrationGradient)"
                          className="text-primary"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* =================================================
            PROVINCES
        ================================================= */}

        <section className="mb-6">
          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader>
              <SectionTitle
                eyebrow="Geography"
                title="Beneficiaries by province"
                description="Geographic distribution across the portfolio"
              />
            </CardHeader>

            <CardContent>
              {provinces.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-[330px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={provinces}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -10,
                        bottom: 45,
                      }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        className="stroke-muted"
                      />

                      <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        tickLine={false}
                        axisLine={false}
                        fontSize={9}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        radius={[7, 7, 2, 2]}
                        fill="currentColor"
                        className="text-primary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* =================================================
            PROGRAM + TRAINING
        ================================================= */}

        <section className="mb-6 grid gap-6 xl:grid-cols-2">
          {/* PROGRAMS */}

          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader className="border-b">
              <SectionTitle
                eyebrow="Programs"
                title="Program performance"
                description="Current implementation progress"
              />
            </CardHeader>

            <CardContent className="p-0">
              {data.programs.length ===
              0 ? (
                <div className="p-5">
                  <EmptyState />
                </div>
              ) : (
                <div className="divide-y">
                  {data.programs
                    .slice(0, 8)
                    .map(
                      (
                        program,
                        index
                      ) => {
                        const value =
                          clamp(
                            program.performance ??
                              program.progress
                          );

                        return (
                          <div
                            key={
                              program.id ??
                              index
                            }
                            className="p-4 transition-colors hover:bg-muted/30"
                          >
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <p className="truncate text-sm font-medium">
                                {program.name ||
                                  "Unnamed Program"}
                              </p>

                              <span className="text-xs font-bold">
                                {percentage(
                                  value
                                )}
                              </span>
                            </div>

                            <Progress
                              value={value}
                              className="h-1.5"
                            />
                          </div>
                        );
                      }
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TRAINING */}

          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader className="border-b">
              <SectionTitle
                eyebrow="Capacity Building"
                title="Training activity"
                description="Training modalities and participation"
              />
            </CardHeader>

            <CardContent>
              {participants.length ===
              0 ? (
                <EmptyState />
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={participants}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        className="stroke-muted"
                      />

                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        radius={[6, 6, 2, 2]}
                        fill="currentColor"
                        className="text-primary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* =================================================
            INDICATORS
        ================================================= */}

        <section className="mb-6">
          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader className="border-b">
              <SectionTitle
                eyebrow="Indicators"
                title="Indicator performance"
                description="Progress against defined targets"
              />
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              {data.indicatorPerformance
                .length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {data.indicatorPerformance.map(
                    (
                      indicator,
                      index
                    ) => {
                      const value =
                        clamp(
                          indicator.performance ??
                            indicator.progress
                        );

                      return (
                        <div
                          key={
                            indicator.id ??
                            indicator.code ??
                            index
                          }
                          className="rounded-2xl border bg-muted/[0.18] p-4"
                        >
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {indicator.name ||
                                  "Unnamed Indicator"}
                              </p>

                              {indicator.code && (
                                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {indicator.code}
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 text-sm font-bold">
                              {percentage(
                                value
                              )}
                            </span>
                          </div>

                          <Progress
                            value={value}
                            className="h-1.5"
                          />

                          {indicator.target !==
                            undefined && (
                            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                              <span>
                                Achieved{" "}
                                {number(
                                  indicator.achieved
                                )}
                              </span>

                              <span>
                                Target{" "}
                                {number(
                                  indicator.target
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* =================================================
            RECENT TRAININGS
        ================================================= */}

        <section>
          <Card className="rounded-[24px] border shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-4">
                <SectionTitle
                  eyebrow="Recent Activity"
                  title="Latest trainings"
                  description="Most recent training activities"
                />

                <Clock3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {(
                data.trainings?.recent ??
                []
              ).length === 0 ? (
                <div className="p-5">
                  <EmptyState text="No recent trainings" />
                </div>
              ) : (
                <div className="divide-y">
                  {(
                    data.trainings?.recent ??
                    []
                  )
                    .slice(0, 8)
                    .map(
                      (
                        training,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <GraduationCap className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {training.name ||
                                  "Training"}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                                {training.modality && (
                                  <span className="rounded-md bg-muted px-2 py-1">
                                    {
                                      training.modality
                                    }
                                  </span>
                                )}

                                {training.date && (
                                  <span className="flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    {
                                      training.date
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {training.participants !==
                            undefined && (
                            <div className="flex items-center gap-2 text-xs">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />

                              <span className="font-bold">
                                {number(
                                  training.participants
                                )}
                              </span>

                              <span className="text-muted-foreground">
                                participants
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;

