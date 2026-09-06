"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useParentContext } from "@/contexts/ParentContext";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import axios from "axios";
import { Can } from "@/components/Can";
import { withPermission } from "@/lib/withPermission";

type Disaggregation = {
  name: string;
  target: number;
  months?: number[];
};

type Indicator = {
  code: string;
  name: string;
  disaggregation: Disaggregation[];
  isSub?: boolean;
};

type Output = {
  name: string;
  indicators: Indicator[];
};

type Outcome = {
  name: string;
  outputs: Output[];
};

type TimelineMonth = {
  key: string;
  label: string;
};

const excelApiBaseUrl =
  process.env.NEXT_PUBLIC_EXCEL_API_BASE_URL ?? "http://127.0.0.1:5000";

const MIN_ZOOM = 50;
const MAX_ZOOM = 150;
const ZOOM_STEP = 10;

const MonitoringTablePage = () => {
  const { id } = useParams<{ id: string }>();

  const { requestHandler, reqForToastAndSetMessage } = useParentContext();

  const sheetRef = useRef<HTMLDivElement>(null);
  const tableViewportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [timeline, setTimeline] = useState<TimelineMonth[]>([]);

  const [data, setData] = useState<{
    impact: string;
    projectGoal?: string;
    projectCode: string;
    projectManager: string;
    projectStartDate: string;
    projectEndDate: string;
    outcomes: Outcome[];
    isp3s: any[];
  }>({
    impact: "",
    projectCode: "",
    projectManager: "",
    projectStartDate: "",
    projectEndDate: "",
    outcomes: [],
    isp3s: [],
  });

  /*
   * UI-only state.
   *
   * This does not affect any existing application logic.
   */
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    requestHandler()
      .get(`/apr_management/show_apr/${id}`)
      .then((response: any) => {
        const d = response.data.data;

        setData(d);

        if (d.outcomes?.length && d.start_date) {
          const monthCount =
            d.outcomes[0].outputs[0].indicators[0].disaggregation[0].months
              .length;

          const start = new Date(d.start_date);

          const generatedTimeline: TimelineMonth[] = Array.from(
            { length: monthCount },
            (_, idx) => {
              const current = new Date(start);

              current.setMonth(start.getMonth() + idx);

              return {
                key: `m${idx}`,
                label: current.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                }),
              };
            }
          );

          setTimeline(generatedTimeline);
        }
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || error.message,
          "error"
        )
      );
  }, []);

  const rowsPerIndicator = (ind: Indicator) => 1 + ind.disaggregation.length;

  const rowsPerOutput = (out: Output) =>
    out.indicators.reduce((s, ind) => s + rowsPerIndicator(ind), 0);

  const rowsPerOutcome = (oc: Outcome) =>
    oc.outputs.reduce((s, out) => s + rowsPerOutput(out), 0);

  const totalRows = data.outcomes.reduce((s, oc) => s + rowsPerOutcome(oc), 0);

  const rows: React.ReactNode[] = [];

  data.outcomes.forEach((outcome, oIndex) => {
    const outcomeRowSpan = rowsPerOutcome(outcome);

    outcome.outputs.forEach((output, opIndex) => {
      const outputRowSpan = rowsPerOutput(output);

      output.indicators.forEach((indicator, iIndex) => {
        const showImpact = oIndex === 0 && opIndex === 0 && iIndex === 0;

        const showOutcome = opIndex === 0 && iIndex === 0;

        const showOutput = iIndex === 0;

        let monthsSum: (number | string)[] = [];

        let totalAchievement = 0;

        let percentAchieved: string | number = 0;

        const specialDisaggs = [
          "# of supervised psychosocial counsellors",
          "# Accumulated score EQUIP (ENACT) Tool",
        ];

        const disaggNames = indicator.disaggregation.map((d) => d.name);

        const isEnact =
          specialDisaggs.every((name) => disaggNames.includes(name)) &&
          disaggNames.length === 2;

        const eachMonthLabel: string[] = [];

        const eachQuarterLabel: string[] = [];

        if (isEnact) {
          const dm1 = indicator.disaggregation[0].months || [];

          const dm2 = indicator.disaggregation[1].months || [];

          const monthCount = Math.max(dm1.length, dm2.length);

          const dm1Ensured = Array.from(
            {
              length: monthCount,
            },
            (_, i) => dm1[i] || 0
          );

          const dm2Ensured = Array.from(
            {
              length: monthCount,
            },
            (_, i) => dm2[i] || 0
          );

          // Generate monthly ratios and labels
          for (let i = 0; i < monthCount; i++) {
            const ratio = dm2Ensured[i] / (dm1Ensured[i] * 60 || 1);

            let label = "";

            if (ratio >= 0.95) label = "Excellent Performance";
            else if (ratio >= 0.75) label = "Good Performance";
            else if (ratio >= 0.65) label = "Fair Performance";
            else if (ratio >= 0.5) label = "Needs Improvement";
            else label = "Poor Performance";

            eachMonthLabel.push(label);
          }

          // Generate quarterly labels
          for (let i = 0; i < monthCount; i += 3) {
            const quarterRatios: number[] = [];

            for (let j = 0; j < 3 && i + j < monthCount; j++) {
              quarterRatios.push(
                dm2Ensured[i + j] / (dm1Ensured[i + j] * 60 || 1)
              );
            }

            const quarterAvg =
              quarterRatios.reduce((a, b) => a + b, 0) / quarterRatios.length;

            let label = "";

            if (quarterAvg >= 0.95) label = "Excellent Performance";
            else if (quarterAvg >= 0.75) label = "Good Performance";
            else if (quarterAvg >= 0.65) label = "Fair Performance";
            else if (quarterAvg >= 0.5) label = "Needs Improvement";
            else label = "Poor Performance";

            eachQuarterLabel.push(label);
          }

          monthsSum = eachMonthLabel;

          totalAchievement = eachMonthLabel.length;

          percentAchieved = "-";
        } else {
          const monthCount = timeline.length;

          monthsSum = timeline.map((_, mIdx) =>
            indicator.disaggregation.reduce(
              (s, d) => s + (d.months?.[mIdx] || 0),
              0
            )
          ) as number[];

          const totalTarget = indicator.disaggregation.reduce(
            (s, d) => s + (d.target || 0),
            0
          );

          totalAchievement = (monthsSum as number[]).reduce((a, b) => a + b, 0);

          percentAchieved = totalTarget
            ? ((totalAchievement / totalTarget) * 100).toFixed(2)
            : "0";
        }

        const monthQuarterCells: React.ReactNode[] = [];

        for (let i = 0; i < monthsSum.length; i += 3) {
          const chunk = monthsSum.slice(i, i + 3);

          // Quarter value
          if (chunk.length === 3) {
            monthQuarterCells.push(
              <TableCell
                key={`q-${i / 3}`}
                className="border-r border-slate-300 bg-[#dbeafe] text-center text-xs font-semibold text-blue-900 dark:border-slate-600 dark:bg-blue-950 dark:text-blue-200"
              >
                {isEnact
                  ? `${eachQuarterLabel[i / 3]}`
                  : chunk.reduce(
                      (a, b) =>
                        (typeof a === "number" ? a : 0) +
                        (typeof b === "number" ? b : 0),
                      0
                    )}
              </TableCell>
            );
          }

          // Month values
          chunk.forEach((val, mIndex) => {
            monthQuarterCells.push(
              <TableCell
                key={`m-${i + mIndex}`}
                className="border-r border-slate-300 bg-white text-center text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                {val}
              </TableCell>
            );
          });
        }

        rows.push(
          <TableRow
            key={`main-${oIndex}-${opIndex}-${iIndex}`}
            className="border-b border-slate-300 bg-white hover:bg-[#f8fbff] dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
          >
            {showImpact && (
              <TableCell
                rowSpan={totalRows}
                className="sticky left-0 z-10 max-w-[300px] border-r border-slate-400 bg-[#f8fafc] px-3 py-3 text-center align-middle text-[12px] font-semibold leading-5 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
              >
                {data.impact || data.projectGoal}
              </TableCell>
            )}

            {showOutcome && (
              <TableCell
                rowSpan={outcomeRowSpan}
                className="max-w-[300px] border-r border-slate-400 bg-[#f0fdf4] px-3 py-3 text-center align-middle text-[12px] leading-5 text-slate-700 dark:border-slate-600 dark:bg-emerald-950/30 dark:text-slate-300"
              >
                {outcome.name}
              </TableCell>
            )}

            {showOutput && (
              <TableCell
                rowSpan={outputRowSpan}
                className="max-w-[300px] border-r border-slate-400 bg-[#faf5ff] px-3 py-3 text-center align-middle text-[12px] leading-5 text-slate-700 dark:border-slate-600 dark:bg-violet-950/30 dark:text-slate-300"
              >
                {output.name}
              </TableCell>
            )}

            <TableCell className="min-w-[280px] max-w-[400px] border-r border-slate-400 bg-[#eff6ff] px-3 py-3 text-center align-middle dark:border-slate-600 dark:bg-blue-950/30">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {indicator.code}
              </div>

              <div
                title={indicator.name}
                className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400"
              >
                {indicator.name.length >= 50
                  ? `${indicator.name.slice(0, 50)}...`
                  : indicator.name}
              </div>
            </TableCell>

            <TableCell className="min-w-[100px] border-r border-slate-400 bg-[#f8fafc] text-center align-middle text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {indicator.disaggregation.reduce((s, d) => s + d.target, 0)}
            </TableCell>

            <TableCell className="min-w-[130px] border-r border-slate-400 bg-[#f0fdf4] text-center align-middle text-sm font-semibold text-green-700 dark:border-slate-600 dark:bg-green-950/30 dark:text-green-400">
              {totalAchievement}
            </TableCell>

            <TableCell className="min-w-[110px] border-r border-slate-400 bg-[#fffbeb] text-center align-middle text-sm font-semibold text-amber-700 dark:border-slate-600 dark:bg-amber-950/30 dark:text-amber-400">
              {typeof percentAchieved === "string"
                ? percentAchieved
                : `${percentAchieved}%`}
            </TableCell>

            {monthQuarterCells}
          </TableRow>
        );

        indicator.disaggregation.forEach((d, dIndex) => {
          const disMonthQuarterCells: React.ReactNode[] = [];

          for (let i = 0; i < (d.months?.length || 0); i += 3) {
            const quarterChunk = d.months?.slice(i, i + 3) || [];

            // IF quarter has 3 months only then show quarter value otherwise do not create quarter cell
            if (quarterChunk.length === 3) {
              const quarterValue = quarterChunk.reduce((a, b) => a + b, 0);

              disMonthQuarterCells.push(
                <TableCell
                  key={`dis-q-${dIndex}-${i / 3}`}
                  className="border-r border-slate-300 bg-[#eff6ff] text-center text-xs font-medium text-blue-800 dark:border-slate-600 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  {quarterValue}
                </TableCell>
              );
            }

            d.months?.slice(i, i + 3).forEach((m, mIndex) => {
              disMonthQuarterCells.push(
                <TableCell
                  key={`dis-m-${dIndex}-${i + mIndex}`}
                  className="border-r border-slate-300 bg-white text-center text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                >
                  {m}
                </TableCell>
              );
            });
          }

          rows.push(
            <TableRow
              key={`dis-${oIndex}-${opIndex}-${iIndex}-${dIndex}`}
              className="border-b border-slate-200 bg-white hover:bg-[#fafafa] dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <TableCell className="min-w-[280px] border-r border-slate-300 bg-[#fafafa] py-2 pl-8 pr-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />

                  <span>{d.name}</span>
                </div>
              </TableCell>

              <TableCell className="min-w-[100px] border-r border-slate-300 text-center text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                {d.target}
              </TableCell>

              <TableCell className="min-w-[130px] border-r border-slate-300 text-center text-xs font-medium text-green-700 dark:border-slate-700 dark:text-green-400">
                {d.months?.reduce((a, b) => a + b, 0) || 0}
              </TableCell>

              <TableCell className="min-w-[110px] border-r border-slate-300 text-center text-xs font-medium text-amber-700 dark:border-slate-700 dark:text-amber-400">
                {d.target
                  ? (
                      ((d.months?.reduce((a, b) => a + b, 0) || 0) / d.target) *
                      100
                    ).toFixed(2)
                  : "0"}
                %
              </TableCell>

              {disMonthQuarterCells}
            </TableRow>
          );
        });
      });
    });
  });

  // Request to python to generate the excel file.
  const downloadExcel = async () => {
    try {
      const response = await axios.post(
        `${excelApiBaseUrl.replace(/\/$/, "")}/generate-excel`,
        data,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(response.data);

      const a = document.createElement("a");

      a.href = url;
      a.download = "Monitoring_Dynamic.xlsx";

      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      reqForToastAndSetMessage(
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  /*
   * UI-only zoom controls.
   */
  const increaseZoom = () => {
    setZoom((current) => Math.min(current + ZOOM_STEP, MAX_ZOOM));
  };

  const decreaseZoom = () => {
    setZoom((current) => Math.max(current - ZOOM_STEP, MIN_ZOOM));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  /*
   * UI-only fullscreen.
   */
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await sheetRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(!isFullscreen);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f3f4f6] dark:bg-slate-950">
      <div
        className={`flex h-full w-full flex-col ${
          isFullscreen ? "bg-white dark:bg-slate-950" : ""
        }`}
      >
        {/* =========================================================
            TOP APPLICATION BAR
        ========================================================= */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-300 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <SidebarTrigger />

            <div className="hidden h-6 w-px bg-slate-300 sm:block dark:bg-slate-700" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.back()}
              className="h-8 gap-1.5 rounded-md px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />

              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />

                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Monitoring &amp; Evaluation
                </span>
              </div>
            </div>
          </div>

          <Can permission="Apr.download">
            <Button
              size="sm"
              onClick={() => downloadExcel()}
              className="h-8 gap-2 rounded-md bg-green-600 px-3 text-xs font-semibold shadow-sm hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Excel</span>
            </Button>
          </Can>
        </div>

        {/* =========================================================
            SHEET CONTAINER
        ========================================================= */}
        <div
          ref={sheetRef}
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950"
        >
          {/* =======================================================
              EXCEL-LIKE SHEET TOOLBAR
          ======================================================= */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-[#f8f9fa] px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            {/* Left side */}
            <div className="flex items-center gap-1">
              <div className="mr-2 hidden items-center gap-2 sm:flex">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Monitoring Sheet
                </span>
              </div>

              <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />

              <Button
                size="icon"
                variant="ghost"
                onClick={decreaseZoom}
                disabled={zoom <= MIN_ZOOM}
                className="h-7 w-7 rounded-sm text-slate-600 hover:bg-slate-200 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>

              <button
                type="button"
                onClick={resetZoom}
                className="min-w-[54px] rounded-sm px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                title="Reset zoom"
              >
                {zoom}%
              </button>

              <Button
                size="icon"
                variant="ghost"
                onClick={increaseZoom}
                disabled={zoom >= MAX_ZOOM}
                className="h-7 w-7 rounded-sm text-slate-600 hover:bg-slate-200 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>

              <div className="hidden h-5 w-px bg-slate-300 sm:block dark:bg-slate-700" />

              <Button
                size="icon"
                variant="ghost"
                onClick={resetZoom}
                className="hidden h-7 w-7 rounded-sm text-slate-600 hover:bg-slate-200 sm:inline-flex dark:text-slate-400 dark:hover:bg-slate-800"
                title="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 text-[11px] text-slate-500 sm:flex dark:text-slate-400">
                <span>{data.outcomes.length} outcomes</span>

                <span>•</span>

                <span>{timeline.length} months</span>
              </div>

              <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />

              <Button
                size="icon"
                variant="ghost"
                onClick={toggleFullscreen}
                className="h-7 w-7 rounded-sm text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* =======================================================
              FORMULA / PROJECT INFO BAR
          ======================================================= */}
          <div className="shrink-0 border-b border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
            <div className="grid grid-cols-2 divide-x divide-slate-300 md:grid-cols-4 dark:divide-slate-700">
              <div className="flex min-w-0 items-center gap-2 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Project Code
                </span>

                <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {data.projectCode || "—"}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Manager
                </span>

                <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {data.projectManager || "—"}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Start
                </span>

                <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {data.projectStartDate || "—"}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  End
                </span>

                <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {data.projectEndDate || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* =======================================================
              SPREADSHEET VIEWPORT
          ======================================================= */}
          <div
            ref={tableViewportRef}
            className="min-h-0 flex-1 overflow-auto bg-[#e9edf1] p-2 dark:bg-slate-900"
          >
            <div
              className="min-w-max origin-top-left"
              style={{
                zoom: `${zoom}%`,
              }}
            >
              <Card className="overflow-hidden rounded-sm border border-slate-400 bg-white shadow-none dark:border-slate-600 dark:bg-slate-950">
                <CardContent className="p-0">
                  <Table className="min-w-max border-collapse">
                    <TableHeader>
                      <TableRow className="border-b-2 border-slate-500 bg-[#217346]">
                        <TableHead className="sticky left-0 top-0 z-30 min-w-[220px] border-r border-white/30 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white shadow-[1px_0_0_#64748b]">
                          Impact/Goal (LFA)
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 min-w-[220px] border-r border-white/30 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                          Result/Outcome
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 min-w-[220px] border-r border-white/30 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                          Outputs
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 min-w-[280px] border-r border-white/30 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                          Indicators
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 min-w-[100px] border-r border-white/30 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                          Target
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 min-w-[130px] border-r border-white/30 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                          Total Achievement
                        </TableHead>

                        <TableHead className="sticky top-0 z-20 min-w-[110px] border-r border-white/30 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                          % Achieved
                        </TableHead>

                        {timeline.map((m, idx) => {
                          if (idx % 3 === 0) {
                            return (
                              <React.Fragment key={m.key}>
                                <TableHead className="sticky top-0 z-20 min-w-[150px] border-r border-green-800 bg-[#4472C4] px-3 py-2 text-center text-[11px] font-bold text-white">
                                  {`Q${Math.floor(idx / 3) + 1}`}
                                </TableHead>

                                <TableHead className="sticky top-0 z-20 min-w-[85px] border-r border-white/20 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                                  {m.label}
                                </TableHead>
                              </React.Fragment>
                            );
                          }

                          return (
                            <TableHead
                              key={m.key}
                              className="sticky top-0 z-20 min-w-[85px] border-r border-white/20 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white"
                            >
                              {m.label}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>

                    <TableBody>{rows}</TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* =======================================================
              BOTTOM EXCEL-LIKE STATUS BAR
          ======================================================= */}
          <div className="flex h-7 shrink-0 items-center justify-between border-t border-slate-300 bg-[#f8f9fa] px-3 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>Ready</span>

              <span className="hidden sm:inline">Scroll to view more</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Zoom</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={decreaseZoom}
                  disabled={zoom <= MIN_ZOOM}
                  className="flex h-5 w-5 items-center justify-center rounded-sm border border-slate-300 bg-white hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                  title="Zoom out"
                >
                  <Minus className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onClick={resetZoom}
                  className="min-w-[42px] rounded-sm border border-slate-300 bg-white px-1.5 py-0.5 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  {zoom}%
                </button>

                <button
                  type="button"
                  onClick={increaseZoom}
                  disabled={zoom >= MAX_ZOOM}
                  className="flex h-5 w-5 items-center justify-center rounded-sm border border-slate-300 bg-white hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                  title="Zoom in"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withPermission(MonitoringTablePage, [
  "Apr.view/list",
  "Apr.download",
  "Apr.validate",
  "Apr.review",
  "Apr.mark_as_reviewed",
]);
