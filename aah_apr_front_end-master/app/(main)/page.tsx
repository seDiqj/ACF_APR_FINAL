"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  FolderOpen,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
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
import { AxiosError } from "axios";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParentContext } from "@/contexts/ParentContext";

type DashboardKpis = {
  totalProjects: number;
  activeProjects: number;
  totalBeneficiaries: number;
  aprIncludedBeneficiaries: number;
  pendingSubmittedDatabases: number;
  pendingAprReviews: number;
};

type ChartItem = {
  key?: string;
  label?: string;
  status?: string;
  province?: string;
  count: number;
};

type QueueItem = {
  id: number;
  status: string;
  statusLabel: string;
  projectCode: string | null;
  projectTitle: string | null;
  database: string | null;
  province: string | null;
  manager: string | null;
  fromDate: string | null;
  toDate: string | null;
  createdAt: string | null;
};

type DashboardOverview = {
  kpis: DashboardKpis;
  workflow: {
    pipeline: ChartItem[];
  };
  projects: {
    byStatus: ChartItem[];
    byProvince: ChartItem[];
  };
  queues: {
    databasesAwaitingReview: QueueItem[];
    aprsAwaitingAction: QueueItem[];
    recentSubmissions: QueueItem[];
  };
  notifications: {
    unreadCount: number;
    recent: {
      id: number;
      title: string;
      message: string | null;
      type: string;
      createdAt: string | null;
    }[];
  };
};

const workflowColors: Record<string, string> = {
  submitted: "#2563eb",
  underReview: "#f59e0b",
  approved: "#16a34a",
  rejected: "#dc2626",
};

const projectStatusColors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

const emptyOverview: DashboardOverview = {
  kpis: {
    totalProjects: 0,
    activeProjects: 0,
    totalBeneficiaries: 0,
    aprIncludedBeneficiaries: 0,
    pendingSubmittedDatabases: 0,
    pendingAprReviews: 0,
  },
  workflow: { pipeline: [] },
  projects: { byStatus: [], byProvince: [] },
  queues: {
    databasesAwaitingReview: [],
    aprsAwaitingAction: [],
    recentSubmissions: [],
  },
  notifications: { unreadCount: 0, recent: [] },
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const formatDate = (value: string | null) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const statusClassName = (status: string) => {
  if (status.toLowerCase().includes("rejected")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status.toLowerCase().includes("approved")) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "reviewed" || status === "aprGenerated") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
};

export default function DashboardPage() {
  const { axiosInstance, reqForToastAndSetMessage } = useParentContext();
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = () => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/dashboard/overview")
      .then((response: { data: { data: DashboardOverview } }) => {
        setOverview(response.data.data ?? emptyOverview);
      })
      .catch((requestError: AxiosError<{ message?: string }>) => {
        const message =
          requestError.response?.data?.message ||
          "Unable to load dashboard overview.";
        setError(message);
        reqForToastAndSetMessage(message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, [axiosInstance]);

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Projects",
        value: overview.kpis.totalProjects,
        icon: FolderOpen,
        tone: "text-blue-600 bg-blue-50",
      },
      {
        title: "Active Projects",
        value: overview.kpis.activeProjects,
        icon: BarChart3,
        tone: "text-green-600 bg-green-50",
      },
      {
        title: "Total Beneficiaries",
        value: overview.kpis.totalBeneficiaries,
        icon: Users,
        tone: "text-cyan-600 bg-cyan-50",
      },
      {
        title: "APR Included",
        value: overview.kpis.aprIncludedBeneficiaries,
        icon: CheckCircle2,
        tone: "text-emerald-600 bg-emerald-50",
      },
      {
        title: "Pending Databases",
        value: overview.kpis.pendingSubmittedDatabases,
        icon: Database,
        tone: "text-amber-600 bg-amber-50",
      },
      {
        title: "Pending APR Review",
        value: overview.kpis.pendingAprReviews,
        icon: FileSearch,
        tone: "text-rose-600 bg-rose-50",
      },
    ],
    [overview.kpis],
  );

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-6">
      <Navbar14 />
      <div className="my-2 flex flex-row items-center justify-start">
        <BreadcrumbWithCustomSeparator />
      </div>

      <SubHeader pageTitle="Dashboard">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchOverview}
          disabled={loading}
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </SubHeader>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))
          : kpiCards.map((item) => (
              <Card key={item.title} className="gap-3 py-4">
                <CardContent className="flex items-start justify-between gap-3 px-4">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">{item.title}</p>
                    <p className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                      {formatNumber(item.value)}
                    </p>
                  </div>
                  <div className={`rounded-md p-2 ${item.tone}`}>
                    <item.icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>APR Workflow Overview</CardTitle>
            <CardDescription>
              Submitted, review, approval, and rejection movement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72" />
            ) : overview.workflow.pipeline.length === 0 ? (
              <EmptyState label="No APR workflow data available." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={overview.workflow.pipeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {overview.workflow.pipeline.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={workflowColors[entry.key ?? ""] ?? "#2563eb"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Projects By Status</CardTitle>
              <CardDescription>Portfolio distribution.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72" />
              ) : overview.projects.byStatus.length === 0 ? (
                <EmptyState label="No project status data available." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={overview.projects.byStatus}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={58}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {overview.projects.byStatus.map((_, index) => (
                        <Cell
                          key={index}
                          fill={projectStatusColors[index % projectStatusColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects By Province</CardTitle>
              <CardDescription>Top provinces by project coverage.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72" />
              ) : overview.projects.byProvince.length === 0 ? (
                <EmptyState label="No project province data available." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={overview.projects.byProvince} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis
                      type="category"
                      dataKey="province"
                      width={96}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0891b2" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader className="gap-3 md:flex md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Action Queue</CardTitle>
              <CardDescription>
                Databases, APRs, and recent submissions that need operational attention.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/submitted_databases">
                  <Database />
                  Databases
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/review_aprs">
                  <FileSearch />
                  Review APRs
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/approve_aprs">
                  <ShieldCheck />
                  Validate
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-40" />
              </div>
            ) : (
              <>
                <QueueTable
                  title="Databases Awaiting Approval Or Review"
                  items={overview.queues.databasesAwaitingReview}
                  emptyLabel="No submitted databases are waiting for review."
                />
                <QueueTable
                  title="APRs Awaiting Review Or Validation"
                  items={overview.queues.aprsAwaitingAction}
                  emptyLabel="No APRs are waiting for review or validation."
                />
                <QueueTable
                  title="Recent Submissions"
                  items={overview.queues.recentSubmissions}
                  emptyLabel="No recent submissions found."
                />
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function QueueTable({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: QueueItem[];
  emptyLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <Badge variant="outline">{formatNumber(items.length)}</Badge>
      </div>

      {items.length === 0 ? (
        <EmptyState label={emptyLabel} compact />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Database</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${title}-${item.id}`}>
                  <TableCell className="min-w-32 font-medium">
                    {item.projectCode ?? "Unknown"}
                  </TableCell>
                  <TableCell className="min-w-40">
                    {item.database ?? "Unknown"}
                  </TableCell>
                  <TableCell>{item.province ?? "Unknown"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusClassName(item.status)}
                    >
                      {item.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-48 text-sm text-slate-600">
                    {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.manager ?? "Not assigned"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border border-dashed bg-slate-50 text-center text-sm text-slate-500 ${
        compact ? "min-h-20 px-4 py-5" : "h-72 px-6"
      }`}
    >
      {label}
    </div>
  );
}
