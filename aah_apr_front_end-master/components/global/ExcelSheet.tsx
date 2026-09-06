"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Maximize2, Minimize2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

import { useProjectContext } from "@/app/(main)/projects/create_new_project/page";
import { Dessaggregation as DessaggregationType } from "@/app/(main)/projects/types/Types";
import { Outcome as OutcomeType } from "@/app/(main)/projects/types/Types";
import { Output as OutputType } from "@/app/(main)/projects/types/Types";
import { Indicator as IndicatorType } from "@/app/(main)/projects/types/Types";
import { useProjectEditContext } from "@/app/(main)/projects/edit_project/[id]/page";
import { useProjectShowContext } from "@/app/(main)/projects/project_show/[id]/page";
import { IsCreateMode, IsShowMode } from "@/constants/Constants";
import { MonitoringTablePageInterface } from "@/interfaces/Interfaces";

// --- Types ---
type Disaggregation = { name: string; target: number; province?: string };
type Indicator_ = {
  code: string;
  name: string;
  target: number;
  isSub: boolean;
  disaggregation: Disaggregation[];
};
type Output = { name: string; indicators: Indicator_[] };
type Outcome = { name: string; outputs: Output[] };
export type AprData = { impact: string; outcomes: Outcome[] };

const MonitoringTablePage: React.FC<MonitoringTablePageInterface> = ({
  mode,
}) => {
  const contextData = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();

  const {
    outcomes,
    projectGoal,
    outputs,
    indicators,
    dessaggregations,
    projectProvinces,
  } = contextData as {
    outcomes: OutcomeType[];
    outputs: OutputType[];
    indicators: IndicatorType[];
    dessaggregations: DessaggregationType[];
    projectGoal: string;
    projectProvinces: string[];
  };

  // --- State & Refs ---
  const [selectedProvince, setSelectedProvince] = useState<string>("Master");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // --- Transform Data ---
  const finalDataForAprPreview: AprData = useMemo(() => {
    return {
      impact: projectGoal,
      outcomes: outcomes.map((outcome) => ({
        name: outcome.outcome,
        outputs: outputs
          .filter((output) => output.outcomeId === outcome.id)
          .map((output) => ({
            name: output.output,
            indicators: indicators
              .filter((indicator) => indicator.outputRef === output.outputRef)
              .flatMap((indicator) => {
                const main = {
                  code: indicator.indicatorRef,
                  name: indicator.indicator,
                  target: indicator.target,
                  isSub: false,
                  disaggregation: dessaggregations
                    .filter((d) => d.indicatorRef === indicator.indicatorRef)
                    .map((d) => ({
                      name: `${d.dessaggration} (${d.province})`,
                      target: d.target,
                      province: d.province,
                    })),
                };

                let sub = null;
                if (indicator.subIndicator != null) {
                  sub = {
                    code: indicator.indicatorRef,
                    name: indicator.subIndicator.name,
                    target: indicator.subIndicator.target,
                    isSub: true,
                    disaggregation: dessaggregations
                      .filter(
                        (d) =>
                          d.indicatorRef === `sub-${indicator.indicatorRef}`
                      )
                      .map((d) => ({
                        name: `${d.dessaggration} (${d.province})`,
                        target: d.target,
                        province: d.province,
                      })),
                  };
                }

                return sub ? [main, sub] : [main];
              }),
          })),
      })),
    };
  }, [outcomes, outputs, indicators, dessaggregations, projectGoal]);

  // --- Fullscreen Handler ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && sheetRef.current) {
      sheetRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => console.error(err));
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => console.error(err));
    }
  };

  // --- Table Layout Calculations ---
  const filterDisaggregation = (dis: Disaggregation[]) =>
    dis.filter(
      (d) =>
        selectedProvince === "Master" ||
        d.province?.trim().toLowerCase() ===
          selectedProvince.trim().toLowerCase()
    );

  const rowsPerIndicator = (ind: Indicator_) =>
    1 + filterDisaggregation(ind.disaggregation).length;

  const rowsPerOutput = (out: Output) =>
    out.indicators.reduce((s, ind) => s + rowsPerIndicator(ind), 0);

  const rowsPerOutcome = (oc: Outcome) =>
    oc.outputs.reduce((s, out) => s + rowsPerOutput(out), 0);

  const totalRows = finalDataForAprPreview.outcomes.reduce(
    (s, oc) => s + rowsPerOutcome(oc),
    0
  );
  // --- Generate Rows Array ---
  const rows: React.ReactNode[] = [];

  finalDataForAprPreview.outcomes.forEach((outcome, oIndex) => {
    const outcomeRowSpan = rowsPerOutcome(outcome);
    outcome.outputs.forEach((output, opIndex) => {
      const outputRowSpan = rowsPerOutput(output);

      output.indicators
        .filter((ind) => filterDisaggregation(ind.disaggregation).length > 0)
        .forEach((indicator, iIndex) => {
          const filteredDisaggregation = filterDisaggregation(
            indicator.disaggregation
          );
          const showImpact = oIndex === 0 && opIndex === 0 && iIndex === 0;
          const showOutcome = opIndex === 0 && iIndex === 0;
          const showOutput = iIndex === 0;

          rows.push(
            <TableRow
              key={`main-${oIndex}-${opIndex}-${iIndex}`}
              className="hover:bg-muted/40 transition-colors"
            >
              {showImpact && (
                <TableCell
                  rowSpan={totalRows}
                  className="text-xs font-semibold whitespace-normal break-words border-r border-border align-middle text-center py-3 px-3 bg-muted/20"
                >
                  {finalDataForAprPreview.impact}
                </TableCell>
              )}

              {showOutcome && (
                <TableCell
                  rowSpan={outcomeRowSpan}
                  className="text-xs font-medium whitespace-normal break-words border-r border-border align-middle text-center py-3 px-3 bg-muted/10"
                >
                  {outcome.name === "NO-OUTCOME" ? "" : outcome.name}
                </TableCell>
              )}

              {showOutput && (
                <TableCell
                  rowSpan={outputRowSpan}
                  className="text-xs whitespace-normal break-words border-r border-border align-middle text-center py-3 px-3"
                >
                  {output.name}
                </TableCell>
              )}

              <TableCell className="text-xs whitespace-normal break-words border-r border-border py-3 px-3">
                <div className="font-bold text-primary tracking-wide mb-0.5">
                  {indicator.code}
                </div>
                <div className="text-muted-foreground leading-relaxed">
                  {indicator.name}
                </div>
              </TableCell>

              <TableCell className="text-right font-bold text-xs py-3 px-4 tabular-nums border-r border-border">
                {indicator.target}
              </TableCell>
            </TableRow>
          );

          filteredDisaggregation.forEach((d, dIndex) => {
            const isLastDisaggregation =
              dIndex === filteredDisaggregation.length - 1;
            const borderClass =
              !indicator.isSub && isLastDisaggregation
                ? "border-b-2 border-border/80"
                : "border-b border-border/40";

            rows.push(
              <TableRow
                key={`dis-${oIndex}-${opIndex}-${iIndex}-${dIndex}`}
                className={cn(
                  borderClass,
                  "bg-muted/5 hover:bg-muted/30 transition-colors"
                )}
              >
                <TableCell className="text-[11px] text-muted-foreground border-r border-border pl-8 py-1.5 italic">
                  ↳ {d.name}
                </TableCell>
                <TableCell className="text-right text-[11px] font-medium py-1.5 px-4 tabular-nums text-muted-foreground">
                  {d.target}
                </TableCell>
              </TableRow>
            );
          });
        });
    });
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Bar Actions */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Monitoring Framework
          </h2>
          <p className="text-xs text-muted-foreground">
            Track results, outputs, and geographical breakdown targets.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="flex items-center gap-2 shadow-sm"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
        </Button>
      </div>

      {/* Main Container Wrapper */}
      <div
        ref={sheetRef}
        className={cn(
          "space-y-6 transition-all duration-200",
          isFullscreen
            ? "bg-background p-8 overflow-y-auto h-full w-full"
            : "rounded-xl"
        )}
      >
        {/* Modern Filter Segment Control */}
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground whitespace-nowrap">
              <Filter className="h-3.5 w-3.5 text-primary" />
              Filter by Province:
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Master Option */}
              <label
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none shadow-sm",
                  selectedProvince === "Master"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-muted text-foreground border-border"
                )}
              >
                <Checkbox
                  checked={selectedProvince === "Master"}
                  onCheckedChange={() => setSelectedProvince("Master")}
                  className="sr-only"
                />
                Master View
              </label>

              {/* Dynamic Provinces */}
              {projectProvinces.map((province) => (
                <label
                  key={province}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none shadow-sm",
                    selectedProvince === province
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted text-foreground border-border"
                  )}
                >
                  <Checkbox
                    checked={selectedProvince === province}
                    onCheckedChange={() => setSelectedProvince(province)}
                    className="sr-only"
                  />
                  {province}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Beautiful Modern Data Table */}
        <Card className="shadow-md border-border/80 overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-600 dark:hover:bg-emerald-700 border-b border-emerald-700">
                    <TableHead className="border-r border-emerald-500/30 text-center py-3 px-3 text-white font-semibold">
                      Impact / Goal (LFA)
                    </TableHead>
                    <TableHead className="border-r border-emerald-500/30 text-center py-3 px-3 text-white font-semibold">
                      Result / Outcome
                    </TableHead>
                    <TableHead className="border-r border-emerald-500/30 text-center py-3 px-3 text-white font-semibold">
                      Outputs
                    </TableHead>
                    <TableHead className="border-r border-emerald-500/30 text-center py-3 px-3 text-white font-semibold">
                      Indicators
                    </TableHead>
                    <TableHead className="text-right py-3 px-4 text-white font-semibold">
                      Target
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground text-xs"
                      >
                        No data available matching your selected criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringTablePage;
