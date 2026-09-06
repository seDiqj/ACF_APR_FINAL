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
import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";
import CreateNewProgramMain from "./CreateNewProgramMain";
import { MainDatabaseBeneficiaryFormSchema } from "@/schemas/FormsSchema";
import { MainDatabaseBeneficiary } from "@/types/Types";
import { MainDbBeneficiaryDefault } from "@/constants/FormsDefaultValues";
import { MainDatabaseBeneficiaryCreationMessage } from "@/constants/ConfirmationModelsTexts";
import {
  DisabilityTypeOptions,
  GenderOptions,
  HousholdStatusOptions,
  MaritalStatusOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";
import { MainDatabaseBeneficiaryCreation } from "@/interfaces/Interfaces";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { AxiosError, AxiosResponse } from "axios";
import { Loader2, Plus, Info, Landmark, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to format a date correctly without timezone shifting
export function toDateOnly(dateTime: string) {
  if (!dateTime) return "";
  return new Date(dateTime).toISOString().slice(0, 10);
}

const MainDatabaseBeneficiaryForm: React.FC<
  MainDatabaseBeneficiaryCreation
> = ({ open, onOpenChange, title, createdProgramStateSetter }) => {
  const {
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    requestHandler,
    handleReload,
  } = useParentContext();

  const [formData, setFormData] = useState<MainDatabaseBeneficiary>(
    MainDbBeneficiaryDefault()
  );

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [reqForProgramCreationForm, setReqForProgramCreationForm] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);

  const [registrationDateValidRange, setRegistrationDateValidRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "2025-01-01",
    end: "2025-02-01",
  });

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    const value: string = e.target.value;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: any) => {
    if (e && e.preventDefault) e.preventDefault();

    const result = MainDatabaseBeneficiaryFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: { [key: string]: string } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) errors[field as string] = issue.message;
      });

      setFormErrors(errors);

      reqForToastAndSetMessage(
        "Please resolve the validation errors before submitting.",
        "warning"
      );

      return;
    }

    setFormErrors({});
    setIsLoading(true);

    requestHandler()
      .post("/main_db/beneficiary", formData)
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
        onOpenChange(false);
        handleReload();
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "An error occurred.",
          "error"
        );
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!open) return;

    requestHandler()
      .get(`/global/programs_for_selection/main_database`)
      .then((response: any) => setPrograms(response.data.data.data))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );
  }, [open]);

  useEffect(() => {
    if (!formData.program) return;

    requestHandler()
      .get(`/date/project_date_range_acc_to_program/${formData.program}`)
      .then((response: AxiosResponse<any>) => {
        setRegistrationDateValidRange({
          start: toDateOnly(response.data.data.start),
          end: toDateOnly(response.data.data.end),
        });
      })
      .catch((error: AxiosError<any>) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );
  }, [formData.program]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-6 bg-card border border-border text-card-foreground shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            {title || "Register New Beneficiary in the Main Database"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {/* Program Information Section */}
          <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Program Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <SingleSelect
                  options={programs.map((program) => ({
                    value: program.id,
                    label: program.name.toString().toUpperCase(),
                  }))}
                  value={formData.program}
                  onValueChange={(value: string) => {
                    handleFormChange({
                      target: { name: "program", value },
                    });
                  }}
                  placeholder="Select an Existing Program"
                  error={formErrors.program}
                  searchURL="global/programs_for_selection/main_database"
                />
              </div>

              <div className="md:col-span-1 text-center text-xs font-bold text-muted-foreground">
                OR
              </div>

              <div className="md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setReqForProgramCreationForm(!reqForProgramCreationForm)
                  }
                  className="w-full bg-background border-input text-foreground hover:bg-muted font-medium h-10 text-xs rounded-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Program
                </Button>
              </div>
            </div>

            {formErrors.program && (
              <span className="text-[10px] font-medium text-destructive flex items-center gap-1 animate-in fade-in">
                <Info className="h-3 w-3" /> {formErrors.program}
              </span>
            )}
          </div>

          {/* Beneficiary Information Section */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <UserCheck className="h-4 w-4" />
              Beneficiary Information
            </div>

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
                  disabled={!formData.program}
                  type="date"
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.dateOfRegistration &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  min={registrationDateValidRange.start}
                  max={registrationDateValidRange.end}
                />

                {formErrors.dateOfRegistration && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" />
                    {formErrors.dateOfRegistration}
                  </span>
                )}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.code &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.code && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.code}
                  </span>
                )}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.name &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.name && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.name}
                  </span>
                )}
              </div>

              {/* Father or Husband Name */}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.fatherHusbandName &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.fatherHusbandName && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.fatherHusbandName}
                  </span>
                )}
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
                      target: { name: "gender", value },
                    });
                  }}
                  error={formErrors.gender}
                />

                {formErrors.gender && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.gender}
                  </span>
                )}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.age &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.age && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.age}
                  </span>
                )}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.childCode &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.childCode && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.childCode}
                  </span>
                )}
              </div>

              {/* Age of Beneficiary's Child */}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.childAge &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.childAge && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.childAge}
                  </span>
                )}
              </div>

              {/* Client Phone */}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.phone &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.phone && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.phone}
                  </span>
                )}
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
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: { name: "maritalStatus", value },
                    })
                  }
                  error={formErrors.maritalStatus}
                />

                {formErrors.maritalStatus && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.maritalStatus}
                  </span>
                )}
              </div>

              {/* Beneficiary Household Status */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="householdStatus"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Beneficiary Household Status
                </Label>

                <SingleSelect
                  options={HousholdStatusOptions}
                  value={formData.householdStatus}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: { name: "householdStatus", value },
                    })
                  }
                  error={formErrors.householdStatus}
                />

                {formErrors.householdStatus && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.householdStatus}
                  </span>
                )}
              </div>

              {/* Beneficiary Literacy Level */}
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
                  onChange={handleFormChange}
                  className={cn(
                    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                    formErrors.literacyLevel &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />

                {formErrors.literacyLevel && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.literacyLevel}
                  </span>
                )}
              </div>

              {/* Disability Type */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="disabilityType"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Disability Type
                </Label>

                <SingleSelect
                  options={DisabilityTypeOptions}
                  value={formData.disabilityType}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: { name: "disabilityType", value },
                    })
                  }
                  error={formErrors.disabilityType}
                />

                {formErrors.disabilityType && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" /> {formErrors.disabilityType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Connected Sub-Form for Creating a New Program */}
          {reqForProgramCreationForm && (
            <CreateNewProgramMain
              open={reqForProgramCreationForm}
              onOpenChange={setReqForProgramCreationForm}
              mode="create"
              createdProgramStateSetter={handleFormChange}
              programsListStateSetter={setPrograms}
            />
          )}
        </div>

        {/* Final Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md h-10 text-xs font-medium"
          >
            Cancel
          </Button>

          <Button
            id={SUBMIT_BUTTON_PROVIDER_ID}
            disabled={isLoading}
            type="button"
            onClick={(e) =>
              reqForConfirmationModelFunc(
                MainDatabaseBeneficiaryCreationMessage,
                () => handleSubmit(e)
              )
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-medium rounded-md h-10 text-xs min-w-[100px] flex items-center justify-center gap-2"
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
  MainDatabaseBeneficiaryForm,
  "Maindatabase.create"
);
