"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useParentContext } from "@/contexts/ParentContext";
import { ChapterForm, TrainingForm } from "@/types/Types";
import {
  ChapterDefault,
  TrainingDefault,
} from "@/constants/FormsDefaultValues";
import { TrainingUpdateInterface } from "@/interfaces/Interfaces";

const UpdateTrainingForm: React.FC<TrainingUpdateInterface> = ({
  open,
  onOpenChange,
  title,
  trainingId,
}) => {
  const { reqForToastAndSetMessage, requestHandler } = useParentContext();

  const [formData, setFormData] = useState<TrainingForm>(TrainingDefault());

  const [chapter, setChapter] = useState<ChapterForm>(ChapterDefault());

  const [chapters, setChapters] = useState<ChapterForm[]>([]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = <T extends keyof TrainingForm>(
    field: T,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChapter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddChapter = () => {
    if (!chapter.topic) return;
    setChapters((prev) => [...prev, chapter]);
    setChapter({
      id: null,
      topic: "",
      facilitatorName: "",
      facilitatorJobTitle: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleDeleteChapter = (index: number) => {
    setChapters((prev) => prev.filter((_, i) => i !== index));
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    requestHandler()
      .put(`/training_db/training/${trainingId}`, { ...formData, chapters })
      .then((response: any) => reqForToastAndSetMessage(response.data.message))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message || "Error")
      )
      .finally(() => setIsLoading(false));
  };

  const [districts, setDistricts] = useState<{ name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ name: string }[]>([]);
  const [projects, setProjects] = useState<{ projectCode: string }[]>([]);
  const [indicators, setIndicators] = useState<{ indicator: string }[]>([]);

  useEffect(() => {
    requestHandler()
      .get("/global/districts")
      .then((res: any) => setDistricts(Object.values(res.data.data)));
    requestHandler()
      .get("/global/provinces")
      .then((res: any) => setProvinces(Object.values(res.data.data)));
    requestHandler()
      .get("/global/projects")
      .then((res: any) => setProjects(Object.values(res.data.data)));
    requestHandler()
      .get("/global/indicators/training_database")
      .then((res: any) => setIndicators(Object.values(res.data.data)));
  }, []);

  useEffect(() => {
    if (!trainingId || !open) return;

    requestHandler()
      .get(`/training_db/training/${trainingId}`)
      .then((res: any) => {
        const data = res.data.data;
        setFormData({
          id: data.id,
          project_id: data.project_id,
          province_id: data.province,
          district_id: data.district,
          trainingLocation: data.trainingLocation,
          name: data.name,
          participantCatagory: data.participantCatagory,
          aprIncluded: data.aprIncluded,
          trainingModality: data.trainingModality,
          startDate: data.startDate,
          endDate: data.endDate,
          indicator_id: data.indicator,
        });
        setChapters(data.chapters || []);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message || "Error")
      );
  }, [trainingId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{ maxHeight: "85vh", padding: "16px" }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="col-span-2 text-center font-bold mb-4">
            Program Information
          </h2>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTrainingForm;
