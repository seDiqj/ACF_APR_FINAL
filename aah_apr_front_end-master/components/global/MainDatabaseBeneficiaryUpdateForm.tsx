"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SingleSelect } from "../single-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";
import { Skeleton } from "../ui/skeleton";
import { MainDatabaseBeneficiaryUpdateType } from "@/types/Types";
import { MainDatabaseBeneficiaryUpdateDefault } from "@/constants/FormsDefaultValues";
import {
  DisabilityTypeOptions,
  GenderOptions,
  HousholdStatusOptions,
  MaritalStatusOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";
import { MainDatabaseBeneficiaryEditionMessage } from "@/constants/ConfirmationModelsTexts";
import { MainDatabaseBeneficiaryUpdate } from "@/interfaces/Interfaces";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { AxiosError, AxiosResponse } from "axios";
import { MainDatabaseBeneficiaryFormSchema } from "@/schemas/FormsSchema";
import { toDateOnly } from "./MainDatabaseBeneficiaryCreationForm";

const MainDatabaseBeneficiaryUpdateForm: React.FC<
  MainDatabaseBeneficiaryUpdate
> = ({ open, onOpenChange, beneficiaryId }) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<MainDatabaseBeneficiaryUpdateType>(
    MainDatabaseBeneficiaryUpdateDefault(),
  );
  const [program, setProgram] = useState<string>("");
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch beneficiary data
  useEffect(() => {
    if (open && beneficiaryId) {
      requestHandler()
        .get(`/main_db/beneficiary/${beneficiaryId}`)
        .then((response: any) => {
          
          const data = response.data.data;
          console.log(data)
          setFormData({
            id: beneficiaryId,
            program: data.programs[0]?.id || "",
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
          });
          setProgram(data.programs[0].id || "");
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error loading beneficiary",
            "error",
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, beneficiaryId]);

  useEffect(() => {
    if (open) {
      requestHandler()
        .get(`global/programs_for_selection/main_database`)
        .then((res: AxiosResponse<any, any>) => {
          setPrograms(res.data.data.data);
        })
        .catch((err: AxiosError<any, any>) =>
          reqForToastAndSetMessage(err.response?.data?.message, "error"),
        );
    }
  }, [open]);

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    let value: string = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const result = MainDatabaseBeneficiaryFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) errors[field as string] = issue.message;
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

    setIsLoading(true);
    requestHandler()
      .put(`/main_db/beneficiary/${beneficiaryId}`, {
        bnfData: formData,
        program: program,
      })
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

  const [registrationDateValidRange, setRegistrationDateValidRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "2025-1-1",
    end: "2025-2-1",
  });

  useEffect(() => {
    if (!formData.program) return;

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

  const renderSkeletonInput = () => (
    <Skeleton className="h-10 w-full rounded-md bg-gray-500" />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{ maxHeight: "85vh", padding: "10px 16px" }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">{"Edit Beneficiary"}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-md bg-gray-500" />{" "}
              {/* Label Skeleton */}
              {renderSkeletonInput()}
            </div>
          ))
        ) : (
          <div className="w-full mt-4">
            <div className="bg-white-200 text-black-800 font-bold text-base text-center px-6 py-2 rounded-xl mb-6 shadow-sm max-w-fit mx-auto">
              Update Beneficiary Information
            </div>

            <div className="flex flex-col gap-4 w-full">
              <Label>Program</Label>

              <div className="flex flex-col w-full border-2 rounded-2xl">
                <SingleSelect
                  options={programs.map((program) => ({
                    value: program?.id,
                    label: program?.name,
                  }))}
                  value={formData.program}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({
                      ...prev,
                      program: value,
                    }))
                  }
                  placeholder="Select Program "
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Of Registration */}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="dateOfRegistration">
                    Date Of Registration
                  </Label>
                  <Input
                    id="dateOfRegistration"
                    name="dateOfRegistration"
                    type="date"
                    value={formData.dateOfRegistration}
                    onChange={handleFormChange}
                    className={`border rounded-xl p-2 rounded ${
                      formErrors.dateOfRegistration ? "!border-red-500" : ""
                    } w-full`}
                    title={
                      formErrors.dateOfRegistration
                        ? formErrors["dateOfRegistration"]
                        : undefined
                    }
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
                    value={formData.code}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.code ? "!border-red-500" : ""
                    } w-full`}
                    title={formErrors.code ? formErrors["code"] : undefined}
                  />
                </div>

                {/* Client Name */}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Client Name ..."
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.name ? "!border-red-500" : ""
                    } w-full`}
                    title={formErrors.name ? formErrors["name"] : undefined}
                  />
                </div>

                {/* Father / Husbend Name */}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="fatherHusbandName">
                    Father / Husbend Name
                  </Label>
                  <Input
                    id="fatherHusbandName"
                    name="fatherHusbandName"
                    placeholder="Father / Husbend Name ..."
                    value={formData.fatherHusbandName}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.fatherHusbandName ? "!border-red-500" : ""
                    } w-full`}
                    title={
                      formErrors.fatherHusbandName
                        ? formErrors["fatherHusbandName"]
                        : undefined
                    }
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
                    error={formErrors.gender}
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
                    value={formData.age}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.age ? "!border-red-500" : ""
                    } w-full`}
                    title={formErrors.age ? formErrors["age"] : undefined}
                  />
                </div>

                {/* Child Code */}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="childCode">Child Of BNF Code</Label>
                  <Input
                    id="childCode"
                    name="childCode"
                    placeholder="Child Code ..."
                    value={formData.childCode}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.childCode ? "!border-red-500" : ""
                    } w-full`}
                    title={
                      formErrors.childCode ? formErrors["childCode"] : undefined
                    }
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
                    value={formData.childAge}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.childAge ? "!border-red-500" : ""
                    } w-full`}
                    title={
                      formErrors.childAge ? formErrors["childAge"] : undefined
                    }
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
                    value={formData.phone}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.phone ? "!border-red-500" : ""
                    } w-full`}
                    title={formErrors.phone ? formErrors["phone"] : undefined}
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
                    error={formErrors.maritalStatus}
                  />
                </div>

                {/* Household Status */}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="householdStatus">
                    HouseHold Status of BNF
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
                </div>

                {/* Literacy Level */}
                <div className="flex flex-col gap-4">
                  <Label htmlFor="literacyLevel">Literacy Level Of BNF</Label>
                  <Input
                    id="literacyLevel"
                    name="literacyLevel"
                    placeholder="Literacy Level ..."
                    value={formData.literacyLevel}
                    onChange={handleFormChange}
                    className={`border p-2 rounded ${
                      formErrors.literacyLevel ? "!border-red-500" : ""
                    } w-full`}
                    title={
                      formErrors.literacyLevel
                        ? formErrors["literacyLevel"]
                        : undefined
                    }
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
                    error={formErrors.disabilityType}
                  />
                </div>
              </div>
              {/* Submit */}
              <Button
                id={SUBMIT_BUTTON_PROVIDER_ID}
                disabled={isLoading}
                className="w-full mt-6"
                type="button"
                onClick={(e) =>
                  reqForConfirmationModelFunc(
                    MainDatabaseBeneficiaryEditionMessage,
                    () => handleSubmit(e),
                  )
                }
              >
                {isLoading ? "Updating ..." : "Update"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default withPermission(MainDatabaseBeneficiaryUpdateForm, "Kit.edit");
