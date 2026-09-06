"use client";

import * as React from "react";
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
import { SingleSelect } from "../single-select";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { PsychoeducationForm } from "@/types/Types";
import { PsychoeducationDefault } from "@/constants/FormsDefaultValues";
import { UpdatePsychoeducationInterface } from "@/interfaces/Interfaces";
import { PsychoeducationEditionMessage } from "@/constants/ConfirmationModelsTexts";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const UpdatePsychoeducation: React.FC<UpdatePsychoeducationInterface> = ({
  open,
  onOpenChange,
  psychoId,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<PsychoeducationForm>(
    PsychoeducationDefault(),
  );

  useEffect(() => {
    if (!open || !psychoId) return;
    requestHandler()
      .get(`/psychoeducation_db/psychoeducation/${psychoId}`)
      .then((res: any) => setFormData(res.data.data))
      .catch((err: any) =>
        reqForToastAndSetMessage(
          err.response?.data?.message || "Failed to load data.",
        ),
      );
  }, [open, psychoId]);

  const handleFormChange = (e: any, part: "program" | "psychoeducation") => {
    const { name, value } = e.target;
    part === "program"
      ? setFormData((prev) => ({
          ...prev,
          programInformation: {
            ...prev.programInformation,
            [name]: value,
          },
        }))
      : setFormData((prev) => ({
          ...prev,
          psychoeducationInformation: {
            ...prev.psychoeducationInformation,
            [name]: value,
          },
        }));
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUpdate = () => {
    setIsLoading(true);
    requestHandler()
      .put(`/psychoeducation_db/psychoeducation/${psychoId}`, formData)
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message);
        onOpenChange(false);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message),
      )
      .finally(() => setIsLoading(false));
  };

  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [projects, setProjects] = useState<
    { id: string; projectCode: string }[]
  >([]);

  useEffect(() => {
    requestHandler()
      .get("/global/projects")
      .then((res: any) => setProjects(Object.values(res.data.data)))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message),
      );
  }, []);

  useEffect(() => {
    if (!formData.programInformation.project_id) return;

    const projectId = formData.programInformation.project_id;
    requestHandler()
      .get(`projects/indicators/psychoeducation_database/${projectId}`)
      .then((response: any) => setIndicators(response.data.data))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message),
      );

    requestHandler()
      .get("/global/districts")
      .then((res: any) => setDistricts(Object.values(res.data.data)))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message),
      );

    requestHandler()
      .get(`projects/provinces/${projectId}`)
      .then((res: any) => setProvinces(Object.values(res.data.data)))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message),
      );
  }, [formData.programInformation.project_id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{ maxHeight: "85vh", padding: "10px 16px" }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">Update Psychoeducation</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <Label>Project Code</Label>
            <SingleSelect
              options={projects.map((project) => ({
                value: project.projectCode,
                label: project.projectCode.toUpperCase(),
              }))}
              value={
                projects.find(
                  (p) => p.id == formData.programInformation.project_id,
                )?.projectCode ?? ""
              }
              onValueChange={(value: string) =>
                handleFormChange(
                  {
                    target: {
                      name: "project_id",
                      value: projects.find((p) => p.projectCode == value)?.id,
                    },
                  },
                  "program",
                )
              }
            />
          </div>

          <div>
            <Label>Select Indicator</Label>
            <SingleSelect
              options={indicators.map((i) => ({
                value: i.indicatorRef,
                label: i.indicatorRef,
              }))}
              value={
                indicators.find(
                  (i) => i.id === formData.programInformation.indicator_id,
                )?.indicatorRef ?? ""
              }
              onValueChange={(value: string) =>
                handleFormChange(
                  {
                    target: {
                      name: "indicator_id",
                      value: indicators.find((i) => i.indicatorRef === value)
                        ?.id,
                    },
                  },
                  "program",
                )
              }
            />
          </div>

          <div>
            <Label>Focal Point</Label>
            <Input
              name="focalPoint"
              value={formData.programInformation.focalPoint}
              onChange={(e) => handleFormChange(e, "program")}
            />
          </div>

          <div>
            <Label>Province</Label>
            <SingleSelect
              options={provinces.map((p) => ({
                value: p.name,
                label: p.name.toUpperCase(),
              }))}
              value={
                provinces.find(
                  (p) => p.id == formData.programInformation.province_id,
                )?.name ?? ""
              }
              onValueChange={(value: string) =>
                handleFormChange(
                  {
                    target: {
                      name: "province_id",
                      value: provinces.find((p) => p.name == value)?.id,
                    },
                  },
                  "program",
                )
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Topic of Awareness</Label>
          <Input
            name="awarenessTopic"
            value={formData.psychoeducationInformation.awarenessTopic}
            onChange={(e) => handleFormChange(e, "psychoeducation")}
          />
        </div>

        <div className="mt-4">
          <Label>Date of Awareness</Label>
          <Input
            type="date"
            name="awarenessDate"
            value={formData.psychoeducationInformation.awarenessDate}
            onChange={(e) => handleFormChange(e, "psychoeducation")}
          />
        </div>

        <Button
          id={SUBMIT_BUTTON_PROVIDER_ID}
          disabled={isLoading}
          className="w-full mt-6"
          onClick={() =>
            reqForConfirmationModelFunc(
              PsychoeducationEditionMessage,
              handleUpdate,
            )
          }
        >
          {isLoading ? "Updating ..." : "Update"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePsychoeducation;
