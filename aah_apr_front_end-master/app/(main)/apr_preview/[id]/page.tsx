"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Search,
  X,
  Filter,
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

type Isp3Indicator = {
  indicatorRef: string;
  indicator: string;
  disaggregation: Disaggregation[];
};

type Isp3 = {
  isp3: string;
  indicators: Isp3Indicator[];
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
    start_date?: string;
    outcomes: Outcome[];
    isp3s: Isp3[];
  }>({
    impact: "",
    projectCode: "",
    projectManager: "",
    projectStartDate: "",
    projectEndDate: "",
    start_date: "",
    outcomes: [],
    isp3s: [],
  });

  /*
   * =========================================================
   * SEARCH / FILTER STATE
   * =========================================================
   */

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOutcome, setSelectedOutcome] = useState("all");

  const [selectedOutput, setSelectedOutput] = useState("all");

  const [selectedIndicator, setSelectedIndicator] = useState("all");

  const [selectedProvince, setSelectedProvince] = useState("all");

  /*
   * =========================================================
   * UI-ONLY STATE
   * =========================================================
   */

  const [zoom, setZoom] = useState<number>(100);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  /*
   * =========================================================
   * FETCH DATA
   * =========================================================
   */

  useEffect(() => {
    requestHandler()
      .get(`/apr_management/show_apr/${id}`)
      .then((response: any) => {
        const d = response.data.data;

        console.log(d);

        setData(d);

        if (!d.start_date) return;

        let firstMonths: number[] | undefined;

        /*
         * Try Outcomes first.
         */
        firstMonths =
          d.outcomes?.[0]?.outputs?.[0]?.indicators?.[0]?.disaggregation?.[0]
            ?.months;

        /*
         * If there are no Outcomes,
         * try ISP3.
         */
        if (!firstMonths?.length) {
          firstMonths =
            d.isp3s?.[0]?.indicators?.[0]?.disaggregation?.[0]?.months;
        }

        if (!firstMonths?.length) return;

        const monthCount = firstMonths.length;

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
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || error.message,
          "error"
        )
      );
  }, []);

  /*
   * =========================================================
   * PROVINCE HELPER
   * =========================================================
   *
   * Supports:
   * province
   * province_name
   * provinceName
   * province.name
   * province.title
   * province.label
   * location.province
   */

  const getProvince = (item: any): string => {
    if (!item) return "";

    const directProvince = item?.province;

    if (typeof directProvince === "string") {
      return directProvince;
    }

    if (directProvince && typeof directProvince === "object") {
      return (
        directProvince?.name ||
        directProvince?.title ||
        directProvince?.label ||
        ""
      );
    }

    if (typeof item?.province_name === "string") {
      return item.province_name;
    }

    if (typeof item?.provinceName === "string") {
      return item.provinceName;
    }

    const locationProvince = item?.location?.province;

    if (typeof locationProvince === "string") {
      return locationProvince;
    }

    if (locationProvince && typeof locationProvince === "object") {
      return (
        locationProvince?.name ||
        locationProvince?.title ||
        locationProvince?.label ||
        ""
      );
    }

    return "";
  };

  /*
   * =========================================================
   * SEARCH HELPER
   * =========================================================
   */

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesSearch = (...values: unknown[]) => {
    if (!normalizedSearch) return false;

    return values.some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  };

  /*
   * =========================================================
   * FILTER OPTIONS
   * =========================================================
   */

  const outcomeOptions = useMemo(() => {
    return Array.from(
      new Set(
        data.outcomes.map((outcome) => outcome.name?.trim()).filter(Boolean)
      )
    );
  }, [data.outcomes]);

  const outputOptions = useMemo(() => {
    return Array.from(
      new Set(
        data.outcomes.flatMap(
          (outcome) =>
            outcome.outputs
              ?.map((output) => output.name?.trim())
              .filter(Boolean) || []
        )
      )
    );
  }, [data.outcomes]);

  const indicatorOptions = useMemo(() => {
    const indicators = data.outcomes.flatMap((outcome) =>
      outcome.outputs.flatMap((output) =>
        output.indicators.map((indicator) => ({
          value: indicator.code,
          label: `${indicator.code} — ${indicator.name}`,
        }))
      )
    );

    const isp3Indicators = data.isp3s.flatMap((isp3) =>
      isp3.indicators.map((indicator) => ({
        value: indicator.indicatorRef,
        label: `${indicator.indicatorRef} — ${indicator.indicator}`,
      }))
    );

    const combined = [...indicators, ...isp3Indicators];

    const unique = new Map<
      string,
      {
        value: string;
        label: string;
      }
    >();

    combined.forEach((item) => {
      if (item.value && !unique.has(item.value)) {
        unique.set(item.value, item);
      }
    });

    return Array.from(unique.values());
  }, [data.outcomes, data.isp3s]);

  const provinceOptions = useMemo(() => {
    const provinces = new Set<string>();

    const dataProvince = getProvince(data as any);

    if (dataProvince) {
      provinces.add(dataProvince);
    }

    data.outcomes.forEach((outcome) => {
      const outcomeProvince = getProvince(outcome);

      if (outcomeProvince) {
        provinces.add(outcomeProvince);
      }

      outcome.outputs.forEach((output) => {
        const outputProvince = getProvince(output);

        if (outputProvince) {
          provinces.add(outputProvince);
        }

        output.indicators.forEach((indicator) => {
          const indicatorProvince = getProvince(indicator);

          if (indicatorProvince) {
            provinces.add(indicatorProvince);
          }

          indicator.disaggregation.forEach((disaggregation) => {
            const disProvince = getProvince(disaggregation);

            if (disProvince) {
              provinces.add(disProvince);
            }
          });
        });
      });
    });

    data.isp3s.forEach((isp3) => {
      const isp3Province = getProvince(isp3);

      if (isp3Province) {
        provinces.add(isp3Province);
      }

      isp3.indicators.forEach((indicator) => {
        const indicatorProvince = getProvince(indicator);

        if (indicatorProvince) {
          provinces.add(indicatorProvince);
        }

        indicator.disaggregation.forEach((disaggregation) => {
          const disProvince = getProvince(disaggregation);

          if (disProvince) {
            provinces.add(disProvince);
          }
        });
      });
    });

    return Array.from(provinces).sort((a, b) => a.localeCompare(b));
  }, [data]);

  /*
   * =========================================================
   * FILTERED OUTCOMES
   * =========================================================
   */

  const filteredOutcomes = useMemo(() => {
    return data.outcomes
      .map((outcome) => {
        /*
         * Outcome filter
         */

        if (selectedOutcome !== "all" && outcome.name !== selectedOutcome) {
          return null;
        }

        const outcomeProvince = getProvince(outcome);

        const outcomeSearchMatch = matchesSearch(outcome.name, outcomeProvince);

        const filteredOutputs = outcome.outputs
          .map((output) => {
            /*
             * Output filter
             */

            if (selectedOutput !== "all" && output.name !== selectedOutput) {
              return null;
            }

            const outputProvince = getProvince(output);

            const outputSearchMatch = matchesSearch(
              output.name,
              outputProvince
            );

            const filteredIndicators = output.indicators.filter((indicator) => {
              /*
               * Indicator filter
               */

              if (
                selectedIndicator !== "all" &&
                indicator.code !== selectedIndicator
              ) {
                return false;
              }

              /*
               * Province matching
               */

              const indicatorProvince = getProvince(indicator);

              const disaggregationProvinces = indicator.disaggregation
                .map((disaggregation) => getProvince(disaggregation))
                .filter(Boolean);

              const provinceMatches =
                selectedProvince === "all" ||
                outcomeProvince === selectedProvince ||
                outputProvince === selectedProvince ||
                indicatorProvince === selectedProvince ||
                disaggregationProvinces.includes(selectedProvince);

              if (!provinceMatches) {
                return false;
              }

              /*
               * Search matching
               */

              if (!normalizedSearch) {
                return true;
              }

              const indicatorSearchMatch = matchesSearch(
                indicator.code,
                indicator.name,
                indicatorProvince,
                ...disaggregationProvinces,
                ...indicator.disaggregation.map((d) => d.name)
              );

              /*
               * If parent Outcome
               * or Output matches,
               * keep all its indicators.
               *
               * Otherwise only matching
               * indicators are shown.
               */

              return (
                outcomeSearchMatch || outputSearchMatch || indicatorSearchMatch
              );
            });

            if (filteredIndicators.length === 0) {
              return null;
            }

            return {
              ...output,
              indicators: filteredIndicators,
            };
          })
          .filter((output): output is Output => output !== null);

        if (filteredOutputs.length === 0) {
          return null;
        }

        return {
          ...outcome,
          outputs: filteredOutputs,
        };
      })
      .filter((outcome): outcome is Outcome => outcome !== null);
  }, [
    data.outcomes,
    selectedOutcome,
    selectedOutput,
    selectedIndicator,
    selectedProvince,
    normalizedSearch,
  ]);

  /*
   * =========================================================
   * FILTERED ISP3
   * =========================================================
   */

  const filteredIsp3s = useMemo(() => {
    /*
     * Outcome or Output filters do not
     * belong to ISP3, therefore ISP3 is
     * hidden when either one is selected.
     */

    if (selectedOutcome !== "all" || selectedOutput !== "all") {
      return [];
    }

    return data.isp3s
      .map((isp3) => {
        const isp3Province = getProvince(isp3);

        const isp3SearchMatch = matchesSearch(isp3.isp3, isp3Province);

        const filteredIndicators = isp3.indicators.filter((indicator) => {
          /*
           * Indicator filter
           */

          if (
            selectedIndicator !== "all" &&
            indicator.indicatorRef !== selectedIndicator
          ) {
            return false;
          }

          /*
           * Province
           */

          const indicatorProvince = getProvince(indicator);

          const disaggregationProvinces = indicator.disaggregation
            .map((d) => getProvince(d))
            .filter(Boolean);

          const provinceMatches =
            selectedProvince === "all" ||
            isp3Province === selectedProvince ||
            indicatorProvince === selectedProvince ||
            disaggregationProvinces.includes(selectedProvince);

          if (!provinceMatches) {
            return false;
          }

          /*
           * Search
           */

          if (!normalizedSearch) {
            return true;
          }

          const indicatorSearchMatch = matchesSearch(
            indicator.indicatorRef,
            indicator.indicator,
            indicatorProvince,
            ...disaggregationProvinces,
            ...indicator.disaggregation.map((d) => d.name)
          );

          return isp3SearchMatch || indicatorSearchMatch;
        });

        if (filteredIndicators.length === 0) {
          return null;
        }

        return {
          ...isp3,
          indicators: filteredIndicators,
        };
      })
      .filter((isp3): isp3 is Isp3 => isp3 !== null);
  }, [
    data.isp3s,
    selectedOutcome,
    selectedOutput,
    selectedIndicator,
    selectedProvince,
    normalizedSearch,
  ]);

  /*
   * =========================================================
   * FILTER STATE
   * =========================================================
   */

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedOutcome !== "all" ||
    selectedOutput !== "all" ||
    selectedIndicator !== "all" ||
    selectedProvince !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedOutcome("all");
    setSelectedOutput("all");
    setSelectedIndicator("all");
    setSelectedProvince("all");
  };

  /*
   * =========================================================
   * ROW CALCULATIONS FOR OUTCOMES
   * =========================================================
   */

  const rowsPerIndicator = (ind: Indicator) => 1 + ind.disaggregation.length;

  const rowsPerOutput = (out: Output) =>
    out.indicators.reduce(
      (sum, indicator) => sum + rowsPerIndicator(indicator),
      0
    );

  const rowsPerOutcome = (outcome: Outcome) =>
    outcome.outputs.reduce((sum, output) => sum + rowsPerOutput(output), 0);

  const totalRows = filteredOutcomes.reduce(
    (sum, outcome) => sum + rowsPerOutcome(outcome),
    0
  );

  /*
   * =========================================================
   * ALL TABLE ROWS
   * =========================================================
   */

  const rows: React.ReactNode[] = [];

  /*
   * =========================================================
   * OUTCOMES SECTION
   * =========================================================
   */

  filteredOutcomes.forEach((outcome, oIndex) => {
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

        /*
         * ENACT SPECIAL CASE
         */

        if (isEnact) {
          const dm1 = indicator.disaggregation[0]?.months || [];

          const dm2 = indicator.disaggregation[1]?.months || [];

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

          /*
           * Monthly Labels
           */

          for (let i = 0; i < monthCount; i++) {
            const ratio = dm2Ensured[i] / (dm1Ensured[i] * 60 || 1);

            let label = "";

            if (ratio >= 0.95) {
              label = "Excellent Performance";
            } else if (ratio >= 0.75) {
              label = "Good Performance";
            } else if (ratio >= 0.65) {
              label = "Fair Performance";
            } else if (ratio >= 0.5) {
              label = "Needs Improvement";
            } else {
              label = "Poor Performance";
            }

            eachMonthLabel.push(label);
          }

          /*
           * Quarterly Labels
           */

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

            if (quarterAvg >= 0.95) {
              label = "Excellent Performance";
            } else if (quarterAvg >= 0.75) {
              label = "Good Performance";
            } else if (quarterAvg >= 0.65) {
              label = "Fair Performance";
            } else if (quarterAvg >= 0.5) {
              label = "Needs Improvement";
            } else {
              label = "Poor Performance";
            }

            eachQuarterLabel.push(label);
          }

          monthsSum = eachMonthLabel;

          totalAchievement = eachMonthLabel.length;

          percentAchieved = "-";
        } else {
          monthsSum = timeline.map((_, monthIndex) =>
            indicator.disaggregation.reduce(
              (sum, disaggregation) =>
                sum + (disaggregation.months?.[monthIndex] || 0),
              0
            )
          ) as number[];

          const totalTarget = indicator.disaggregation.reduce(
            (sum, disaggregation) => sum + (disaggregation.target || 0),
            0
          );

          totalAchievement = (monthsSum as number[]).reduce((a, b) => a + b, 0);

          percentAchieved = totalTarget
            ? ((totalAchievement / totalTarget) * 100).toFixed(2)
            : "0";
        }

        /*
         * MONTH + QUARTER CELLS
         */

        const monthQuarterCells: React.ReactNode[] = [];

        for (let i = 0; i < monthsSum.length; i += 3) {
          const chunk = monthsSum.slice(i, i + 3);

          /*
           * Quarter Cell
           */

          if (chunk.length === 3) {
            monthQuarterCells.push(
              <TableCell
                key={`q-${oIndex}-${opIndex}-${iIndex}-${i / 3}`}
                className="border-r border-slate-300 bg-[#dbeafe] text-center text-xs font-semibold text-blue-900 dark:border-slate-600 dark:bg-blue-950 dark:text-blue-200"
              >
                {isEnact
                  ? eachQuarterLabel[i / 3]
                  : chunk.reduce(
                      (a, b) =>
                        (typeof a === "number" ? a : 0) +
                        (typeof b === "number" ? b : 0),
                      0
                    )}
              </TableCell>
            );
          }

          /*
           * Month Cells
           */

          chunk.forEach((value, monthIndex) => {
            monthQuarterCells.push(
              <TableCell
                key={`m-${oIndex}-${opIndex}-${iIndex}-${i + monthIndex}`}
                className="border-r border-slate-300 bg-white text-center text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                {value}
              </TableCell>
            );
          });
        }

        /*
         * MAIN INDICATOR ROW
         */

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
              {indicator.disaggregation.reduce(
                (sum, disaggregation) => sum + disaggregation.target,
                0
              )}
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

        /*
         * DISAGGREGATIONS
         */

        indicator.disaggregation.forEach(
          (disaggregation, disaggregationIndex) => {
            const disMonthQuarterCells: React.ReactNode[] = [];

            for (let i = 0; i < (disaggregation.months?.length || 0); i += 3) {
              const quarterChunk = disaggregation.months?.slice(i, i + 3) || [];

              if (quarterChunk.length === 3) {
                const quarterValue = quarterChunk.reduce((a, b) => a + b, 0);

                disMonthQuarterCells.push(
                  <TableCell
                    key={`dis-q-${oIndex}-${opIndex}-${iIndex}-${disaggregationIndex}-${
                      i / 3
                    }`}
                    className="border-r border-slate-300 bg-[#eff6ff] text-center text-xs font-medium text-blue-800 dark:border-slate-600 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    {quarterValue}
                  </TableCell>
                );
              }

              disaggregation.months
                ?.slice(i, i + 3)
                .forEach((month, monthIndex) => {
                  disMonthQuarterCells.push(
                    <TableCell
                      key={`dis-m-${oIndex}-${opIndex}-${iIndex}-${disaggregationIndex}-${
                        i + monthIndex
                      }`}
                      className="border-r border-slate-300 bg-white text-center text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                    >
                      {month}
                    </TableCell>
                  );
                });
            }

            rows.push(
              <TableRow
                key={`dis-${oIndex}-${opIndex}-${iIndex}-${disaggregationIndex}`}
                className="border-b border-slate-200 bg-white hover:bg-[#fafafa] dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <TableCell className="min-w-[280px] border-r border-slate-300 bg-[#fafafa] py-2 pl-8 pr-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />

                    <span>{disaggregation.name}</span>
                  </div>
                </TableCell>

                <TableCell className="min-w-[100px] border-r border-slate-300 text-center text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                  {disaggregation.target}
                </TableCell>

                <TableCell className="min-w-[130px] border-r border-slate-300 text-center text-xs font-medium text-green-700 dark:border-slate-700 dark:text-green-400">
                  {disaggregation.months?.reduce((a, b) => a + b, 0) || 0}
                </TableCell>

                <TableCell className="min-w-[110px] border-r border-slate-300 text-center text-xs font-medium text-amber-700 dark:border-slate-700 dark:text-amber-400">
                  {disaggregation.target
                    ? (
                        ((disaggregation.months?.reduce((a, b) => a + b, 0) ||
                          0) /
                          disaggregation.target) *
                        100
                      ).toFixed(2)
                    : "0"}
                  %
                </TableCell>

                {disMonthQuarterCells}
              </TableRow>
            );
          }
        );
      });
    });
  });

  /*
   * =========================================================
   * ISP3 SECTION
   * =========================================================
   */

  if (filteredIsp3s?.length > 0) {
    /*
     * Calculate dynamic timeline columns.
     */

    const timelineColumnCount = timeline.reduce(
      (total, _, index) => total + (index % 3 === 0 ? 2 : 1),
      0
    );

    /*
     * 7 fixed columns:
     *
     * Impact
     * Outcome
     * Output
     * Indicator
     * Target
     * Achievement
     * Percent
     */

    const totalColumns = 7 + timelineColumnCount;

    /*
     * ISP3 SECTION TITLE
     */

    rows.push(
      <TableRow
        key="isp3-section-title"
        className="border-y-2 border-slate-500"
      >
        <TableCell
          colSpan={totalColumns}
          className="bg-[#1e3a5f] px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.25em] text-white dark:bg-blue-950"
        >
          ISP3
        </TableCell>
      </TableRow>
    );

    /*
     * =======================================================
     * ISP3 DATA
     * =======================================================
     */

    filteredIsp3s.forEach((isp3, isp3Index) => {
      /*
       * ISP3 total rows.
       *
       * Each Indicator = 1 row.
       * Each Disaggregation = 1 row.
       */

      const isp3RowSpan = isp3.indicators.reduce(
        (sum, indicator) => sum + 1 + indicator.disaggregation.length,
        0
      );

      isp3.indicators.forEach((indicator, indicatorIndex) => {
        let monthsSum: (number | string)[] = [];

        let totalAchievement = 0;

        let percentAchieved: string | number = 0;

        /*
         * SPECIAL ENACT CASE
         */

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

        /*
         * ENACT CALCULATIONS
         */

        if (isEnact) {
          const dm1 = indicator.disaggregation[0]?.months || [];

          const dm2 = indicator.disaggregation[1]?.months || [];

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

          /*
           * Monthly Labels
           */

          for (let i = 0; i < monthCount; i++) {
            const ratio = dm2Ensured[i] / (dm1Ensured[i] * 60 || 1);

            let label = "";

            if (ratio >= 0.95) {
              label = "Excellent Performance";
            } else if (ratio >= 0.75) {
              label = "Good Performance";
            } else if (ratio >= 0.65) {
              label = "Fair Performance";
            } else if (ratio >= 0.5) {
              label = "Needs Improvement";
            } else {
              label = "Poor Performance";
            }

            eachMonthLabel.push(label);
          }

          /*
           * Quarterly Labels
           */

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

            if (quarterAvg >= 0.95) {
              label = "Excellent Performance";
            } else if (quarterAvg >= 0.75) {
              label = "Good Performance";
            } else if (quarterAvg >= 0.65) {
              label = "Fair Performance";
            } else if (quarterAvg >= 0.5) {
              label = "Needs Improvement";
            } else {
              label = "Poor Performance";
            }

            eachQuarterLabel.push(label);
          }

          monthsSum = eachMonthLabel;

          totalAchievement = eachMonthLabel.length;

          percentAchieved = "-";
        } else {
          /*
           * NORMAL ISP3 CALCULATIONS
           */
          monthsSum = timeline.map((_, monthIndex) =>
            indicator.disaggregation.reduce(
              (sum, disaggregation) =>
                sum + (disaggregation.months?.[monthIndex] || 0),
              0
            )
          ) as number[];

          const totalTarget = indicator.disaggregation.reduce(
            (sum, disaggregation) => sum + (disaggregation.target || 0),
            0
          );

          totalAchievement = (monthsSum as number[]).reduce((a, b) => a + b, 0);

          percentAchieved = totalTarget
            ? ((totalAchievement / totalTarget) * 100).toFixed(2)
            : "0";
        }

        /*
         * =================================================
         * MONTH + QUARTER CELLS
         * =================================================
         */

        const monthQuarterCells: React.ReactNode[] = [];

        for (let i = 0; i < monthsSum.length; i += 3) {
          const chunk = monthsSum.slice(i, i + 3);

          /*
           * Quarter Cell
           */

          if (chunk.length === 3) {
            monthQuarterCells.push(
              <TableCell
                key={`isp3-q-${isp3Index}-${indicatorIndex}-${i / 3}`}
                className="border-r border-slate-300 bg-[#dbeafe] text-center text-xs font-semibold text-blue-900 dark:border-slate-600 dark:bg-blue-950 dark:text-blue-200"
              >
                {isEnact
                  ? eachQuarterLabel[i / 3]
                  : chunk.reduce(
                      (a, b) =>
                        (typeof a === "number" ? a : 0) +
                        (typeof b === "number" ? b : 0),
                      0
                    )}
              </TableCell>
            );
          }

          /*
           * Month Cells
           */

          chunk.forEach((value, monthIndex) => {
            monthQuarterCells.push(
              <TableCell
                key={`isp3-m-${isp3Index}-${indicatorIndex}-${i + monthIndex}`}
                className="border-r border-slate-300 bg-white text-center text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                {value}
              </TableCell>
            );
          });
        }

        /*
         * =================================================
         * ISP3 MAIN INDICATOR ROW
         * =================================================
         */

        rows.push(
          <TableRow
            key={`isp3-main-${isp3Index}-${indicatorIndex}`}
            className="border-b border-slate-300 bg-white hover:bg-[#f8fbff] dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
          >
            {indicatorIndex === 0 && (
              <TableCell
                colSpan={3}
                rowSpan={isp3RowSpan}
                className="min-w-[660px] border-r border-slate-400 bg-[#eef2ff] px-5 py-4 text-center align-middle text-[12px] font-semibold leading-6 text-slate-700 dark:border-slate-600 dark:bg-indigo-950/40 dark:text-slate-300"
              >
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                  ISP3
                </div>

                <div title={isp3.isp3} className="mx-auto max-w-[550px]">
                  {isp3.isp3}
                </div>
              </TableCell>
            )}

            <TableCell className="min-w-[280px] max-w-[400px] border-r border-slate-400 bg-[#eff6ff] px-3 py-3 text-center align-middle dark:border-slate-600 dark:bg-blue-950/30">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {indicator.indicatorRef}
              </div>

              <div
                title={indicator.indicator}
                className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400"
              >
                {indicator.indicator.length >= 50
                  ? `${indicator.indicator.slice(0, 50)}...`
                  : indicator.indicator}
              </div>
            </TableCell>

            <TableCell className="min-w-[100px] border-r border-slate-400 bg-[#f8fafc] text-center align-middle text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {indicator.disaggregation.reduce(
                (sum, disaggregation) => sum + disaggregation.target,
                0
              )}
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

        /*
         * =================================================
         * ISP3 DISAGGREGATION ROWS
         * =================================================
         */

        indicator.disaggregation.forEach(
          (disaggregation, disaggregationIndex) => {
            const disMonthQuarterCells: React.ReactNode[] = [];

            for (let i = 0; i < (disaggregation.months?.length || 0); i += 3) {
              const quarterChunk = disaggregation.months?.slice(i, i + 3) || [];

              /*
               * Quarter
               */

              if (quarterChunk.length === 3) {
                const quarterValue = quarterChunk.reduce((a, b) => a + b, 0);

                disMonthQuarterCells.push(
                  <TableCell
                    key={`isp3-dis-q-${isp3Index}-${indicatorIndex}-${disaggregationIndex}-${
                      i / 3
                    }`}
                    className="border-r border-slate-300 bg-[#eff6ff] text-center text-xs font-medium text-blue-800 dark:border-slate-600 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    {quarterValue}
                  </TableCell>
                );
              }

              /*
               * Months
               */

              disaggregation.months
                ?.slice(i, i + 3)
                .forEach((month, monthIndex) => {
                  disMonthQuarterCells.push(
                    <TableCell
                      key={`isp3-dis-m-${isp3Index}-${indicatorIndex}-${disaggregationIndex}-${
                        i + monthIndex
                      }`}
                      className="border-r border-slate-300 bg-white text-center text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                    >
                      {month}
                    </TableCell>
                  );
                });
            }

            rows.push(
              <TableRow
                key={`isp3-dis-${isp3Index}-${indicatorIndex}-${disaggregationIndex}`}
                className="border-b border-slate-200 bg-white hover:bg-[#fafafa] dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <TableCell className="min-w-[280px] border-r border-slate-300 bg-[#fafafa] py-2 pl-8 pr-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />

                    <span>{disaggregation.name}</span>
                  </div>
                </TableCell>

                <TableCell className="min-w-[100px] border-r border-slate-300 text-center text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                  {disaggregation.target}
                </TableCell>

                <TableCell className="min-w-[130px] border-r border-slate-300 text-center text-xs font-medium text-green-700 dark:border-slate-700 dark:text-green-400">
                  {disaggregation.months?.reduce((a, b) => a + b, 0) || 0}
                </TableCell>

                <TableCell className="min-w-[110px] border-r border-slate-300 text-center text-xs font-medium text-amber-700 dark:border-slate-700 dark:text-amber-400">
                  {disaggregation.target
                    ? (
                        ((disaggregation.months?.reduce((a, b) => a + b, 0) ||
                          0) /
                          disaggregation.target) *
                        100
                      ).toFixed(2)
                    : "0"}
                  %
                </TableCell>

                {disMonthQuarterCells}
              </TableRow>
            );
          }
        );
      });
    });
  }

  /*
   * =========================================================
   * EMPTY FILTER RESULT
   * =========================================================
   */

  if (hasActiveFilters && rows.length === 0) {
    const timelineColumnCount = timeline.reduce(
      (total, _, index) => total + (index % 3 === 0 ? 2 : 1),
      0
    );

    const totalColumns = 7 + timelineColumnCount;

    rows.push(
      <TableRow key="empty-filter-result">
        <TableCell colSpan={totalColumns} className="h-32 text-center">
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <Search className="h-6 w-6 opacity-50" />

            <span className="text-sm font-medium">
              No matching results found
            </span>

            <span className="text-xs">
              Try changing or clearing your filters.
            </span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  /*
   * =========================================================
   * DOWNLOAD EXCEL
   * =========================================================
   */

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
   * =========================================================
   * ZOOM
   * =========================================================
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
   * =========================================================
   * FULLSCREEN
   * =========================================================
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

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f3f4f6] dark:bg-slate-950">
      <div
        className={`flex h-full w-full flex-col ${
          isFullscreen ? "bg-white dark:bg-slate-950" : ""
        }`}
      >
        {/* =====================================================
            TOP APPLICATION BAR
        ====================================================== */}

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
              onClick={downloadExcel}
              className="h-8 gap-2 rounded-md bg-green-600 px-3 text-xs font-semibold shadow-sm hover:bg-green-700"
            >
              <Download className="h-4 w-4" />

              <span className="hidden sm:inline">Download Excel</span>
            </Button>
          </Can>
        </div>

        {/* =====================================================
            SHEET CONTAINER
        ====================================================== */}

        <div
          ref={sheetRef}
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950"
        >
          {/* ===================================================
              EXCEL-LIKE SHEET TOOLBAR
          ==================================================== */}

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-[#f8f9fa] px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            {/* LEFT */}

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

            {/* RIGHT */}

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 text-[11px] text-slate-500 sm:flex dark:text-slate-400">
                <span>{data.outcomes.length} outcomes</span>

                <span>•</span>

                <span>{data.isp3s.length} ISP3</span>

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

          {/* ===================================================
              SEARCH / FILTER BAR
          ==================================================== */}

          <div className="shrink-0 border-b border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
            <div className="flex min-w-max items-center gap-2 overflow-x-auto px-3 py-2">
              {/* SEARCH */}

              <div className="relative w-[260px] shrink-0">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search outcome, output, indicator..."
                  className="h-8 w-full rounded-md border border-slate-300 bg-white pl-9 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* FILTER ICON */}

              <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-slate-50 px-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </div>

              {/* OUTCOME */}

              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
                className="h-8 w-[190px] shrink-0 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                title="Filter by Outcome"
              >
                <option value="all">All Outcomes</option>

                {outcomeOptions.map((outcome) => (
                  <option key={outcome} value={outcome}>
                    {outcome}
                  </option>
                ))}
              </select>

              {/* OUTPUT */}

              <select
                value={selectedOutput}
                onChange={(e) => setSelectedOutput(e.target.value)}
                className="h-8 w-[190px] shrink-0 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                title="Filter by Output"
              >
                <option value="all">All Outputs</option>

                {outputOptions.map((output) => (
                  <option key={output} value={output}>
                    {output}
                  </option>
                ))}
              </select>

              {/* INDICATOR */}

              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="h-8 w-[260px] shrink-0 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                title="Filter by Indicator"
              >
                <option value="all">All Indicators</option>

                {indicatorOptions.map((indicator) => (
                  <option
                    title={indicator.label}
                    className="text-xs"
                    key={indicator.value}
                    value={indicator.value}
                  >
                    {indicator.label.length > 50
                      ? `${indicator.label.slice(0, 50)}...`
                      : indicator.label}
                  </option>
                ))}
              </select>

              {/* PROVINCE */}

              {provinceOptions.length > 0 && (
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="h-8 w-[170px] shrink-0 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  title="Filter by Province"
                >
                  <option value="all">All Provinces</option>

                  {provinceOptions.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              )}

              {/* CLEAR */}

              {hasActiveFilters && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-8 shrink-0 gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  title="Clear all filters"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* ===================================================
              PROJECT INFO BAR
          ==================================================== */}

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

          {/* ===================================================
              SPREADSHEET VIEWPORT
          ==================================================== */}

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

                        {timeline.map((month, index) => {
                          if (index % 3 === 0) {
                            return (
                              <React.Fragment key={month.key}>
                                <TableHead className="sticky top-0 z-20 min-w-[150px] border-r border-green-800 bg-[#4472C4] px-3 py-2 text-center text-[11px] font-bold text-white">
                                  {`Q${Math.floor(index / 3) + 1}`}
                                </TableHead>

                                <TableHead className="sticky top-0 z-20 min-w-[85px] border-r border-white/20 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white">
                                  {month.label}
                                </TableHead>
                              </React.Fragment>
                            );
                          }

                          return (
                            <TableHead
                              key={month.key}
                              className="sticky top-0 z-20 min-w-[85px] border-r border-white/20 bg-[#217346] px-3 py-2 text-center text-[11px] font-bold text-white"
                            >
                              {month.label}
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

          {/* ===================================================
              BOTTOM STATUS BAR
          ==================================================== */}

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
