"use client";

import React, { useEffect, useState } from "react";
import { SingleSelect } from "../single-select";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import calculateEachIndicatorProvinceTargetAccordingTONumberOFCouncilorCount, {
  calculateEachSubIndicatorProvinceTargetAccordingTONumberOFCouncilorCount,
} from "@/helpers/IndicatorProvincesTargetCalculator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useParentContext } from "@/contexts/ParentContext";
import { Plus, Check, Trash2, ShieldAlert } from "lucide-react";
import { useProjectContext } from "@/app/(main)/projects/create_new_project/page";
import { useProjectEditContext } from "@/app/(main)/projects/edit_project/[id]/page";
import { useProjectShowContext } from "@/app/(main)/projects/project_show/[id]/page";
import { Indicator, Output } from "@/app/(main)/projects/types/Types";
import { MultiSelect } from "../multi-select";
import { IndicatorDefault } from "@/constants/FormsDefaultValues";
import {
  CancelButtonMessage,
  IndicatorCreationMessage,
  IndicatorEditionMessage,
} from "@/constants/ConfirmationModelsTexts";
import {
  databases,
  indicatorStatus,
  indicatorTypes,
} from "@/constants/SingleAndMultiSelectOptionsList";
import { IndicatorModelInterface } from "@/interfaces/Interfaces";
import {
  HasSubIndicator,
  IsCreateMode,
  IsCreatePage,
  IsCurrentTypeOptionAvailable,
  IsEditMode,
  IsEditPage,
  IsIndicatorDatabaseEnactDatabase,
  IsIndicatorDatabaseMainDatabase,
  IsIndicatorEdited,
  IsMainDatabase,
  IsMainDatabaseAvailableForMe,
  IsMainDatabaseMealtoolTargetAvailableForMe,
  IsNotANullOrUndefinedValue,
  isNotASubIndicator,
  IsNotIndicatorDatabaseEnactDatabase,
  IsNotMainDatabase,
  IsNotShowMode,
  IsOutputSaved,
  IsShowMode,
  IsThereAndIndicatorWithEnteredReferanceAndDefferentId,
} from "@/constants/Constants";
import { stringToCapital } from "@/helpers/StringToCapital";
import { getStructuredProvinces } from "@/helpers/IndicatorFormHelpers";
import { AxiosError, AxiosResponse } from "axios";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { IndicatorSchema } from "@/schemas/FormsSchema";

export const IndicatorModel: React.FC<IndicatorModelInterface> = ({
  isOpen,
  onClose,
  mode,
  pageIdentifier,
  indicatorId,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const {
    indicators,
    setIndicators,
    outputs,
    projectProvinces,
  }: {
    indicators: Indicator[];
    setIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>;
    outputs: Output[];
    projectProvinces: string[];
  } = IsCreatePage(pageIdentifier)
    ? useProjectContext()
    : IsEditPage(pageIdentifier)
    ? useProjectEditContext()
    : useProjectShowContext();

  const [local, setLocal] = useState<Indicator>(IndicatorDefault());
  const [indicatorBeforeEdit, setIndicatorBeforeEdit] = useState<Indicator>(
    IndicatorDefault()
  );
  const [reqForSubIndicator, setReqForSubIndicator] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: any }>({});
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "subIndicatorName" && local.subIndicator) {
      setLocal((prev) => ({
        ...prev,
        subIndicator: {
          ...prev.subIndicator!,
          name: value,
        },
      }));
      return;
    } else if (name === "subIndicatorTarget" && local.subIndicator) {
      setLocal((prev) => ({
        ...prev,
        subIndicator: {
          ...prev.subIndicator!,
          target: Number(value),
        },
      }));
      return;
    } else if (name === "dessaggregationType") {
      setLocal((prev) => ({
        ...prev,
        dessaggregationType: value,
        subIndicator: prev.subIndicator
          ? {
              ...prev.subIndicator,
              dessaggregationType:
                value === "session" ? "indevidual" : "session",
            }
          : null,
      }));
      return;
    }

    setLocal((prev) => {
      if (name === "target")
        calculateEachIndicatorProvinceTargetAccordingTONumberOFCouncilorCount(
          { ...prev, target: Number(value) },
          setLocal
        );

      return {
        ...prev,
        [name]:
          name === "target"
            ? Number(value)
            : name === "type"
            ? value || null
            : value,
      };
    });
  };

  const hundleIndicatorFormChange = (e: any) => {
    const { province, name, value } = e.target;
    if (!local.subIndicator) return;

    const updatedProvinces = local.subIndicator.provinces.map((p: any) =>
      p.province === province.province
        ? {
            ...p,
            councilorCount:
              name === "subIndicatorProvinceCouncilorCount"
                ? Number(value)
                : p.councilorCount,
            target:
              name === "subIndicatorProvinceTarget" ? Number(value) : p.target,
          }
        : p
    );

    setLocal((prev) => ({
      ...prev,
      subIndicator: {
        ...prev.subIndicator,
        provinces: updatedProvinces,
      } as any,
    }));
  };

  const handleAddSubIndicator = () => {
    if (IsNotMainDatabase(local.database)) {
      reqForToastAndSetMessage(
        "Only main database can have a sub indicator.",
        "warning"
      );
      return;
    }

    if (!reqForSubIndicator) {
      setLocal((prev) => ({
        ...prev,
        subIndicator: {
          id: null,
          indicatorRef: `sub-${prev.indicatorRef}`,
          name: "",
          target: 0,
          type: null,
          dessaggregationType:
            prev.dessaggregationType === "session" ? "indevidual" : "session",
          provinces: prev.provinces.map((province) => ({
            province: province.province,
            target: 0,
            councilorCount: 0,
          })),
        },
      }));
      setReqForSubIndicator(true);
    } else {
      setLocal((prev) => ({ ...prev, subIndicator: null }));
      setReqForSubIndicator(false);
    }
  };

  const hundleSubmit = () => {
    if (
      IsThereAndIndicatorWithEnteredReferanceAndDefferentId(indicators, local)
    ) {
      reqForToastAndSetMessage(
        "A project cannot have two indicators with the same reference!",
        "error"
      );
      return;
    } else if (
      IsEditMode(mode) &&
      !IsIndicatorEdited(indicatorBeforeEdit, local)
    ) {
      reqForToastAndSetMessage("No changes were made!", "warning");
      onClose();
      return;
    }

    const result = IndicatorSchema.safeParse(local);

    if (!result.success) {
      const errors: any = {};
      result.error.issues.forEach((issue) => {
        let current = errors;
        issue.path.forEach((p, index) => {
          if (index === issue.path.length - 1) {
            current[p] = issue.message;
          } else {
            if (!current[p]) current[p] = {};
            current = current[p];
          }
        });
      });

      console.log(errors)

      setFormErrors(errors);
      reqForToastAndSetMessage(
        "Please fix validation errors before submitting.",
        "warning"
      );
      return;
    }

    console.log(local);
    

    setFormErrors({});
    setIsLoading(true);

    if (IsCreateMode(mode)) {
      requestHandler()
        .post("projects/i/indicator", local)
        .then((response: any) => {
          const findId = (ref: string) =>
            response.data.data.find((i: any) => i.indicatorRef === ref)?.id;

          setIndicators((prev) => [
            ...prev,
            {
              ...local,
              id: findId(local.indicatorRef),
              subIndicator: local.subIndicator
                ? {
                    ...local.subIndicator,
                    id: findId(local.subIndicator.indicatorRef),
                  }
                : null,
            },
          ]);

          reqForToastAndSetMessage(response.data.message, "success");
          onClose();
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Submission error",
            "error"
          );
        })
        .finally(() => setIsLoading(false));
    } else if (IsEditMode(mode)) {
      setIndicators((prev) =>
        prev.map((ind) =>
          ind.indicatorRef === local.indicatorRef ? local : ind
        )
      );

      requestHandler()
        .put(`/projects/indicator/${local.id}`, local)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          onClose();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Update error",
            "error"
          )
        )
        .finally(() => setIsLoading(false));
    }
  };

  const availableDatabasesForThisInd = (indicator: Indicator) => {
    return databases.filter((opt) => {
      if (opt.value === "main_database") {
        if (!IsMainDatabaseAvailableForMe(indicators, indicator)) return false;
      } else if (opt.value === "main_database_meal_tool") {
        if (!IsMainDatabaseMealtoolTargetAvailableForMe(indicators, indicator))
          return false;
      }
      return true;
    });
  };

  const availableTypes = () => {
    return indicatorTypes.filter(
      (opt) => !IsCurrentTypeOptionAvailable(indicators, opt, local)
    );
  };

  const savedOuputs = () => {
    return outputs
      .filter((output) => IsOutputSaved(output))
      .map((output) => ({ value: output.id!, label: output.outputRef }));
  };
  const handleIndicatorProvincesChange = (provinces: string[]) => {
    if (!HasSubIndicator(local)) {
      setLocal((prev) => {
        calculateEachIndicatorProvinceTargetAccordingTONumberOFCouncilorCount(
          {
            ...prev,
            provinces: provinces.map((p) => ({
              province: p,
              target:
                indicatorBeforeEdit.provinces.find(
                  (province) => province.province === p
                )?.target ?? 0,
              councilorCount:
                indicatorBeforeEdit.provinces.find(
                  (province) => province.province === p
                )?.councilorCount ?? 0,
            })),
          },
          setLocal
        );
        return {
          ...prev,
          provinces: provinces.map((p) => ({
            province: p,
            target:
              indicatorBeforeEdit.provinces.find(
                (province) => province.province === p
              )?.target ?? 0,
            councilorCount:
              indicatorBeforeEdit.provinces.find(
                (province) => province.province === p
              )?.councilorCount ?? 0,
          })),
        };
      });
    } else {
      setLocal((prev) => {
        calculateEachIndicatorProvinceTargetAccordingTONumberOFCouncilorCount(
          {
            ...prev,
            provinces: provinces.map((p) => ({
              province: p,
              target:
                indicatorBeforeEdit.provinces.find(
                  (province) => province.province === p
                )?.target ?? 0,
              councilorCount:
                indicatorBeforeEdit.provinces.find(
                  (province) => province.province === p
                )?.councilorCount ?? 0,
            })),
          },
          setLocal
        );

        return {
          ...prev,
          provinces: provinces.map((p) => ({
            province: p,
            target:
              indicatorBeforeEdit.provinces.find(
                (province) => province.province === p
              )?.target ?? 0,
            councilorCount:
              indicatorBeforeEdit.provinces.find(
                (province) => province.province === p
              )?.councilorCount ?? 0,
          })),
          subIndicator: {
            ...prev.subIndicator!,
            provinces: provinces.map((p) => ({
              province: p,
              target: 0,
              councilorCount: 0,
            })),
          },
        };
      });
    }
  };

  const handleCouncilorCountInputChange = (
    councilorCount: number,
    province: string
  ) => {
    setLocal((prev) => {
      const updatedProvinces = prev.provinces.map((p) =>
        p.province === province ? { ...p, councilorCount } : p
      );

      calculateEachIndicatorProvinceTargetAccordingTONumberOFCouncilorCount(
        { ...prev, provinces: updatedProvinces },
        setLocal
      );

      return { ...prev, provinces: updatedProvinces };
    });
  };

  const handleSubIndicatorCouncilorCountInputChange = (
    councilorCount: number,
    province: string
  ) => {
    if (isNotASubIndicator(local.subIndicator)) return;
    setLocal((prev) => {
      const updatedProvinces = prev.subIndicator!.provinces.map((p) =>
        p.province === province ? { ...p, councilorCount } : p
      );

      calculateEachSubIndicatorProvinceTargetAccordingTONumberOFCouncilorCount(
        {
          ...prev,
          subIndicator: { ...prev.subIndicator!, provinces: updatedProvinces },
        },
        setLocal
      );

      return {
        ...prev,
        subIndicator: { ...prev.subIndicator!, provinces: updatedProvinces },
      };
    });
  };

  const handleProvinceTargetChange = (newTarget: number, province: string) => {
    setLocal((prev) => ({
      ...prev,
      provinces: prev.provinces.map((p) =>
        p.province === province ? { ...p, target: newTarget } : p
      ),
    }));
  };

  const handleCancel = () => {
    if (IsEditMode(mode) && IsIndicatorEdited(indicatorBeforeEdit, local)) {
      reqForConfirmationModelFunc(CancelButtonMessage, onClose);
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (
      (IsEditMode(mode) || IsShowMode(mode)) &&
      IsNotANullOrUndefinedValue(indicatorId) &&
      isOpen
    ) {
      requestHandler()
        .get(`projects/indicator/${indicatorId}`)
        .then((response: AxiosResponse<any>) => {
          setLocal(response.data.data);
          if (response.data.data.subIndicator) setReqForSubIndicator(true);
          setIndicatorBeforeEdit(response.data.data);
        })
        .catch((error: AxiosError<any>) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error fetching indicator data",
            "error"
          )
        );
    }
  }, [indicatorId, isOpen]);

  useEffect(() => {
    if (!IsMainDatabase(local)) {
      setLocal((prev) => ({...prev, type: null}));
    }
  }, [local.database]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] border border-border dark:border-gray-800 rounded-xl overflow-hidden p-0 flex flex-col shadow-2xl transition-all bg-background">
        <DialogHeader className="p-6 border-b bg-muted/10">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {IsEditMode(mode)
              ? "Edit Indicator Details"
              : IsCreateMode(mode)
              ? "Create New Indicator"
              : "Show Indicator Specifications"}
          </DialogTitle>
        </DialogHeader>

        {/* کانتینر بدنه فرم مجهز به کلاس هوشمند اسکرول عمودی بدون تداخل ارتفاع صلب */}
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-5 max-h-[calc(90vh-140px)]">
          {/* Linked Output */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Output
            </Label>
            <SingleSelect
              options={savedOuputs()}
              value={local.outputId ?? ""}
              onValueChange={(value: string) =>
                setLocal((prev) => ({ ...prev, outputId: value }))
              }
              disabled={IsShowMode(mode)}
              error={formErrors.outputId}
              placeholder="Select structural linked output"
            />
          </div>

          {/* Indicator Description */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="indicator"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Indicator Title
            </Label>
            <Textarea
              id="indicator"
              name="indicator"
              value={local.indicator || ""}
              onChange={handleChange}
              placeholder="Enter full indicator narrative name"
              disabled={IsShowMode(mode)}
              className={`rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary min-h-[85px] ${
                formErrors.indicator
                  ? "border-destructive focus:ring-destructive"
                  : ""
              }`}
              title={formErrors.indicator}
            />
            {formErrors.indicator && (
              <span className="text-xs text-destructive font-medium">
                {formErrors.indicator}
              </span>
            )}
          </div>

          {/* Indicator Reference */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="indicatorRef"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Indicator Reference
            </Label>
            <Input
              id="indicatorRef"
              name="indicatorRef"
              value={local.indicatorRef || ""}
              onChange={handleChange}
              placeholder="e.g. IND-001"
              disabled={IsShowMode(mode)}
              className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                formErrors.indicatorRef
                  ? "border-destructive focus:ring-destructive"
                  : ""
              }`}
              title={formErrors.indicatorRef}
            />
            {formErrors.indicatorRef && (
              <span className="text-xs text-destructive font-medium">
                {formErrors.indicatorRef}
              </span>
            )}
          </div>
          {/* Target & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="target"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Target
              </Label>
              <Input
                id="target"
                name="target"
                type="number"
                value={local.target || ""}
                onChange={handleChange}
                placeholder="Target value"
                disabled={IsShowMode(mode)}
                className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                  formErrors.target
                    ? "border-destructive focus:ring-destructive"
                    : ""
                }`}
              />
              {formErrors.target && (
                <span className="text-xs text-destructive font-medium">
                  {formErrors.target}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="status"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Status
              </Label>
              <SingleSelect
                value={local.status}
                onValueChange={(v: string) =>
                  setLocal((prev) => ({ ...prev, status: v }))
                }
                options={indicatorStatus}
                placeholder="Select status"
                disabled={IsShowMode(mode)}
                error={formErrors.status}
              />
            </div>
          </div>

          {/* Database & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Database
              </Label>
              <SingleSelect
                options={availableDatabasesForThisInd(local)}
                value={local.database}
                onValueChange={(value: string) => {
                  setLocal((prev) => ({
                    ...prev,
                    database: value,
                    dessaggregationType: getProperTypeAccToDb(value),
                  }));
                }}
                disabled={IsShowMode(mode)}
                error={formErrors.database}
              />
            </div>

            {IsMainDatabase(local) && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </Label>
                <SingleSelect
                  options={availableTypes()}
                  value={local.type as unknown as string}
                  onValueChange={(value: string) =>
                    setLocal((prev) => ({ ...prev, type: value }))
                  }
                  disabled={IsShowMode(mode)}
                  error={formErrors.type}
                />
              </div>
            )}
          </div>

          {/* Indicator Provinces */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Indicator Provinces
            </Label>
            <MultiSelect
              options={getStructuredProvinces(projectProvinces)}
              value={local.provinces.map((province) => province.province)}
              onValueChange={(value: string[]) =>
                handleIndicatorProvincesChange(value)
              }
              disabled={IsShowMode(mode)}
              error={formErrors.provinces}
            />
          </div>

          {/* Disaggregation Type Radio Group */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border bg-muted/5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Disaggregation Type
            </Label>
            <RadioGroup
              name="dessaggregationType"
              value={local.dessaggregationType}
              onValueChange={(value: string) =>
                handleChange({ target: { name: "dessaggregationType", value } })
              }
              className="flex flex-wrap gap-6 mt-1"
            >
              {IsIndicatorDatabaseMainDatabase(local) && (
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="session"
                    id="session"
                    disabled={IsShowMode(mode)}
                    className="h-4 w-4 text-primary"
                  />
                  <Label
                    htmlFor="session"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Session
                  </Label>
                </div>
              )}

              {IsNotIndicatorDatabaseEnactDatabase(local) && (
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="indevidual"
                    id="indevidual"
                    disabled={
                      IsShowMode(mode) || IsNotMainDatabase(local.database)
                    }
                    className="h-4 w-4 text-primary"
                  />
                  <Label
                    htmlFor="indevidual"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Individual
                  </Label>
                </div>
              )}

              {IsIndicatorDatabaseEnactDatabase(local) && (
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="enact"
                    id="enact"
                    disabled={IsShowMode(mode)}
                    className="h-4 w-4 text-primary"
                  />
                  <Label
                    htmlFor="enact"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Enact
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Province Dynamic Target Breakdown Matrix */}
          {local.provinces && local.provinces.length >= 1 && (
            <div className="space-y-4 pt-2 border-t border-dashed">
              <Label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-3 rounded-sm bg-primary" />
                Targeting Distribution per Province Area
              </Label>
              <div className="grid grid-cols-1 gap-4">
                {local.provinces.map((province, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end p-4 rounded-xl border bg-muted/5 transition-shadow hover:shadow-sm"
                  >
                    <span className="text-sm font-bold text-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border/80 w-fit sm:w-full text-center sm:h-11 flex items-center justify-center">
                      {stringToCapital(province.province)}
                    </span>
                    {local.database === "main_database" && (
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor={`${province.province}-count`}
                          className="text-[11px] font-semibold tracking-wider text-muted-foreground"
                        >
                          Councilor Count
                        </Label>
                        <Input
                          id={`${province.province}-count`}
                          type="number"
                          value={province.councilorCount || 0}
                          onChange={(e) =>
                            handleCouncilorCountInputChange(
                              Number(e.target.value),
                              province.province
                            )
                          }
                          disabled={IsShowMode(mode)}
                          className="h-11 rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`${province.province}-target`}
                        className="text-[11px] font-semibold tracking-wider text-muted-foreground"
                      >
                        Target Value
                      </Label>
                      <Input
                        id={`${province.province}-target`}
                        type="number"
                        value={province.target || 0}
                        onChange={(e) =>
                          handleProvinceTargetChange(
                            Number(e.target.value),
                            province.province
                          )
                        }
                        disabled={
                          IsShowMode(mode) || local.database === "main_database"
                        }
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Optional Narrative Description */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="description"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={local.description || ""}
              onChange={handleChange}
              placeholder="Optional administrative descriptions"
              disabled={IsShowMode(mode)}
              className="rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary min-h-[90px]"
            />
          </div>

          {/* Sub Indicator Segment Configuration Nested Blocks */}
          {local.subIndicator && local.database === "main_database" && (
            <div className="space-y-4 pt-4 border-t border-dashed mt-6">
              <Label className="text-base font-bold text-primary flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Sub Indicator Context Configuration
              </Label>
              <div className="space-y-4 border border-border/80 bg-primary-foreground/5 rounded-xl p-5 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold tracking-wider text-muted-foreground">
                      Sub Indicator Name
                    </Label>
                    <Input
                      name="subIndicatorName"
                      value={local.subIndicator?.name || ""}
                      onChange={handleChange}
                      placeholder="Sub indicator name narrative"
                      disabled={IsShowMode(mode)}
                      className={`h-11 rounded-lg ${
                        formErrors.subIndicator?.name
                          ? "border-destructive focus:ring-destructive"
                          : ""
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold tracking-wider text-muted-foreground">
                      Sub Indicator Target
                    </Label>
                    <Input
                      name="subIndicatorTarget"
                      type="number"
                      value={local.subIndicator?.target || ""}
                      onChange={handleChange}
                      placeholder="Sub indicator target total"
                      disabled={IsShowMode(mode)}
                      className={`h-11 rounded-lg ${
                        formErrors.subIndicator?.target
                          ? "border-destructive focus:ring-destructive"
                          : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Sub Indicator Provinces Nested Breakdowns */}
                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-bold text-foreground">
                    Sub Target Distribution matrix
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {local.subIndicator?.provinces.map((province, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end p-4 rounded-lg border bg-background/50"
                      >
                        <span className="text-sm font-semibold bg-muted px-3 h-11 rounded-lg border border-border flex items-center justify-center text-center">
                          {stringToCapital(province.province)}
                        </span>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            Councilor Count
                          </Label>
                          <Input
                            type="number"
                            value={province.councilorCount || 0}
                            onChange={(e) =>
                              handleSubIndicatorCouncilorCountInputChange(
                                Number(e.target.value),
                                province.province
                              )
                            }
                            disabled={IsShowMode(mode)}
                            className="h-11 rounded-lg"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            Target Value
                          </Label>
                          <Input
                            type="number"
                            name="subIndicatorProvinceTarget"
                            value={province.target || 0}
                            onChange={(e) => {
                              hundleIndicatorFormChange({
                                target: {
                                  province,
                                  name: e.target.name,
                                  value: e.target.value,
                                },
                              });
                            }}
                            disabled={IsShowMode(mode)}
                            className="h-11 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer Segment - Resolved Overlap Positioning */}
        {IsNotShowMode(mode) && (
          <DialogFooter className="p-6 border-t bg-muted/20 gap-3 flex flex-row items-center justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-10 rounded-lg font-medium border-muted hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddSubIndicator}
              disabled={IsNotMainDatabase(local.database)}
              className="h-10 rounded-lg font-medium gap-2 border shadow-sm"
            >
              <Plus size={16} />
              {reqForSubIndicator
                ? "Remove Sub Indicator"
                : "Add Sub Indicator"}
            </Button>
            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              disabled={isLoading}
              onClick={() => {
                reqForConfirmationModelFunc(
                  IsCreateMode(mode)
                    ? IndicatorCreationMessage
                    : IndicatorEditionMessage,
                  hundleSubmit
                );
              }}
              className="h-10 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 font-medium shadow-md w-24"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

function getProperTypeAccToDb(database: string): string {
  if (database === "main_database") return "session";
  if (database === "enact_database") return "enact";
  return "indevidual";
}

export default IndicatorModel;
