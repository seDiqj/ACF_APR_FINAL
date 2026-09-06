"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cardsBottomButtons } from "./CardsBottomButtons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjectContext } from "../create_new_project/page";
import { useParentContext } from "@/contexts/ParentContext";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { stringToCapital } from "@/helpers/StringToCapital";
import { SlidersHorizontal, Plus } from "lucide-react";
import {
  Dessaggregation,
  Indicator,
  IndicatorProvinceType,
} from "../types/Types";
import {
  AreDessaggregationsEdited,
  HasDessaggregationTheseFeature,
  IsCreateMode,
  IsIndicatorSaved,
  IsNotShowMode,
  IsNotSubIndicator,
  IsShowMode,
  IsTheDessaggregationOfThisIndicatorAndProvince,
  isTheTotalTargetOfDessaggregationsEqualToTotalTargetOfIndicator,
  IsTotalOfDessaggregationsOfProvinceBiggerThenTotalOfProvince,
  IsTotalOfDessaggregationsOfProvinceLessThenTotalOfProvince,
  WasIndexFound,
} from "@/constants/Constants";
import {
  getReliableDessaggregationOptionsAccordingToDessagregationType,
  getReliableDessaggregationOptionsForSubIndicatorAccordingToDessagregationType,
} from "@/helpers/DessaggregationFormHelpers";
import { DessaggregationFromInterface } from "@/interfaces/Interfaces";
import {
  CancelButtonMessage,
  DoneButtonMessage,
  ResetButtonMessage,
} from "@/constants/ConfirmationModelsTexts";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const DessaggregationForm: React.FC<DessaggregationFromInterface> = ({
  mode,
}) => {
  const {
    indicators,
    setCurrentTab,
    dessaggregations,
    setDessaggregations,
  }: {
    indicators: Indicator[];
    setCurrentTab: (value: string) => void;
    dessaggregations: Dessaggregation[];
    setDessaggregations: React.Dispatch<
      React.SetStateAction<Dessaggregation[]>
    >;
  } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(
    null
  );
  const [activeDessaggregationTab, setActiveDessaggregationTab] = useState<
    string | undefined
  >(undefined);
  const [dessaggregationBeforeEdit, setDessaggregationBeforeEdit] = useState<
    Dessaggregation[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hundleSubmit = (indicatorId: string | null) => {
    if (!indicatorId) return;
    setIsLoading(true);
    requestHandler()
      .post("/projects/d/disaggregation", {
        dessaggregations: dessaggregations.filter(
          (d) =>
            d.indicatorId == indicatorId ||
            d.indicatorId ==
              indicators.find((ind) => ind.parent_indicator == indicatorId)
                ?.id ||
            d.indicatorId ==
              indicators.find((ind) => ind.id == indicatorId)?.subIndicator?.id
        ),
      })
      .then((response: any) => {
        setSelectedIndicator(null);
        reqForToastAndSetMessage(response.data.message, "success");
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error saving disaggregations",
          "error"
        );
      })
      .finally(() => setIsLoading(false));
  };

  const addOrRemoveDessaggregation = (
    shouldBeAdd: boolean,
    description: string,
    province: string,
    indicator: { id: string | null; indicatorRef: string }
  ) => {
    if (shouldBeAdd) {
      setDessaggregations((prev) => {
        if (
          prev.some((d) =>
            HasDessaggregationTheseFeature(
              d,
              description,
              province,
              indicator.indicatorRef
            )
          )
        )
          return prev;
        return [
          ...prev,
          {
            id: null,
            indicatorId: indicator.id,
            indicatorRef: indicator.indicatorRef,
            dessaggration: description,
            province: province,
            target: 0,
          },
        ];
      });
    } else {
      setDessaggregations((prev) =>
        prev.filter(
          (d) =>
            !HasDessaggregationTheseFeature(
              d,
              description,
              province,
              indicator.indicatorRef
            )
        )
      );
    }
  };

  const calculateProvinceDessaggregationsTotal = (
    province: string,
    indicatorRef: string
  ) => {
    return dessaggregations
      .filter((d) =>
        IsTheDessaggregationOfThisIndicatorAndProvince(
          d,
          province,
          indicatorRef
        )
      )
      .reduce((sum, d) => sum + Number(d.target || 0), 0);
  };
  const handleDessaggregationsInputsChange = (
    description: string,
    province: string,
    indicator: { id: string | null; indicatorRef: string },
    newTarget: string | number
  ) => {
    const num = newTarget === "" ? 0 : Number(newTarget);
    setDessaggregations((prev) => {
      const foundIndex = prev.findIndex((d) =>
        HasDessaggregationTheseFeature(
          d,
          description,
          province,
          indicator.indicatorRef
        )
      );
      if (WasIndexFound(foundIndex)) {
        const copy = [...prev];
        copy[foundIndex] = { ...copy[foundIndex], target: num };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: null,
            indicatorId: indicator.id,
            indicatorRef: indicator.indicatorRef,
            dessaggration: description,
            province: province,
            target: num,
          },
        ];
      }
    });
  };

  const onCancel = () => {
    if (AreDessaggregationsEdited(dessaggregationBeforeEdit, dessaggregations))
      reqForConfirmationModelFunc(CancelButtonMessage, () => {
        setDessaggregations(dessaggregationBeforeEdit);
        setSelectedIndicator(null);
      });
    else {
      setDessaggregations(dessaggregationBeforeEdit);
      setSelectedIndicator(null);
    }
  };

  const readOnly = IsShowMode(mode);

  return (
    <>
      <Card className="h-full border border-border bg-card shadow-sm flex flex-col rounded-xl overflow-hidden min-h-[500px]">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SlidersHorizontal className="text-primary" size={22} />
            Target Disaggregation
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure categorical demographic segments and target breakdown
            weights per metric.
          </p>
        </CardHeader>

        <CardContent className=" p-6 overflow-y-auto flex-1 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicators
              .filter(
                (indicator) =>
                  IsIndicatorSaved(indicator) && IsNotSubIndicator(indicator)
              )
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-background hover:bg-muted/30 transition-all shadow-sm"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span
                      title={`Indicator Reference: ${item.indicatorRef}\nTarget: ${item.target}\nDatabase: ${item.database}`}
                      className="text-sm font-semibold text-foreground truncate max-w-[180px]"
                    >
                      {item.indicatorRef}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                      Type: {stringToCapital(item.dessaggregationType)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedIndicator(item);
                      setActiveDessaggregationTab(
                        item.dessaggregationType.toLowerCase()
                      );
                      setDessaggregationBeforeEdit(dessaggregations);
                    }}
                    className="h-9 rounded-lg font-medium shadow-sm shrink-0 border-muted hover:bg-muted"
                  >
                    {IsCreateMode(mode) ? (
                      <>
                        <Plus size={14} className="mr-1" /> Add
                      </>
                    ) : IsShowMode(mode) ? (
                      "View"
                    ) : (
                      "Edit"
                    )}
                  </Button>
                </div>
              ))}
          </div>

          {selectedIndicator && (
            <Dialog
              open={true}
              onOpenChange={() => {
                setDessaggregations(dessaggregationBeforeEdit);
                setSelectedIndicator(null);
              }}
            >
              <DialogContent className="min-w-5xl w-[95vw] max-h-[90vh] flex flex-col border border-border dark:border-gray-800 rounded-xl overflow-hidden p-0 shadow-2xl bg-background">
                <DialogHeader className="p-6 border-b bg-muted/10">
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    Disaggregation Matrix:{" "}
                    <span className="text-primary">
                      {selectedIndicator.indicatorRef}
                    </span>{" "}
                    (Target: {selectedIndicator.target})
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6 max-h-[calc(90vh-160px)]">
                  <Tabs
                    value={activeDessaggregationTab}
                    onValueChange={setActiveDessaggregationTab}
                    className="w-full flex flex-col gap-4"
                  >
                    <TabsList className="grid grid-cols-2 max-w-md bg-muted p-1 rounded-xl">
                      <TabsTrigger
                        value={selectedIndicator.dessaggregationType.toLowerCase()}
                        className="rounded-lg text-sm font-medium transition-all"
                      >
                        Main Indicator (
                        {stringToCapital(selectedIndicator.dessaggregationType)}
                        )
                      </TabsTrigger>
                      {selectedIndicator.subIndicator && (
                        <TabsTrigger
                          value={selectedIndicator.subIndicator.dessaggregationType.toLowerCase()}
                          className="rounded-lg text-sm font-medium transition-all"
                        >
                          Sub Indicator (
                          {stringToCapital(
                            selectedIndicator.subIndicator.dessaggregationType
                          )}
                          )
                        </TabsTrigger>
                      )}
                    </TabsList>
                    {/* Main Indicator Tab View */}
                    <TabsContent
                      className="w-full mt-0 focus-visible:outline-none space-y-8"
                      value={selectedIndicator.dessaggregationType.toLowerCase()}
                    >
                      {selectedIndicator.provinces.map((province) => {
                        const totalForProvince =
                          calculateProvinceDessaggregationsTotal(
                            province.province,
                            selectedIndicator.indicatorRef
                          );

                        return (
                          <div
                            key={province.province}
                            className="border border-border rounded-xl p-4 bg-muted/5 shadow-sm space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-border pb-2 bg-background -mx-4 px-4 py-2.5 rounded-t-xl -mt-4">
                              <span className="font-bold text-base text-foreground flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                                Province Area: {province.province}
                              </span>
                              <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md border">
                                Target Allocation:{" "}
                                <strong className="text-primary">
                                  {province.target}
                                </strong>
                              </span>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-border bg-background shadow-inner">
                              <Table className="w-full border-collapse">
                                <TableHeader className="bg-muted/40">
                                  <TableRow>
                                    <TableHead className="text-center w-12 font-semibold">
                                      Select
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                      Segment Description
                                    </TableHead>
                                    <TableHead className="text-center w-48 font-semibold">
                                      Target Value
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-border">
                                  {getReliableDessaggregationOptionsAccordingToDessagregationType(
                                    selectedIndicator.dessaggregationType
                                  ).map((opt, i) => {
                                    const existing = dessaggregations.find(
                                      (d) =>
                                        HasDessaggregationTheseFeature(
                                          d,
                                          opt,
                                          province.province,
                                          selectedIndicator?.indicatorRef
                                        )
                                    );
                                    const isChecked = !!existing;

                                    return (
                                      <TableRow
                                        key={i}
                                        className="hover:bg-muted/30 transition-colors"
                                      >
                                        <TableCell className="text-center w-12">
                                          <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                              addOrRemoveDessaggregation(
                                                checked as unknown as boolean,
                                                opt,
                                                province.province,
                                                selectedIndicator
                                              )
                                            }
                                            disabled={readOnly}
                                            className="h-4 w-4 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                          {opt}
                                        </TableCell>
                                        <TableCell className="p-2">
                                          <Input
                                            type="number"
                                            value={
                                              existing
                                                ? String(existing.target)
                                                : ""
                                            }
                                            onChange={(e) =>
                                              handleDessaggregationsInputsChange(
                                                opt,
                                                province.province,
                                                selectedIndicator,
                                                e.target.value
                                              )
                                            }
                                            className="mx-auto w-36 text-center h-9 rounded-lg border-input bg-background focus:ring-2 focus:ring-primary"
                                            disabled={readOnly || !isChecked}
                                            placeholder="—"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}

                                  {/* Calculated Totals Row */}
                                  <TableRow className="bg-muted/20 font-semibold border-t-2">
                                    <TableCell className="w-12" />
                                    <TableCell className="text-foreground font-bold">
                                      TOTAL TARGET
                                    </TableCell>
                                    <TableCell className="p-2">
                                      <Input
                                        disabled
                                        value={totalForProvince}
                                        className="mx-auto w-36 text-center h-9 rounded-lg border-input bg-muted/50 font-bold text-foreground"
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            {/* Conditional Target Discrepancy Warnings */}
                            {IsTotalOfDessaggregationsOfProvinceBiggerThenTotalOfProvince(
                              totalForProvince,
                              province.target || 0
                            ) && (
                              <div className="flex flex-row items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium animate-pulse">
                                <span>
                                  ⚠ The allocated total target (
                                  {totalForProvince}) exceeds the assigned
                                  target ({province.target}) for{" "}
                                  {province.province}!
                                </span>
                              </div>
                            )}
                            {IsTotalOfDessaggregationsOfProvinceLessThenTotalOfProvince(
                              totalForProvince,
                              province.target || 0
                            ) && (
                              <div className="flex flex-row items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium animate-pulse">
                                <span>
                                  ⚠ The allocated total target (
                                  {totalForProvince}) should be equal to
                                  assigned target ({province.target}) for{" "}
                                  {province.province}!
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </TabsContent>
                    {/* Sub Indicator Tab View */}
                    {selectedIndicator.subIndicator && (
                      <TabsContent
                        className="w-full mt-0 focus-visible:outline-none space-y-8"
                        value={selectedIndicator.subIndicator.dessaggregationType.toLowerCase()}
                      >
                        {selectedIndicator.subIndicator.provinces.map(
                          (province) => {
                            const totalForProvince =
                              calculateProvinceDessaggregationsTotal(
                                province.province,
                                selectedIndicator.subIndicator!.indicatorRef
                              );

                            return (
                              <div
                                key={province.province}
                                className="border border-border rounded-xl p-4 bg-muted/5 shadow-sm space-y-4"
                              >
                                <div className="flex items-center justify-between border-b border-border pb-2 bg-background -mx-4 px-4 py-2.5 rounded-t-xl -mt-4">
                                  <span className="font-bold text-base text-foreground flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    Province Area (Sub): {province.province}
                                  </span>
                                  <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md border">
                                    Target Allocation:{" "}
                                    <strong className="text-primary">
                                      {province.target}
                                    </strong>
                                  </span>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-border bg-background shadow-inner">
                                  <Table className="w-full border-collapse">
                                    <TableHeader className="bg-muted/40">
                                      <TableRow>
                                        <TableHead className="text-center w-12 font-semibold">
                                          Select
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                          Segment Description
                                        </TableHead>
                                        <TableHead className="text-center w-48 font-semibold">
                                          Target Value
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-border">
                                      {getReliableDessaggregationOptionsForSubIndicatorAccordingToDessagregationType(
                                        selectedIndicator.subIndicator!
                                          .dessaggregationType
                                      ).map((opt, i) => {
                                        const existing = dessaggregations.find(
                                          (d) =>
                                            HasDessaggregationTheseFeature(
                                              d,
                                              opt,
                                              province.province,
                                              selectedIndicator.subIndicator!
                                                .indicatorRef
                                            )
                                        );
                                        const isChecked = !!existing;

                                        return (
                                          <TableRow
                                            key={i}
                                            className="hover:bg-muted/30 transition-colors"
                                          >
                                            <TableCell className="text-center w-12">
                                              <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                  addOrRemoveDessaggregation(
                                                    checked as unknown as boolean,
                                                    opt,
                                                    province.province,
                                                    selectedIndicator.subIndicator!
                                                  )
                                                }
                                                disabled={readOnly}
                                                className="h-4 w-4 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                              />
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">
                                              {opt}
                                            </TableCell>
                                            <TableCell className="p-2">
                                              <Input
                                                type="number"
                                                value={
                                                  existing
                                                    ? String(existing.target)
                                                    : ""
                                                }
                                                onChange={(e) =>
                                                  handleDessaggregationsInputsChange(
                                                    opt,
                                                    province.province,
                                                    selectedIndicator.subIndicator!,
                                                    e.target.value
                                                  )
                                                }
                                                className="mx-auto w-36 text-center h-9 rounded-lg border-input bg-background focus:ring-2 focus:ring-primary"
                                                disabled={
                                                  readOnly || !isChecked
                                                }
                                                placeholder="—"
                                              />
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}

                                      <TableRow className="bg-muted/20 font-semibold border-t-2">
                                        <TableCell className="w-12" />
                                        <TableCell className="text-foreground font-bold">
                                          TOTAL TARGET
                                        </TableCell>
                                        <TableCell className="p-2">
                                          <Input
                                            disabled
                                            value={totalForProvince}
                                            className="mx-auto w-36 text-center h-9 rounded-lg border-input bg-muted/50 font-bold text-foreground"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* پایش خطای متنی ناترازی زیرشاخص */}
                                {IsTotalOfDessaggregationsOfProvinceBiggerThenTotalOfProvince(
                                  totalForProvince,
                                  province.target
                                ) && (
                                  <div className="flex flex-row items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium animate-pulse">
                                    <span>
                                      ⚠ The allocated total target (
                                      {totalForProvince}) exceeds the assigned
                                      target ({province.target}) for{" "}
                                      {province.province}!
                                    </span>
                                  </div>
                                )}
                                {IsTotalOfDessaggregationsOfProvinceLessThenTotalOfProvince(
                                  totalForProvince,
                                  province.target
                                ) && (
                                  <div className="flex flex-row items-center gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium animate-pulse">
                                    <span>
                                      ⚠ The allocated total target (
                                      {totalForProvince}) should be equal to
                                      assigned target ({province.target}) for{" "}
                                      {province.province}!
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
                {/* Dialog Action Footer without Fixed Overlay */}
                <DialogFooter className="p-6 border-t bg-muted/20 gap-3 flex flex-row items-center justify-end">
                  {IsNotShowMode(mode) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        reqForConfirmationModelFunc(ResetButtonMessage, () =>
                          setDessaggregations((prev) =>
                            prev.filter(
                              (d) => d.indicatorId != selectedIndicator.id
                            )
                          )
                        )
                      }
                      className="h-10 rounded-lg font-medium border-muted hover:bg-muted text-muted-foreground"
                    >
                      Reset
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="h-10 rounded-lg font-medium border-muted hover:bg-muted"
                  >
                    Cancel
                  </Button>

                  {IsNotShowMode(mode) && (
                    <Button
                      id={SUBMIT_BUTTON_PROVIDER_ID}
                      type="button"
                      disabled={
                        isTheTotalTargetOfDessaggregationsEqualToTotalTargetOfIndicator(
                          selectedIndicator,
                          dessaggregations
                        ) || isLoading
                      }
                      onClick={() => {
                        if (
                          isTheTotalTargetOfDessaggregationsEqualToTotalTargetOfIndicator(
                            selectedIndicator,
                            dessaggregations
                          )
                        ) {
                          reqForToastAndSetMessage(
                            "The total target of dessaggregations should be equal to total target of indicator !"
                          );
                          return;
                        }
                        reqForConfirmationModelFunc(DoneButtonMessage, () =>
                          hundleSubmit(selectedIndicator.id)
                        );
                      }}
                      className="h-10 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 font-medium shadow-sm w-28"
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
        <CardFooter className="p-6 border-t bg-muted/20 flex justify-end">
          {cardsBottomButtons(
            setCurrentTab,
            "indicator",
            undefined,
            false,
            setCurrentTab,
            "aprPreview"
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default DessaggregationForm;
