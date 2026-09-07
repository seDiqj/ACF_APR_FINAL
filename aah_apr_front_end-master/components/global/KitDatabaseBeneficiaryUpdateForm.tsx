"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SingleSelect } from "../single-select";
import { MultiSelect } from "../multi-select";

import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";

import { KitDatabaseBeneficiaryUpdateFormType } from "@/types/Types";
import { KitDatabaseBeneficiaryUpdateDefault } from "@/constants/FormsDefaultValues";

import {
  KitDatabaseBeneficiaryEditionMessage,
} from "@/constants/ConfirmationModelsTexts";

import {
  DisabilityTypeOptions,
  GenderOptions,
  HousholdStatusOptions,
  MaritalStatusOptions,
  ReferredForProtectionOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";

import { KitDatabaseBenficiaryUpdateForm } from "@/interfaces/Interfaces";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

import { AxiosError, AxiosResponse } from "axios";

import { KitDatabaseBeneficiaryFormSchema } from "@/schemas/FormsSchema";

import { toDateOnly } from "./MainDatabaseBeneficiaryCreationForm";
import CreateNewProgramKit from "./CreateNewProgramKit";

import {
  Loader2,
  Plus,
  Info,
  Landmark,
  UserCheck,
  ClipboardList,
} from "lucide-react";

import { cn } from "@/lib/utils";

const KitDatabaseBeneficiaryUpdateForm: React.FC<
  KitDatabaseBenficiaryUpdateForm
> = ({ open, onOpenChange, title, beneficiaryId }) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
    handleReload,
  } = useParentContext();

  const [formData, setFormData] =
    useState<KitDatabaseBeneficiaryUpdateFormType>(
      KitDatabaseBeneficiaryUpdateDefault(),
    );

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const [programs, setPrograms] = useState<
    { id: string; name: string }[]
  >([]);

  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);

  const [reqForCreateNewProgram, setReqForCreateNewProgram] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isFetchingBeneficiary, setIsFetchingBeneficiary] =
    useState<boolean>(false);

  const [registrationDateValidRange, setRegistrationDateValidRange] =
    useState<{
      start: string;
      end: string;
    }>({
      start: "2025-01-01",
      end: "2025-02-01",
    });

  /* -------------------------------------------------------------------------- */
  /* Form Change                                                                */
  /* -------------------------------------------------------------------------- */

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    let value: any = e.target.value;

    if (e.target.type === "number") {
      value = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove field error once user changes the field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Submit                                                                      */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = (e: any) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    const result = KitDatabaseBeneficiaryFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: { [key: string]: string } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field) {
          errors[field as string] = issue.message;
        }
      });

      setFormErrors(errors);

      reqForToastAndSetMessage(
        "Please resolve the validation errors before updating.",
        "warning",
      );

      return;
    }

    setFormErrors({});
    setIsLoading(true);

    requestHandler()
      .put(`/kit_db/beneficiary/${beneficiaryId}`, formData)
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
        onOpenChange(false);
        handleReload();
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Update failed.",
          "error",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /* -------------------------------------------------------------------------- */
  /* Fetch Beneficiary                                                           */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open || !beneficiaryId) return;

    setIsFetchingBeneficiary(true);
    setFormErrors({});

    requestHandler()
      .get(`/kit_db/beneficiary/${beneficiaryId}`)
      .then((response: any) => {
        const data = response.data.data;

        setFormData({
          id: beneficiaryId,
          program: data.program || "",
          indicators: data.indicators || [],
          dateOfRegistration: data.dateOfRegistration || "",
          code: data.code || "",
          name: data.name || "",
          fatherHusbandName: data.fatherHusbandName || "",
          gender: data.gender || "",
          age: data.age ?? "",
          maritalStatus: data.maritalStatus || "",
          childCode: data.childCode || "",
          childAge: data.childAge ?? "",
          phone: data.phone || "",
          householdStatus: data.householdStatus || "",
          literacyLevel: data.literacyLevel || "",
          disabilityType: data.disabilityType || "",
          referredForProtection: data.protectionServices || false,
        });
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error loading beneficiary.",
          "error",
        );
      })
      .finally(() => {
        setIsFetchingBeneficiary(false);
      });
  }, [open, beneficiaryId]);

  /* -------------------------------------------------------------------------- */
  /* Fetch Programs                                                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    requestHandler()
      .get("global/programs_for_selection/kit_database")
      .then((response: AxiosResponse<any>) => {
        setPrograms(response.data.data.data);
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message,
          "error",
        );
      });
  }, [open]);

  /* -------------------------------------------------------------------------- */
  /* Fetch Indicators + Date Range                                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!formData.program) {
      setIndicators([]);
      return;
    }

    requestHandler()
      .get(`/global/indicators/${formData.program}/kit_database`)
      .then((response: AxiosResponse<any>) => {
        setIndicators(response.data.data);
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message,
          "error",
        );
      });

    requestHandler()
      .get(
        `/date/project_date_range_acc_to_program/${formData.program}`,
      )
      .then((response: AxiosResponse<any>) => {
        setRegistrationDateValidRange({
          start: toDateOnly(response.data.data.start),
          end: toDateOnly(response.data.data.end),
        });
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message,
          "error",
        );
      });
  }, [formData.program]);

  /* -------------------------------------------------------------------------- */
  /* Error Component                                                             */
  /* -------------------------------------------------------------------------- */

  const FieldError = ({ field }: { field: string }) => {
    if (!formErrors[field]) return null;

    return (
      <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
        <Info className="h-3 w-3 shrink-0" />
        {formErrors[field]}
      </span>
    );
  };

  /* -------------------------------------------------------------------------- */
  /* Input Class                                                                 */
  /* -------------------------------------------------------------------------- */

  const inputClass = (field: string) =>
    cn(
      "bg-background border-input text-foreground",
      "focus-visible:ring-ring h-10 rounded-md text-xs",
      "transition-colors",
      formErrors[field] &&
        "border-destructive focus-visible:ring-destructive",
    );

  /* -------------------------------------------------------------------------- */
  /* Render                                                                      */
  /* -------------------------------------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          min-w-4xl
          w-[92vw]
          max-h-[85vh]
          flex
          flex-col
          p-6
          bg-card
          border
          border-border
          text-card-foreground
          shadow-2xl
          rounded-lg
          overflow-hidden
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------ */}

        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {title || "Update Kit Database Beneficiary"}
          </DialogTitle>
        </DialogHeader>

        {/* ------------------------------------------------------------------ */}
        {/* Scrollable Content                                                  */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {/* ================================================================ */}
          {/* Program Information                                               */}
          {/* ================================================================ */}

          <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Program Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
              {/* Program Selector */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <SingleSelect
                  options={programs.map((program) => ({
                    value: program.id,
                    label: program.name.toString().toUpperCase(),
                  }))}
                  value={formData.program}
                  onValueChange={(value: string) => {
                    handleFormChange({
                      target: {
                        name: "program",
                        value,
                      },
                    });
                  }}
                  placeholder="Select an Existing Program"
                  error={formErrors.program}
                  searchURL="global/programs_for_selection/kit_database"
                />

                <FieldError field="program" />
              </div>

              {/* OR */}
              <div className="md:col-span-1 text-center text-xs font-bold text-muted-foreground">
                OR
              </div>

              {/* Create Program */}
              <div className="md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setReqForCreateNewProgram(
                      !reqForCreateNewProgram,
                    )
                  }
                  className="
                    w-full
                    bg-background
                    border-input
                    text-foreground
                    hover:bg-muted
                    font-medium
                    h-10
                    text-xs
                    rounded-md
                    flex
                    items-center
                    justify-center
                    gap-1.5
                  "
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Program
                </Button>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* Beneficiary Information                                            */}
          {/* ================================================================ */}

          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <UserCheck className="h-4 w-4" />
              Beneficiary Information
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Indicators                                                       */}
            {/* -------------------------------------------------------------- */}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Assigned Indicators
              </Label>

              <MultiSelect
                options={indicators.map((indicator) => ({
                  value: indicator.id,
                  label: indicator.indicatorRef.toUpperCase(),
                }))}
                value={formData.indicators}
                onValueChange={(value: string[]) => {
                  handleFormChange({
                    target: {
                      name: "indicators",
                      value,
                    },
                  });
                }}
                placeholder="Assign Indicators"
                error={formErrors.indicators}
              />

              <FieldError field="indicators" />
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Fields                                                           */}
            {/* -------------------------------------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
              {/* Registration Date */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="dateOfRegistration"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Registration Date
                </Label>

                <Input
                  id="dateOfRegistration"
                  name="dateOfRegistration"
                  type="date"
                  disabled={!formData.program || isFetchingBeneficiary}
                  value={formData.dateOfRegistration}
                  onChange={handleFormChange}
                  min={registrationDateValidRange.start}
                  max={registrationDateValidRange.end}
                  className={inputClass("dateOfRegistration")}
                />

                <FieldError field="dateOfRegistration" />
              </div>

              {/* Beneficiary Code */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="code"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Beneficiary Code
                </Label>

                <Input
                  id="code"
                  name="code"
                  placeholder="Beneficiary code..."
                  value={formData.code}
                  onChange={handleFormChange}
                  className={inputClass("code")}
                />

                <FieldError field="code" />
              </div>

              {/* Client Name */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Client Name
                </Label>

                <Input
                  id="name"
                  name="name"
                  placeholder="Full name..."
                  value={formData.name}
                  onChange={handleFormChange}
                  className={inputClass("name")}
                />

                <FieldError field="name" />
              </div>

              {/* Father / Husband Name */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="fatherHusbandName"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Father / Husband Name
                </Label>

                <Input
                  id="fatherHusbandName"
                  name="fatherHusbandName"
                  placeholder="Father or husband's name..."
                  value={formData.fatherHusbandName}
                  onChange={handleFormChange}
                  className={inputClass("fatherHusbandName")}
                />

                <FieldError field="fatherHusbandName" />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Gender
                </Label>

                <SingleSelect
                  options={GenderOptions}
                  value={formData.gender}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "gender",
                        value,
                      },
                    })
                  }
                  error={formErrors.gender}
                />

                <FieldError field="gender" />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="age"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Age
                </Label>

                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Beneficiary age..."
                  value={formData.age}
                  onChange={handleFormChange}
                  className={inputClass("age")}
                />

                <FieldError field="age" />
              </div>

              {/* Child Beneficiary Code */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="childCode"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Child Beneficiary Code
                </Label>

                <Input
                  id="childCode"
                  name="childCode"
                  placeholder="Child beneficiary reference code..."
                  value={formData.childCode}
                  onChange={handleFormChange}
                  className={inputClass("childCode")}
                />

                <FieldError field="childCode" />
              </div>

              {/* Child Age */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="childAge"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Age of Beneficiary's Child
                </Label>

                <Input
                  id="childAge"
                  name="childAge"
                  type="number"
                  placeholder="Child's age..."
                  value={formData.childAge}
                  onChange={handleFormChange}
                  className={inputClass("childAge")}
                />

                <FieldError field="childAge" />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Client Phone
                </Label>

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number..."
                  value={formData.phone}
                  onChange={handleFormChange}
                  className={inputClass("phone")}
                />

                <FieldError field="phone" />
              </div>

              {/* Marital Status */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Marital Status
                </Label>

                <SingleSelect
                  options={MaritalStatusOptions}
                  value={formData.maritalStatus}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "maritalStatus",
                        value,
                      },
                    })
                  }
                  error={formErrors.maritalStatus}
                />

                <FieldError field="maritalStatus" />
              </div>

              {/* Household Status */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Beneficiary Household Status
                </Label>

                <SingleSelect
                  options={HousholdStatusOptions}
                  value={formData.householdStatus}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "householdStatus",
                        value,
                      },
                    })
                  }
                  error={formErrors.householdStatus}
                />

                <FieldError field="householdStatus" />
              </div>

              {/* Literacy */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="literacyLevel"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Beneficiary Literacy Level
                </Label>

                <Input
                  id="literacyLevel"
                  name="literacyLevel"
                  placeholder="Literacy level..."
                  value={formData.literacyLevel}
                  onChange={handleFormChange}
                  className={inputClass("literacyLevel")}
                />

                <FieldError field="literacyLevel" />
              </div>

              {/* Disability */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Disability Type
                </Label>

                <SingleSelect
                  options={DisabilityTypeOptions}
                  value={formData.disabilityType}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "disabilityType",
                        value,
                      },
                    })
                  }
                  error={formErrors.disabilityType}
                />

                <FieldError field="disabilityType" />
              </div>

              {/* Protection */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Referred for Protection
                </Label>

                <SingleSelect
                  options={ReferredForProtectionOptions}
                  value={
                    formData.referredForProtection
                      ? "true"
                      : "false"
                  }
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "referredForProtection",
                        value: value === "true",
                      },
                    })
                  }
                  error={formErrors.referredForProtection}
                />

                <FieldError field="referredForProtection" />
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* Create New Program                                                */}
          {/* ================================================================ */}

          {reqForCreateNewProgram && (
            <CreateNewProgramKit
              open={reqForCreateNewProgram}
              onOpenChange={setReqForCreateNewProgram}
              mode="create"
              createdProgramStateSetter={handleFormChange}
              programsListStateSetter={setPrograms}
            />
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Footer                                                              */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="
              bg-secondary
              text-secondary-foreground
              hover:bg-secondary/80
              rounded-md
              h-10
              text-xs
              font-medium
            "
          >
            Cancel
          </Button>

          <Button
            id={SUBMIT_BUTTON_PROVIDER_ID}
            disabled={isLoading || isFetchingBeneficiary}
            type="button"
            onClick={(e) =>
              reqForConfirmationModelFunc(
                KitDatabaseBeneficiaryEditionMessage,
                () => handleSubmit(e),
              )
            }
            className="
              bg-primary
              text-primary-foreground
              hover:bg-primary/90
              shadow-md
              font-medium
              rounded-md
              h-10
              text-xs
              min-w-[120px]
              flex
              items-center
              justify-center
              gap-2
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Update Beneficiary</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default withPermission(
  KitDatabaseBeneficiaryUpdateForm,
  "Kit.edit",
);

