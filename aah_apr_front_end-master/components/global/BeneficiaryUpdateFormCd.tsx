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

import { SingleSelect } from "@/components/single-select";

import { useParentContext } from "@/contexts/ParentContext";

import { CommunityDialogBeneficiaryForm } from "@/types/Types";

import { withPermission } from "@/lib/withPermission";

import { CdDatabaseBenefciaryFormSchema } from "@/schemas/FormsSchema";

import { CommunityDialogueBeneficiaryDefault } from "@/constants/FormsDefaultValues";

import { CdDatabaseBenefciaryEditionMessage } from "@/constants/ConfirmationModelsTexts";

import { CdDatabaseBeneficiaryUpdateFormInterface } from "@/interfaces/Interfaces";

import {
  GenderOptions,
  incentiveReceivedOptions,
  MaritalStatusOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";

import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

import { Loader2, UserCheck, Info, Users, ClipboardList } from "lucide-react";

import { cn } from "@/lib/utils";

const BeneficiaryUpdateCD: React.FC<
  CdDatabaseBeneficiaryUpdateFormInterface
> = ({ open, onOpenChange, beneficiaryId }) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<CommunityDialogBeneficiaryForm>(
    CommunityDialogueBeneficiaryDefault()
  );

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isFetchingBeneficiary, setIsFetchingBeneficiary] =
    useState<boolean>(false);

  /**
   * Handle all form changes
   */
  const handleFormChange = (e: any) => {
    const { name } = e.target;

    let value = e.target.value;

    /**
     * Convert number inputs to number while
     * allowing empty value during editing.
     */
    if (e.target.type === "number") {
      value = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    /**
     * Remove field validation error
     * as soon as the user changes the field.
     */
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * Update beneficiary
   */
  const handleUpdate = () => {
    const result = CdDatabaseBenefciaryFormSchema.safeParse(formData);

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
        "Please fix validation errors before submitting.",
        "warning"
      );

      return;
    }

    setFormErrors({});
    setIsLoading(true);

    requestHandler()
      .put(`/community_dialogue_db/beneficiary/${beneficiaryId}`, formData)
      .then((response: any) => {
        reqForToastAndSetMessage(
          response.data.message || "Updated successfully",
          "success"
        );

        onOpenChange(false);
        handleReload();
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Update failed",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * Load beneficiary data
   */
  useEffect(() => {
    if (!open || !beneficiaryId) return;

    setIsFetchingBeneficiary(true);
    setFormErrors({});

    requestHandler()
      .get(`/community_dialogue_db/beneficiary/${beneficiaryId}`)
      .then((response: any) => {
        const data = response.data.data;

        setFormData({
          ...CommunityDialogueBeneficiaryDefault(),
          ...data,

          age: data.age ?? "",
          incentiveReceived: Boolean(data.incentiveReceived),
          incentiveAmount: data.incentiveAmount ?? "",
          currancy: data.currancy ?? "",
          dateOfRegistration: data.dateOfRegistration ?? "",
          nationalId: data.nationalId ?? "",
          jobTitle: data.jobTitle ?? "",
          name: data.name ?? "",
          fatherHusbandName: data.fatherHusbandName ?? "",
          gender: data.gender ?? "",
          maritalStatus: data.maritalStatus ?? "",
          phone: data.phone ?? "",
          code: data.code ?? "",
        });
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load beneficiary data",
          "error"
        );
      })
      .finally(() => {
        setIsFetchingBeneficiary(false);
      });
  }, [open, beneficiaryId]);

  /**
   * Common input styling
   */
  const inputClassName = (fieldName: string) =>
    cn(
      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
      formErrors[fieldName] &&
        "border-destructive focus-visible:ring-destructive"
    );

  /**
   * Inline validation error
   */
  const ErrorMessage = ({ field }: { field: string }) => {
    if (!formErrors[field]) return null;

    return (
      <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
        <Info className="h-3 w-3" />
        {formErrors[field]}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-6 bg-card border border-border text-card-foreground shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Update Community Dialogue Beneficiary
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {/* Beneficiary Information Section */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <Users className="h-4 w-4" />
              Beneficiary Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
              {/* Client Name */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="clientName"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Client Name
                </Label>

                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  id="clientName"
                  placeholder="Enter client name..."
                  className={inputClassName("name")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="name" />
              </div>

              {/* Father / Husband Name */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="fatherName"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Father / Husband Name
                </Label>

                <Input
                  name="fatherHusbandName"
                  value={formData.fatherHusbandName}
                  onChange={handleFormChange}
                  id="fatherName"
                  placeholder="Enter father or husband name..."
                  className={inputClassName("fatherHusbandName")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="fatherHusbandName" />
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
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  id="age"
                  type="number"
                  placeholder="Enter age..."
                  className={inputClassName("age")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="age" />
              </div>

              {/* Marital Status */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="maritalStatus"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Marital Status
                </Label>

                <SingleSelect
                  options={MaritalStatusOptions}
                  value={formData.maritalStatus}
                  onValueChange={(value: string) => {
                    handleFormChange({
                      target: {
                        name: "maritalStatus",
                        value,
                      },
                    });
                  }}
                  error={formErrors.maritalStatus}
                />

                <ErrorMessage field="maritalStatus" />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gender"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Gender
                </Label>

                <SingleSelect
                  options={GenderOptions}
                  value={formData.gender}
                  onValueChange={(value: string) => {
                    handleFormChange({
                      target: {
                        name: "gender",
                        value,
                      },
                    });
                  }}
                  error={formErrors.gender}
                />

                <ErrorMessage field="gender" />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Phone Number
                </Label>

                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number..."
                  className={inputClassName("phone")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="phone" />
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
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  id="code"
                  placeholder="Enter beneficiary code..."
                  className={inputClassName("code")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="code" />
              </div>

              {/* NID */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="nid"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  National ID Number
                </Label>

                <Input
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleFormChange}
                  id="nid"
                  placeholder="Enter NID number..."
                  className={inputClassName("nationalId")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="nationalId" />
              </div>

              {/* Job Title */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="jobTitle"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Job Title
                </Label>

                <Input
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleFormChange}
                  id="jobTitle"
                  placeholder="Enter job title..."
                  className={inputClassName("jobTitle")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="jobTitle" />
              </div>

              {/* Incentive Received */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="incentiveReceived"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Incentive Received
                </Label>

                <SingleSelect
                  options={incentiveReceivedOptions}
                  value={formData.incentiveReceived.toString()}
                  onValueChange={(value: string) => {
                    handleFormChange({
                      target: {
                        name: "incentiveReceived",
                        value: value === "true",
                      },
                    });
                  }}
                  error={formErrors.incentiveReceived}
                />

                <ErrorMessage field="incentiveReceived" />
              </div>

              {/* Incentive Amount */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="incentiveAmount"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Incentive Amount (AFG)
                </Label>

                <Input
                  name="incentiveAmount"
                  value={formData.incentiveAmount}
                  onChange={handleFormChange}
                  id="incentiveAmount"
                  type="text"
                  placeholder="Enter incentive amount..."
                  className={inputClassName("incentiveAmount")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="incentiveAmount" />
              </div>

              {/* Currency */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="currancy"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Currency
                </Label>

                <Input
                  name="currancy"
                  value={formData.currancy}
                  onChange={handleFormChange}
                  id="currancy"
                  type="text"
                  placeholder="Enter currency..."
                  className={inputClassName("currancy")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="currancy" />
              </div>

              {/* Date Of Registration */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="dateOfRegistration"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Date of Registration
                </Label>

                <Input
                  id="dateOfRegistration"
                  name="dateOfRegistration"
                  value={formData.dateOfRegistration}
                  type="date"
                  onChange={handleFormChange}
                  className={inputClassName("dateOfRegistration")}
                  disabled={isFetchingBeneficiary}
                />

                <ErrorMessage field="dateOfRegistration" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
          {/* Cancel */}
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md h-10 text-xs font-medium"
          >
            Cancel
          </Button>

          {/* Update */}
          <Button
            id={SUBMIT_BUTTON_PROVIDER_ID}
            disabled={isLoading || isFetchingBeneficiary}
            type="button"
            onClick={() =>
              reqForConfirmationModelFunc(
                CdDatabaseBenefciaryEditionMessage,
                () => handleUpdate()
              )
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-medium rounded-md h-10 text-xs min-w-[150px] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : isFetchingBeneficiary ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading...</span>
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

export default withPermission(BeneficiaryUpdateCD, "Dialogue.edit");
