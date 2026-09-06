"use client";

import * as React from "react";
import { useState } from "react";
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
import { CdDatabaseBeneficiaryCreationMessage } from "@/constants/ConfirmationModelsTexts";
import { CdDatabaseBeneficiaryCreationFormInterface } from "@/interfaces/Interfaces";
import {
  GenderOptions,
  incentiveReceivedOptions,
  MaritalStatusOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { Loader2, UserCheck, Info, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const BeneficiaryCreateCD: React.FC<
  CdDatabaseBeneficiaryCreationFormInterface
> = ({ open, onOpenChange }) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<CommunityDialogBeneficiaryForm>(
    CommunityDialogueBeneficiaryDefault(),
  );

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);


  const handleFormChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = () => {
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
        "warning",
      );

      return;
    }

    setFormErrors({});
    setIsLoading(true);

    requestHandler()
      .post("/community_dialogue_db/beneficiary", formData)
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
        onOpenChange(false);
        handleReload();
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "An error occurred.",
          "error",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  const inputClassName = (fieldName: string) =>
    cn(
      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
      formErrors[fieldName] &&
        "border-destructive focus-visible:ring-destructive",
    );

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
            Create New Community Dialogue Beneficiary
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
                  type="date"
                  onChange={handleFormChange}
                  className={inputClassName("dateOfRegistration")}
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

          {/* Save */}
          <Button
            id={SUBMIT_BUTTON_PROVIDER_ID}
            disabled={isLoading}
            type="button"
            onClick={() =>
              reqForConfirmationModelFunc(
                CdDatabaseBeneficiaryCreationMessage,
                () => handleSubmit(),
              )
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-medium rounded-md h-10 text-xs min-w-[130px] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Beneficiary"
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default withPermission(
  BeneficiaryCreateCD,
  "Dialogue.create",
);