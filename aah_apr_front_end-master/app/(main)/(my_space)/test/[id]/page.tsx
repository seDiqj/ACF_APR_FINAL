"use client";

import { useEffect, useRef, useState } from "react";
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
import { useParentContext } from "@/contexts/ParentContext";
import React from "react";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import * as XLSX from "xlsx";

type Disaggregation = { name: string; target: number; months?: number[] };
type Indicator = {
  code: string;
  name: string;
  disaggregation: Disaggregation[];
  isSub?: boolean;
};
type Output = { name: string; indicators: Indicator[] };
type Outcome = { name: string; outputs: Output[] };

export default function MonitoringTablePage() {
  const exportToExcel = (data: any) => {
    const wb = XLSX.utils.book_new();
    const ws_data: any[][] = [];
    const merges: any[] = [];

    let rowIndex = 1;

    data.outcomes.forEach((outcome: any, oIdx: number) => {
      outcome.outputs.forEach((output: any, opIdx: number) => {
        output.indicators.forEach((indicator: any, iIdx: number) => {
          ws_data.push([
            oIdx === 0 && opIdx === 0 && iIdx === 0 ? data.impact : "", // Impact
            opIdx === 0 && iIdx === 0 ? outcome.name : "", // Outcome
            iIdx === 0 ? output.name : "", // Output
            indicator.code + " - " + indicator.name, // Indicator
          ]);

          if (oIdx === 0 && opIdx === 0 && iIdx === 0) {
            merges.push({
              s: { r: rowIndex, c: 0 },
              e: { r: totalRows - 1, c: 0 },
            });
          }

          if (opIdx === 0 && iIdx === 0) {
            merges.push({
              s: { r: rowIndex, c: 1 },
              e: { r: rowIndex + rowsPerOutcome(outcome) - 1, c: 1 },
            });
          }

          if (iIdx === 0) {
            merges.push({
              s: { r: rowIndex, c: 2 },
              e: { r: rowIndex + rowsPerOutput(output) - 1, c: 2 },
            });
          }

          rowIndex++;
        });
      });
    });

    const ws = XLSX.utils.aoa_to_sheet([
      ["Impact", "Outcome", "Output", "Indicator"],
      ...ws_data,
    ]);
    ws["!merges"] = merges;

    XLSX.utils.book_append_sheet(wb, ws, "Monitoring");
    XLSX.writeFile(wb, "Monitoring.xlsx");
  };

  const { id } = useParams<{
    id: string;
  }>();

  const { axiosInstance, reqForToastAndSetMessage } = useParentContext();
  const provinces = ["Kabul", "Helmand", "Ghor", "Daikunday", "Badakhshan"];
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<{
    impact: string;
    outcomes: Outcome[];
    isp3s: any;
  }>({
    impact: "Vulnerable receiving focused MHPSS care",
    outcomes: [
      {
        name: "Communities have increased access to MHPSS services",
        outputs: [
          {
            name: "Output 1: Hotline & remote services",
            indicators: [
              {
                code: "1.1.1",
                name: "Dedicated hotline - psychosocial support",
                disaggregation: [
                  {
                    name: "# of Male (above 18)",
                    target: 26,
                    months: [5, 8, 13, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "# of Female (above 18)",
                    target: 1188,
                    months: [400, 390, 398, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "# of Male under 18",
                    target: 26,
                    months: [5, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              },
              {
                code: "1.1.2",
                name: "Women friendly spaces - MHPSS sessions",
                disaggregation: [
                  {
                    name: "# of Female (above 18)",
                    target: 1458,
                    months: [450, 500, 508, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "# of Male (above 18)",
                    target: 32,
                    months: [10, 12, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              },
            ],
          },
          {
            name: "Output 2: Community outreach",
            indicators: [
              {
                code: "1.2.1",
                name: "Awareness sessions in schools",
                isSub: true,
                disaggregation: [
                  {
                    name: "Boys",
                    target: 120,
                    months: [40, 40, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "Girls",
                    target: 130,
                    months: [40, 45, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              },
              {
                code: "1.2.2",
                name: "1.21 Awareness sessions of secondary schools",
                isSub: true,
                disaggregation: [
                  {
                    name: "Boys",
                    target: 60,
                    months: [20, 20, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "Girls",
                    target: 65,
                    months: [20, 20, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "Teachers",
                    target: 10,
                    months: [3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "Staff",
                    target: 5,
                    months: [2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "Parents",
                    target: 20,
                    months: [5, 7, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                  {
                    name: "Other",
                    target: 3,
                    months: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    isp3s: [
      {
        isp3: "somthing",
        indicators: [
          {
            indicatorRef: "1.1.1",
            indicator: "Dedicated hotline - psychosocial support",
            disaggregation: [
              {
                name: "# of Male (above 18)",
                target: 26,
                months: [5, 8, 13, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Female (above 18)",
                target: 1188,
                months: [400, 390, 398, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Male under 18",
                target: 26,
                months: [5, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Female under 18",
                target: 26,
                months: [5, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
            ],
          },
          {
            indicatorRef: "1.1.1",
            indicator: "Dedicated hotline - psychosocial support",
            disaggregation: [
              {
                name: "# of Male (above 18)",
                target: 26,
                months: [5, 8, 13, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Female (above 18)",
                target: 1188,
                months: [400, 390, 398, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Male under 18",
                target: 26,
                months: [5, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Female under 18",
                target: 26,
                months: [5, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
            ],
          },
          {
            indicatorRef: "1.1.1",
            indicator: "Dedicated hotline - psychosocial support",
            disaggregation: [
              {
                name: "# of Male (above 18)",
                target: 26,
                months: [5, 8, 13, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Female (above 18)",
                target: 1188,
                months: [400, 390, 398, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Male under 18",
                target: 26,
                months: [5, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              {
                name: "# of Female under 18",
                target: 26,
                months: [5, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
            ],
          },
          ,
        ],
      },
    ],
  });

  useEffect(() => {
    axiosInstance
      .get(`/apr_management/show_apr/${id}`)
      .then((response: any) => {
        console.log(response.data.data);
        setData(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message)
      );
  }, []);

  // helpers
  const rowsPerIndicator = (ind: Indicator) => 1 + ind.disaggregation.length;
  const rowsPerOutput = (out: Output) =>
    out.indicators.reduce((s, ind) => s + rowsPerIndicator(ind), 0);
  const rowsPerOutcome = (oc: Outcome) =>
    oc.outputs.reduce((s, out) => s + rowsPerOutput(out), 0);
  const totalRows = data.outcomes.reduce(
    (s: any, oc: any) => s + rowsPerOutcome(oc),
    0
  );

  const rows: React.ReactNode[] = [];

  data.outcomes.forEach((outcome: any, oIndex: any) => {
    const outcomeRowSpan = rowsPerOutcome(outcome);
    outcome.outputs.forEach((output: any, opIndex: any) => {
      const outputRowSpan = rowsPerOutput(output);
      output.indicators.forEach((indicator: any, iIndex: any) => {
        const indicatorTotal = indicator.disaggregation.reduce(
          (a: any, b: any) => a + b.target,
          0
        );

        const monthsSum = Array.from({ length: 12 }).map((_, m) =>
          indicator.disaggregation.reduce(
            (s: any, d: any) => s + (d.months?.[m] || 0),
            0
          )
        );

        const quarters = [
          monthsSum.slice(0, 3).reduce((a, b) => a + b, 0),
          monthsSum.slice(3, 6).reduce((a, b) => a + b, 0),
          monthsSum.slice(6, 9).reduce((a, b) => a + b, 0),
          monthsSum.slice(9, 12).reduce((a, b) => a + b, 0),
        ];

        const totalAchievement = monthsSum.reduce((a, b) => a + b, 0);
        const percentAchieved = indicatorTotal
          ? ((totalAchievement / indicatorTotal) * 100).toFixed(2)
          : "0";

        const showImpact = oIndex === 0 && opIndex === 0 && iIndex === 0;
        const showOutcome = opIndex === 0 && iIndex === 0;
        const showOutput = iIndex === 0;

        rows.push(
          <TableRow
            key={`main-${oIndex}-${opIndex}-${iIndex}`}
            className="border-b border-slate-400"
          >
            {showImpact && (
              <TableCell
                rowSpan={totalRows}
                className="text-sm font-semibold whitespace-normal border-r border-slate-400 text-center"
              >
                {data.impact}
              </TableCell>
            )}
            {showOutcome && (
              <TableCell
                rowSpan={outcomeRowSpan}
                className="text-sm whitespace-normal border-r border-slate-400 text-center"
              >
                {outcome.name}
              </TableCell>
            )}
            {showOutput && (
              <TableCell
                rowSpan={outputRowSpan}
                className="text-sm whitespace-normal border-r border-slate-400 text-center"
              >
                {output.name}
              </TableCell>
            )}

            {/* Indicator info */}
            <TableCell className="text-sm border-r border-slate-400 bg-blue-400">
              <div className="font-semibold">{indicator.code}</div>
              <div className="text-xs">{indicator.name}</div>
            </TableCell>

            {/* Target */}
            <TableCell className="text-right font-semibold text-sm border-r border-slate-400 bg-blue-400">
              {indicatorTotal}
            </TableCell>

            {/* Total achievement */}
            <TableCell className="text-right font-semibold text-sm border-r border-slate-400 bg-blue-400">
              {totalAchievement}
            </TableCell>

            {/* % achieved */}
            <TableCell className="text-right font-semibold text-sm border-r border-slate-400 bg-blue-400">
              {percentAchieved}%
            </TableCell>

            {/* Quarters */}
            {quarters.map((q, qIndex) => (
              <React.Fragment key={qIndex}>
                {/* Quarter cell */}
                <TableCell className="text-right border-r border-slate-400 text-sm bg-blue-400">
                  {q}
                </TableCell>

                {/* Three months of this quarter */}
                {monthsSum
                  .slice(qIndex * 3, qIndex * 3 + 3)
                  .map((m, mIndex) => (
                    <TableCell
                      key={`${qIndex}-${mIndex}`}
                      className="text-right border-r border-slate-400 text-sm bg-blue-400"
                    >
                      {m}
                    </TableCell>
                  ))}
              </React.Fragment>
            ))}
          </TableRow>
        );

        // Disaggregation rows
        indicator.disaggregation.forEach((d: any, dIndex: any) => {
          rows.push(
            <TableRow
              key={`dis-${oIndex}-${opIndex}-${iIndex}-${dIndex}`}
              className="border-b border-slate-400"
            >
              <TableCell className="text-xs border-r border-slate-400 pl-6">
                {d.name}
              </TableCell>
              <TableCell className="text-right text-xs border-r border-slate-400">
                {d.target}
              </TableCell>
              <TableCell className="text-right text-xs border-r border-slate-400">
                {d.months?.reduce((a: any, b: any) => a + b, 0) || 0}
              </TableCell>
              <TableCell className="text-right text-xs border-r border-slate-400">
                {(
                  ((d.months?.reduce((a: any, b: any) => a + b, 0) || 0) /
                    d.target) *
                  100
                ).toFixed(2)}
                %
              </TableCell>
              {Array.from({ length: 4 }).map((_, qIndex) => {
                const start = qIndex * 3;
                const qMonths = d.months?.slice(start, start + 3) ?? [0, 0, 0];
                const quarterValue = qMonths.reduce(
                  (a: number, b: number) => a + b,
                  0
                );

                return (
                  <React.Fragment
                    key={`dis-${oIndex}-${opIndex}-${iIndex}-${dIndex}-q${qIndex}`}
                  >
                    {/* Quarter cell */}
                    <TableCell className="text-right bg-blue-400 text-xs border-r border-slate-400">
                      {quarterValue}
                    </TableCell>
                    {/* Three months of this quarter */}
                    {qMonths.map((m: number, mIndex: number) => (
                      <TableCell
                        key={`dis-${oIndex}-${opIndex}-${iIndex}-${dIndex}-m${qIndex}-${mIndex}`}
                        className="text-right text-xs border-r border-slate-400"
                      >
                        {m}
                      </TableCell>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableRow>
          );
        });
      });
    });
  });

  return (
    <div className="p-6 space-y-6 overflow-auto w-full h-screen">
      {" "}
      <div className="flex justify-end">
        {" "}
        <Button onClick={() => exportToExcel(data)}>Download Excel</Button>
      </div>
      <div
        ref={sheetRef}
        className="space-y-6 bg-white rounded-md shadow p-4 overflow-auto"
      >
        <h1 className="text-xl font-bold text-center">
          Monitoring &amp; Evaluation Table
        </h1>

        {/* <Card>
          <CardContent className="flex flex-wrap gap-3 p-3">
            {provinces.map((province) => (
              <div key={province} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedProvinces.includes(province)}
                  onCheckedChange={(checked) =>
                    setSelectedProvinces((prev) =>
                      checked
                        ? [...prev, province]
                        : prev.filter((p) => p !== province)
                    )
                  }
                />
                <label className="text-xs">{province}</label>
              </div>
            ))}
          </CardContent>
        </Card> */}

        <Card>
          <CardContent className="p-0 overflow-auto">
            <Table className="min-w-max border-collapse border border-slate-400">
              <TableHeader>
                <TableRow className="bg-green-600 text-white text-sm">
                  <TableHead className="border-r border-white text-center">
                    Impact/Goal (LFA)
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Result/Outcome
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Outputs
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Indicators
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Target
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Total achievement
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    % Achieved
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q1
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Jan
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Feb
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Mar
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q2
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Apr
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    May
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Jun
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q3
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Jul
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Aug
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Sep
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q4
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Oct
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Nov
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Dec
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{rows}</TableBody>
            </Table>

            <Separator className="my-4" />

            <h2 className="text-lg font-bold text-center mb-2">ISP3 Table</h2>

            <Table className="min-w-max border-collapse border border-slate-400">
              <TableHeader>
                <TableRow className="bg-green-600 text-white text-sm">
                  <TableHead className="border-r border-white text-center">
                    ISP3
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Indicator
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Target
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Total achievement
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    % Achieved
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q1
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Jan
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Feb
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Mar
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q2
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Apr
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    May
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Jun
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q3
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Jul
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Aug
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Sep
                  </TableHead>
                  <TableHead className="border-r border-white text-center bg-blue-400">
                    Q4
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Oct
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Nov
                  </TableHead>
                  <TableHead className="border-r border-white text-center">
                    Dec
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.isp3s.map((isp: any, ispIndex: number) => {
                  // محاسبه تعداد کل ردیف‌های ISP3 شامل تمام indicators + disaggregation ها
                  const rowsPerISP3 = isp.indicators.reduce(
                    (sum: number, ind: any) =>
                      sum + 1 + (ind.disaggregation?.length || 0),
                    0
                  );

                  return isp.indicators.map((ind: any, iIndex: number) => {
                    const indicatorTotal = ind.disaggregation.reduce(
                      (a: any, b: any) => a + b.target,
                      0
                    );
                    const monthsSum = Array.from({ length: 12 }).map((_, m) =>
                      ind.disaggregation.reduce(
                        (s: any, d: any) => s + (d.months?.[m] || 0),
                        0
                      )
                    );
                    const quarters = [
                      monthsSum.slice(0, 3).reduce((a: number, b: number) => a + b, 0),
                      monthsSum.slice(3, 6).reduce((a: number, b: number) => a + b, 0),
                      monthsSum.slice(6, 9).reduce((a: number, b: number) => a + b, 0),
                      monthsSum.slice(9, 12).reduce((a: number, b: number) => a + b, 0),
                    ];
                    const totalAchievement = monthsSum.reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentAchieved = indicatorTotal
                      ? ((totalAchievement / indicatorTotal) * 100).toFixed(2)
                      : "0";

                    return (
                      <React.Fragment key={`isp3-${ispIndex}-${iIndex}`}>
                        {/* Indicator row */}
                        <TableRow className="border-b border-slate-400">
                          {iIndex === 0 && (
                            <TableCell
                              rowSpan={rowsPerISP3}
                              className="text-sm whitespace-normal border-r border-slate-400 text-center"
                            >
                              {isp.isp3}
                            </TableCell>
                          )}
                          <TableCell className="text-sm border-r border-slate-400 bg-blue-400">
                            {ind.indicator}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm border-r border-slate-400 bg-blue-400">
                            {indicatorTotal}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm border-r border-slate-400 bg-blue-400">
                            {totalAchievement}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm border-r border-slate-400 bg-blue-400">
                            {percentAchieved}%
                          </TableCell>
                          {quarters.map((q, qIndex) => (
                            <React.Fragment key={qIndex}>
                              <TableCell className="text-right border-r border-slate-400 text-sm bg-blue-400">
                                {q}
                              </TableCell>
                              {monthsSum
                                .slice(qIndex * 3, qIndex * 3 + 3)
                                .map((m, mIndex) => (
                                  <TableCell
                                    key={`${qIndex}-${mIndex}`}
                                    className="text-right border-r border-slate-400 text-sm bg-blue-400"
                                  >
                                    {m}
                                  </TableCell>
                                ))}
                            </React.Fragment>
                          ))}
                        </TableRow>

                        {/* Disaggregation rows */}
                        {ind.disaggregation.map((d: any, dIndex: any) => {
                          const qMonths = Array.from({ length: 4 }).map(
                            (_, qIndex) => {
                              const start = qIndex * 3;
                              const months = d.months?.slice(
                                start,
                                start + 3
                              ) ?? [0, 0, 0];
                              return {
                                quarterValue: months.reduce(
                                  (a: number, b: number) => a + b,
                                  0
                                ),
                                months,
                              };
                            }
                          );

                          const disTotalAchievement =
                            d.months?.reduce((a: any, b: any) => a + b, 0) || 0;
                          const disPercent = d.target
                            ? ((disTotalAchievement / d.target) * 100).toFixed(
                                2
                              )
                            : "0";

                          return (
                            <TableRow
                              key={`isp3-dis-${ispIndex}-${iIndex}-${dIndex}`}
                              className="border-b border-slate-400"
                            >
                              <TableCell className="text-xs border-r border-slate-400 pl-6">
                                {d.name}
                              </TableCell>
                              <TableCell className="text-right text-xs border-r border-slate-400">
                                {d.target}
                              </TableCell>
                              <TableCell className="text-right text-xs border-r border-slate-400">
                                {disTotalAchievement}
                              </TableCell>
                              <TableCell className="text-right text-xs border-r border-slate-400">
                                {disPercent}%
                              </TableCell>
                              {qMonths.map((q, qIndex) => (
                                <React.Fragment
                                  key={`isp3-dis-${ispIndex}-${iIndex}-${dIndex}-q${qIndex}`}
                                >
                                  <TableCell className="text-right bg-blue-400 text-xs border-r border-slate-400">
                                    {q.quarterValue}
                                  </TableCell>
                                  {q.months.map((m: number, mIndex: number) => (
                                    <TableCell
                                      key={`isp3-dis-${ispIndex}-${iIndex}-${dIndex}-m${qIndex}-${mIndex}`}
                                      className="text-right text-xs border-r border-slate-400"
                                    >
                                      {m}
                                    </TableCell>
                                  ))}
                                </React.Fragment>
                              ))}
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
