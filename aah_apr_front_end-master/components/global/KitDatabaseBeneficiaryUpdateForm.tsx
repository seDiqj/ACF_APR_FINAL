"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SingleSelect } from "../single-select";
import { MultiSelect } from "../multi-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";
import { KitDatabaseBeneficiaryUpdateFormType } from "@/types/Types";
import { KitDatabaseBeneficiaryUpdateDefault } from "@/constants/FormsDefaultValues";
import { KitDatabaseBeneficiaryEditionMessage } from "@/constants/ConfirmationModelsTexts";
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

  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);
  const [reqForCreateNewProgram, setReqForCreateNewProgram] =
    useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    let value: any = e.target.value;

    // Handle number inputs
    if (e.target.type === "number") value = Number(value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [registrationDateValidRange, setRegistrationDateValidRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "2025-1-1",
    end: "2025-2-1",
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const result = KitDatabaseBeneficiaryFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) errors[field as string] = issue.message;
      });

      setFormErrors(errors);
      reqForToastAndSetMessage(
        "Please fix validation errors before updating.",
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
          error.response?.data?.message || "Update failed",
          "error",
        );
      })
      .finally(() => setIsLoading(false));
  };

  // Fetch beneficiary data
  useEffect(() => {
    if (open && beneficiaryId) {
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
            age: data.age || 0,
            maritalStatus: data.maritalStatus || "",
            childCode: data.childCode || "",
            childAge: data.childAge || 0,
            phone: data.phone || "",
            householdStatus: data.householdStatus || "",
            literacyLevel: data.literacyLevel || "",
            disabilityType: data.disabilityType || "",
            referredForProtection: data.protectionServices || false,
          });
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error loading beneficiary",
            "error",
          );
        });
    }
  }, [open, beneficiaryId]);

  // Fetch programs & indicators
  useEffect(() => {
    if (open) {
      requestHandler()
        .get(`global/programs_for_selection/kit_database`)
        .then((res: AxiosResponse<any, any>) => setPrograms(res.data.data.data))
        .catch((err: AxiosError<any, any>) =>
          reqForToastAndSetMessage(err.response?.data?.message, "error"),
        );
    }
  }, [open]);

  useEffect(() => {
    if (!formData.program) return;
    requestHandler()
      .get(`/global/indicators/${formData.program}/kit_database`)
      .then((response: any) => {
        setIndicators(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );

    requestHandler()
      .get(`/date/project_date_range_acc_to_program/${formData.program}`)
      .then((response: AxiosResponse<any, any>) => {
        setRegistrationDateValidRange({
          start: toDateOnly(response.data.data.start),
          end: toDateOnly(response.data.data.end),
        });
      })
      .catch((error: AxiosError<any, any>) =>
        reqForToastAndSetMessage(error.response?.data.message, "error"),
      );
  }, [formData.program]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{ maxHeight: "85vh", padding: "10px 16px" }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>

        <div className="w-full">
          <div className="bg-white-200 text-black-800 font-bold text-base text-center px-6 py-2 rounded-xl mb-6 shadow-sm max-w-fit mx-auto">
            Program Information
          </div>

          <div className="flex flex-col gap-2">
            {/* Program Selector */}
            <div className="flex flex-col w-full border-2 rounded-2xl">
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
                      value: value,
                    },
                  });
                }}
                placeholder="Select Exising Program"
                error={formErrors.program}
                searchURL="global/programs_for_selection/kit_database"
              ></SingleSelect>
            </div>
            {/* Seperator */}
            <div>
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            </div>

            {/* Create New Program Button */}
            <div className="w-full border-2 rounded-2xl">
              <Button
                onClick={() =>
                  setReqForCreateNewProgram(!reqForCreateNewProgram)
                }
                className="w-full"
              >
                Create New Program
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full mt-4">
          <div className="bg-white-200 text-black-800 font-bold text-base text-center px-6 py-2 rounded-xl mb-6 shadow-sm max-w-fit mx-auto">
            Update Beneficiary Information
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col w-full border-2 rounded-2xl">
              <MultiSelect
                options={indicators.map((indicator) => ({
                  value: indicator.id,
                  label: indicator.indicatorRef.toUpperCase(),
                }))}
                value={formData.indicators}
                onValueChange={(value: string[]) =>
                  setFormData((prev) => ({ ...prev, indicators: value }))
                }
                placeholder="Assign Indicator"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Of Registration */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="dateOfRegistration">Date Of Registration</Label>
                <Input
                  id="dateOfRegistration"
                  name="dateOfRegistration"
                  type="date"
                  className="border w-full"
                  value={formData.dateOfRegistration}
                  onChange={handleFormChange}
                  min={registrationDateValidRange.start}
                  max={registrationDateValidRange.end}
                />
              </div>

              {/* Beneficiary Code */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="code">Beneficiary Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Code ..."
                  className="border w-full"
                  value={formData.code}
                  onChange={handleFormChange}
                />
              </div>

              {/* Client Name */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Client Name ..."
                  className="border w-full"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>

              {/* Father / Husbend Name */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="fatherHusbandName">Father / Husbend Name</Label>
                <Input
                  id="fatherHusbandName"
                  name="fatherHusbandName"
                  placeholder="Father / Husbend Name ..."
                  className="border w-full"
                  value={formData.fatherHusbandName}
                  onChange={handleFormChange}
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="gender">Gender</Label>
                <SingleSelect
                  options={GenderOptions}
                  value={formData.gender}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: { name: "gender", value },
                    })
                  }
                />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Age ..."
                  className="border w-full"
                  value={formData.age}
                  onChange={handleFormChange}
                />
              </div>

              {/* Child Code */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="childCode">Child Of BNF Code</Label>
                <Input
                  id="childCode"
                  name="childCode"
                  placeholder="Child Code ..."
                  className="border w-full"
                  value={formData.childCode}
                  onChange={handleFormChange}
                />
              </div>

              {/* Age Of Child */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="childAge">Age Of Child OF BNF</Label>
                <Input
                  id="childAge"
                  name="childAge"
                  type="number"
                  placeholder="Age Of Child ..."
                  className="border w-full"
                  value={formData.childAge}
                  onChange={handleFormChange}
                />
              </div>

              {/* Client Phone */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="phone">Client Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone ..."
                  className="border w-full"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>

              {/* Marital Status */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <SingleSelect
                  options={MaritalStatusOptions}
                  value={formData.maritalStatus}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: { name: "maritalStatus", value },
                    })
                  }
                />
              </div>

              {/* Household Status */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="householdStatus">HouseHold Status of BNF</Label>
                <SingleSelect
                  options={HousholdStatusOptions}
                  value={formData.householdStatus}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: { name: "householdStatus", value },
                    })
                  }
                />
              </div>

              {/* Literacy Level */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="literacyLevel">Literacy Level Of BNF</Label>
                <Input
                  id="literacyLevel"
                  name="literacyLevel"
                  placeholder="Literacy Level ..."
                  className="border w-full"
                  value={formData.literacyLevel}
                  onChange={handleFormChange}
                />
              </div>

              {/* Disability Type */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="disabilityType">Disability Type</Label>
                <SingleSelect
                  options={DisabilityTypeOptions}
                  value={formData.disabilityType}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: { name: "disabilityType", value },
                    })
                  }
                />
              </div>

              {/* Referred For Protection */}
              <div className="flex flex-col gap-4">
                <Label htmlFor="referredForProtection">
                  Referred For Protection
                </Label>
                <SingleSelect
                  options={ReferredForProtectionOptions}
                  value={formData.referredForProtection ? "true" : "false"}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "referredForProtection",
                        value: value === "true" ? true : false,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          id={SUBMIT_BUTTON_PROVIDER_ID}
          disabled={isLoading}
          type="button"
          className="w-full mt-6"
          onClick={(e) =>
            reqForConfirmationModelFunc(
              KitDatabaseBeneficiaryEditionMessage,
              () => handleSubmit(e),
            )
          }
        >
          {isLoading ? "Updating ..." : "Update"}
        </Button>

        {/* Program create form */}
        {reqForCreateNewProgram && (
          <CreateNewProgramKit
            open={reqForCreateNewProgram}
            onOpenChange={setReqForCreateNewProgram}
            mode="create"
            createdProgramStateSetter={handleFormChange}
            programsListStateSetter={setPrograms}
          ></CreateNewProgramKit>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default withPermission(KitDatabaseBeneficiaryUpdateForm, "Kit.edit");
