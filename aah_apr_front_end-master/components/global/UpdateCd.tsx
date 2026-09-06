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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useParentContext } from "@/contexts/ParentContext";
import { SingleSelect } from "@/components/single-select";
import { CommunityDialogBeneficiaryForm } from "@/types/Types";
import { CommunityDialogueUpdateInterface } from "@/interfaces/Interfaces";
import { CommunityDialogueBeneficiaryDefault } from "@/constants/FormsDefaultValues";
import {
  GenderOptions,
  incentiveReceivedOptions,
  MaritalStatusOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";
import { CdDatabaseBenefciaryEditionMessage } from "@/constants/ConfirmationModelsTexts";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const CommunityDialogueUpdateCD: React.FC<CommunityDialogueUpdateInterface> = ({
  open,
  onOpenChange,
  beneficiaryId,
}) => {
  const {
    requestHandler,
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<CommunityDialogBeneficiaryForm>(
    CommunityDialogueBeneficiaryDefault(),
  );

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open && beneficiaryId) {
      setLoading(true);
      requestHandler()
        .get(`/community_dialogue_db/beneficiary/${beneficiaryId}`)
        .then((res: any) => {
          const data = res.data;

          setFormData((prev) => ({
            ...prev,
            name: data.name ?? "",
            fatherHusbandName: data.fatherHusbandName ?? "",
            age: data.age ?? 0,
            maritalStatus: data.maritalStatus ?? "",
            gender: data.gender ?? "",
            phone: data.phone ?? "",
            nationalId: data.nationalId ?? "",
            jobTitle: data.jobTitle ?? "",
            incentiveReceived: data.incentiveReceived ?? false,
            incentiveAmount: data.incentiveAmount ?? "",
            dateOfRegistration: data.dateOfRegistration ?? "",
          }));
        })
        .catch((err: any) => {
          reqForToastAndSetMessage(
            err.response?.data?.message || "Error loading data",
          );
        })
        .finally(() => setLoading(false));
    }
  }, [open, beneficiaryId]);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    setIsLoading(true);
    requestHandler()
      .put(`/community_dialogue_db/beneficiary/${beneficiaryId}`, formData)
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message);
        onOpenChange(false);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "Update failed",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 rounded-md">Update</Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{
          maxHeight: "85vh",
          padding: "16px",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-center mb-4">
            Update Beneficiary Information
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                id="clientName"
                placeholder="Client Name"
                className="border w-full mt-4"
              />
            </div>

            <div>
              <Label htmlFor="fatherName">Father/Husband Name</Label>
              <Input
                name="fatherHusbandName"
                value={formData.fatherHusbandName}
                onChange={handleFormChange}
                id="fatherName"
                placeholder="Father/Husband Name"
                className="border w-full mt-4"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                name="age"
                value={formData.age}
                onChange={handleFormChange}
                id="age"
                type="number"
                placeholder="Age"
                className="border w-full mt-4"
              />
            </div>

            <div>
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

            <div>
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

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                id="phone"
                type="tel"
                placeholder="Phone"
                className="border w-full mt-4"
              />
            </div>

            <div>
              <Label htmlFor="nid">NID Number</Label>
              <Input
                name="nationalId"
                value={formData.nationalId}
                onChange={handleFormChange}
                id="nid"
                placeholder="NID Number"
                className="border w-full mt-4"
              />
            </div>

            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleFormChange}
                id="jobTitle"
                placeholder="Job Title"
                className="border w-full mt-4"
              />
            </div>

            <div>
              <Label htmlFor="incentiveReceived">Incentive Received</Label>
              <SingleSelect
                options={incentiveReceivedOptions}
                value={formData.incentiveReceived.toString()}
                onValueChange={(value: string) =>
                  handleFormChange({
                    target: {
                      name: "incentiveReceived",
                      value: value === "true",
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="incentiveAmount">Incentive Amount (AFG)</Label>
              <Input
                name="incentiveAmount"
                value={formData.incentiveAmount}
                onChange={handleFormChange}
                id="incentiveAmount"
                placeholder="Incentive Amount"
                className="border w-full mt-4"
              />
            </div>
          </div>
        )}

        {!loading && (
          <Button
            id={SUBMIT_BUTTON_PROVIDER_ID}
            disabled={isLoading}
            className="w-full mt-6"
            onClick={() =>
              reqForConfirmationModelFunc(
                CdDatabaseBenefciaryEditionMessage,
                handleSubmit,
              )
            }
          >
            {isLoading ? "Updating ..." : "Update"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommunityDialogueUpdateCD;
