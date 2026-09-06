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
import { Checkbox } from "../ui/checkbox";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { TrainingForm, ChapterForm } from "@/types/Types";

import {
  ChapterDefault,
  TrainingDefault,
} from "@/constants/FormsDefaultValues";

import {
  TrainingCreationMessage,
  TrainingEditionMessage,
} from "@/constants/ConfirmationModelsTexts";

import { TrainingFormInterface } from "@/interfaces/Interfaces";

import {
  IsCreateMode,
  IsEditMode,
  IsEditOrShowMode,
  IsNotANullOrUndefinedValue,
  IsNotShowMode,
  IsShowMode,
} from "@/constants/Constants";

import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

import {
  TrainingFormSchema,
  TrainingChapterSchema,
} from "@/schemas/FormsSchema";

import { AxiosError, AxiosResponse } from "axios";

import CreateNewChapterForm from "./CreateNewChapterForm";

import { toDateOnly } from "./MainDatabaseBeneficiaryCreationForm";

import { Info, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useParentContext } from "@/contexts/ParentContext";

/* -------------------------------------------------------------------------- */
/*                              Field Error                                   */
/* -------------------------------------------------------------------------- */

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
      <Info className="h-3 w-3" />
      {message}
    </p>
  );
};

/* -------------------------------------------------------------------------- */
/*                            Main Component                                  */
/* -------------------------------------------------------------------------- */

const TrainingFormDialog: React.FC<TrainingFormInterface> = ({
  open,
  onOpenChange,
  title,
  mode,
  id,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  /* ------------------------------------------------------------------------ */
  /*                                  States                                  */
  /* ------------------------------------------------------------------------ */

  const [reqForChpaterEditForm, setReqForChapterEditForm] =
    useState<boolean>(false);

  const [chapterId, setChapterId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<TrainingForm>(TrainingDefault());

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const [chapterErrors, setChapterErrors] = useState<{
    [key: string]: string;
  }>({});

  const [chapters, setChapters] = useState<ChapterForm[]>([]);

  const [chapter, setChapter] = useState<ChapterForm>(ChapterDefault());

  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );

  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
    []
  );

  const [projects, setProjects] = useState<
    { id: string; projectCode: string }[]
  >([]);

  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);

  const [registrationDateValidRange, setRegistrationDateValidRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });

  const isReadOnly = IsShowMode(mode);

  /* ------------------------------------------------------------------------ */
  /*                             Helper Functions                             */
  /* ------------------------------------------------------------------------ */

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;

      const newErrors = { ...prev };

      delete newErrors[field];

      return newErrors;
    });
  };

  const clearChapterError = (field: string) => {
    setChapterErrors((prev) => {
      if (!prev[field]) return prev;

      const newErrors = { ...prev };

      delete newErrors[field];

      return newErrors;
    });
  };

  /* ------------------------------------------------------------------------ */
  /*                             Form Change Handler                          */
  /* ------------------------------------------------------------------------ */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | {
          target: {
            name: string;
            value: string;
          };
        }
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearFieldError(name);
  };

  /* ------------------------------------------------------------------------ */
  /*                           Checkbox Change Handler                        */
  /* ------------------------------------------------------------------------ */

  const handleCheckboxChange = <T extends keyof TrainingForm>(
    field: T,
    value: TrainingForm[T]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    clearFieldError(field as string);
  };

  /* ------------------------------------------------------------------------ */
  /*                            Chapter Change Handler                         */
  /* ------------------------------------------------------------------------ */

  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setChapter((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearChapterError(name);
  };

  /* ------------------------------------------------------------------------ */
  /*                              Add Chapter                                 */
  /* ------------------------------------------------------------------------ */

  const handleAddChapter = () => {
    const result = TrainingChapterSchema.safeParse(chapter);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");

        if (path) {
          errors[path] = issue.message;
        }
      });

      setChapterErrors(errors);

      reqForToastAndSetMessage(
        "Please fix chapter validation errors before adding.",
        "warning"
      );

      return;
    }

    setChapterErrors({});

    setChapters((prev) => [
      ...prev,
      {
        ...result.data,
      } as ChapterForm,
    ]);

    setChapter(ChapterDefault());

    reqForToastAndSetMessage("Chapter added successfully.", "success");
  };

  /* ------------------------------------------------------------------------ */
  /*                            Delete Chapter                                */
  /* ------------------------------------------------------------------------ */

  const handleDeleteChapter = (
    chapterDatabaseId: string | null,
    index: number
  ) => {
    if (IsNotANullOrUndefinedValue(chapterDatabaseId)) {
      requestHandler()
        .delete(`training_db/training/chapter/${chapterDatabaseId}`)
        .then((response: AxiosResponse<any, any>) => {
          reqForToastAndSetMessage(response.data.message, "success");

          setChapters((prev) => prev.filter((_, i) => i !== index));
        })
        .catch((error: AxiosError<any, any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Failed to delete chapter.",
            "error"
          );
        });

      return;
    }

    setChapters((prev) => prev.filter((_, i) => i !== index));
  };

  /* ------------------------------------------------------------------------ */
  /*                              Submit Form                                 */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async () => {
    const validationData = {
      ...formData,
      chapters,
    };

    const result = TrainingFormSchema.safeParse(validationData);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");

        if (path) {
          errors[path] = issue.message;
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

    const payload = {
      ...formData,
      chapters,
    };

    setIsLoading(true);

    try {
      let response;

      if (IsEditMode(mode) && id) {
        response = await requestHandler().put(
          `/training_db/training/${id}`,
          payload
        );
      } else if (IsCreateMode(mode)) {
        response = await requestHandler().post(
          "/training_db/training",
          payload
        );
      } else {
        return;
      }

      reqForToastAndSetMessage(response.data.message, "success");

      handleReload();

      onOpenChange(false);
    } catch (error: any) {
      reqForToastAndSetMessage(
        error.response?.data?.message ||
          "Something went wrong while saving the training.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                            Load Training Data                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (IsEditOrShowMode(mode) && IsNotANullOrUndefinedValue(id)) {
      setLoading(true);

      requestHandler()
        .get(`/training_db/training_for_edit/${id}`)
        .then((response: any) => {
          const data = response.data.data;

          setFormData({
            id: data.id || null,

            project_id: data.project_id || "",

            province_id: data.province_id || "",

            district_id: data.district_id || "",

            trainingLocation: data.trainingLocation || "",

            name: data.name || "",

            participantCatagory: data.participantCatagory || "",

            aprIncluded: data.aprIncluded ?? true,

            trainingModality: data.trainingModality || "",

            startDate: data.startDate ? toDateOnly(data.startDate) : "",

            endDate: data.endDate ? toDateOnly(data.endDate) : "",

            indicator_id: data.indicator_id || "",
          });

          setChapters(
            data.chapters?.map((item: ChapterForm) => ({
              ...item,

              startDate: item.startDate ? toDateOnly(item.startDate) : "",

              endDate: item.endDate ? toDateOnly(item.endDate) : "",
            })) || []
          );
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error loading training data.",
            "error"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mode, id]);

  /* ------------------------------------------------------------------------ */
  /*                              Load Projects                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    requestHandler()
      .get("/projects/p/training_database")
      .then((res: any) => {
        setProjects(Object.values(res.data.data));
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load projects.",
          "error"
        );
      });
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                              Load Districts                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    requestHandler()
      .get("/global/districts")
      .then((res: any) => {
        setDistricts(Object.values(res.data.data));
      })
      .catch((error: AxiosError<any, any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load districts.",
          "error"
        );
      });
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                   Load Project Related Information                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!formData.project_id) {
      setProvinces([]);

      setIndicators([]);

      setRegistrationDateValidRange({
        start: "",
        end: "",
      });

      return;
    }

    const projectId = formData.project_id;

    requestHandler()
      .get(`/global/project/provinces/${projectId}`)
      .then((res: any) => {
        setProvinces(Object.values(res.data.data));
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load provinces.",
          "error"
        );
      });

    requestHandler()
      .get(`projects/indicators/training_database/${projectId}`)
      .then((res: any) => {
        setIndicators(res.data.data || []);
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load indicators.",
          "error"
        );
      });

    requestHandler()
      .get(`/date/project_date_range/${projectId}`)
      .then((response: AxiosResponse<any, any>) => {
        setRegistrationDateValidRange({
          start: toDateOnly(response.data.data.start),
          end: toDateOnly(response.data.data.end),
        });
      })
      .catch((error: AxiosError<any, any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load project date range.",
          "error"
        );
      });
  }, [formData.project_id]);

  /* ------------------------------------------------------------------------ */
  /*                                Loading UI                                */
  /* ------------------------------------------------------------------------ */

  if (loading) {
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
          "
        >
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />

            <p className="text-xs text-muted-foreground">
              Loading training data...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

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
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* ------------------------------------------------------------------ */}
        {/* Scrollable Body                                                    */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {/* ---------------------------------------------------------------- */}
          {/* Program Information                                              */}
          {/* ---------------------------------------------------------------- */}

          <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Program Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Select Project
                </Label>

                <SingleSelect
                  disabled={isReadOnly}
                  options={projects.map((project) => ({
                    value: project.id,
                    label: project.projectCode.toUpperCase(),
                  }))}
                  value={formData.project_id}
                  onValueChange={(value: string) =>
                    handleChange({
                      target: {
                        name: "project_id",
                        value,
                      },
                    })
                  }
                  error={formErrors.project_id}
                />

                <FieldError message={formErrors.project_id} />
              </div>

              {/* Indicator */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Select Indicator
                </Label>

                <SingleSelect
                  disabled={isReadOnly || !formData.project_id}
                  options={indicators.map((indicator) => ({
                    value: indicator.id,
                    label: indicator.indicatorRef.toUpperCase(),
                  }))}
                  value={formData.indicator_id}
                  onValueChange={(value: string) =>
                    handleChange({
                      target: {
                        name: "indicator_id",
                        value,
                      },
                    })
                  }
                  error={formErrors.indicator_id}
                />

                <FieldError message={formErrors.indicator_id} />
              </div>

              {/* Province */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Select Province
                </Label>

                <SingleSelect
                  disabled={isReadOnly || !formData.project_id}
                  options={provinces.map((province) => ({
                    value: province.id,
                    label: province.name.toUpperCase(),
                  }))}
                  value={formData.province_id}
                  onValueChange={(value: string) =>
                    handleChange({
                      target: {
                        name: "province_id",
                        value,
                      },
                    })
                  }
                  error={formErrors.province_id}
                />

                <FieldError message={formErrors.province_id} />
              </div>

              {/* District */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Select District
                </Label>

                <SingleSelect
                  disabled={isReadOnly}
                  options={districts.map((district) => ({
                    value: district.id,
                    label: district.name.toUpperCase(),
                  }))}
                  value={formData.district_id}
                  onValueChange={(value: string) =>
                    handleChange({
                      target: {
                        name: "district_id",
                        value,
                      },
                    })
                  }
                  error={formErrors.district_id}
                />

                <FieldError message={formErrors.district_id} />
              </div>

              {/* Training Location */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Training Location
                </Label>

                <Input
                  name="trainingLocation"
                  placeholder="Enter training location"
                  disabled={isReadOnly}
                  value={formData.trainingLocation}
                  onChange={handleChange}
                  className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                    formErrors.trainingLocation
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />

                <FieldError message={formErrors.trainingLocation} />
              </div>

              {/* Training Name */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Training Name
                </Label>

                <Input
                  name="name"
                  placeholder="Enter training name"
                  disabled={isReadOnly}
                  value={formData.name}
                  onChange={handleChange}
                  className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                    formErrors.name
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />

                <FieldError message={formErrors.name} />
              </div>

              {/* Participant Category */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Participant Category
                </Label>

                <div
                  className={`
                    flex
                    flex-row
                    items-center
                    gap-6
                    rounded-md
                    border
                    p-3
                    bg-background
                    ${
                      formErrors.participantCatagory
                        ? "border-destructive"
                        : "border-input"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      checked={formData.participantCatagory === "acf-staff"}
                      onCheckedChange={(value) => {
                        if (value) {
                          handleCheckboxChange(
                            "participantCatagory",
                            "acf-staff"
                          );
                        }
                      }}
                    />

                    <Label className="text-xs cursor-pointer">ACF Staff</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      checked={formData.participantCatagory === "stakeholder"}
                      onCheckedChange={(value) => {
                        if (value) {
                          handleCheckboxChange(
                            "participantCatagory",
                            "stakeholder"
                          );
                        }
                      }}
                    />

                    <Label className="text-xs cursor-pointer">
                      Stakeholder
                    </Label>
                  </div>
                </div>

                <FieldError message={formErrors.participantCatagory} />
              </div>

              {/* APR Included */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  APR Included
                </Label>

                <div
                  className={`
                    flex
                    flex-row
                    items-center
                    gap-6
                    rounded-md
                    border
                    p-3
                    bg-background
                    ${
                      formErrors.aprIncluded
                        ? "border-destructive"
                        : "border-input"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      checked={formData.aprIncluded === true}
                      onCheckedChange={(value) => {
                        if (value) {
                          handleCheckboxChange("aprIncluded", true);
                        }
                      }}
                    />

                    <Label className="text-xs cursor-pointer">Yes</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      checked={formData.aprIncluded === false}
                      onCheckedChange={(value) => {
                        if (value) {
                          handleCheckboxChange("aprIncluded", false);
                        }
                      }}
                    />

                    <Label className="text-xs cursor-pointer">No</Label>
                  </div>
                </div>

                <FieldError message={formErrors.aprIncluded} />
              </div>

              {/* Training Modality */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Training Modality
                </Label>

                <div
                  className={`
                    flex
                    flex-row
                    items-center
                    gap-6
                    rounded-md
                    border
                    p-3
                    bg-background
                    ${
                      formErrors.trainingModality
                        ? "border-destructive"
                        : "border-input"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      checked={formData.trainingModality === "face-to-face"}
                      onCheckedChange={(value) => {
                        if (value) {
                          handleCheckboxChange(
                            "trainingModality",
                            "face-to-face"
                          );
                        }
                      }}
                    />

                    <Label className="text-xs cursor-pointer">
                      Face-to-Face
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      checked={formData.trainingModality === "online"}
                      onCheckedChange={(value) => {
                        if (value) {
                          handleCheckboxChange("trainingModality", "online");
                        }
                      }}
                    />

                    <Label className="text-xs cursor-pointer">Online</Label>
                  </div>
                </div>

                <FieldError message={formErrors.trainingModality} />
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Start Date
                </Label>

                <Input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  disabled={isReadOnly || !formData.project_id}
                  onChange={handleChange}
                  min={registrationDateValidRange.start}
                  max={registrationDateValidRange.end}
                  className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                    formErrors.startDate
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />

                <FieldError message={formErrors.startDate} />
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  End Date
                </Label>

                <Input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  disabled={isReadOnly || !formData.project_id}
                  onChange={handleChange}
                  min={formData.startDate || registrationDateValidRange.start}
                  max={registrationDateValidRange.end}
                  className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                    formErrors.endDate
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />

                <FieldError message={formErrors.endDate} />
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Chapter Information                                              */}
          {/* ---------------------------------------------------------------- */}

          <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            {/* Chapter Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Chapter Information
                </h3>

                <p className="text-[10px] text-muted-foreground mt-1">
                  Add chapters and provide complete information for each
                  chapter.
                </p>
              </div>

              <span className="text-[10px] font-medium text-muted-foreground">
                {chapters.length}{" "}
                {chapters.length === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Add Chapter                                                      */}
            {/* ---------------------------------------------------------------- */}

            {!isReadOnly && (
              <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground">
                    New Chapter
                  </h4>

                  <span className="text-[10px] text-muted-foreground">
                    All fields are required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Topic */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Topic
                    </Label>

                    <Input
                      name="topic"
                      placeholder="Enter chapter topic"
                      value={chapter.topic}
                      onChange={handleChapterChange}
                      className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                        chapterErrors.topic
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />

                    <FieldError message={chapterErrors.topic} />
                  </div>

                  {/* Facilitator Name */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Facilitator Name
                    </Label>

                    <Input
                      name="facilitatorName"
                      placeholder="Enter facilitator name"
                      value={chapter.facilitatorName}
                      onChange={handleChapterChange}
                      className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                        chapterErrors.facilitatorName
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />

                    <FieldError message={chapterErrors.facilitatorName} />
                  </div>

                  {/* Facilitator Job Title */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Facilitator Job Title
                    </Label>

                    <Input
                      name="facilitatorJobTitle"
                      placeholder="Enter facilitator job title"
                      value={chapter.facilitatorJobTitle}
                      onChange={handleChapterChange}
                      className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                        chapterErrors.facilitatorJobTitle
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />

                    <FieldError message={chapterErrors.facilitatorJobTitle} />
                  </div>

                  {/* Start Date */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Start Date
                    </Label>

                    <Input
                      type="date"
                      name="startDate"
                      disabled={!formData.startDate || !formData.endDate}
                      value={chapter.startDate}
                      onChange={handleChapterChange}
                      min={formData.startDate}
                      max={formData.endDate}
                      className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                        chapterErrors.startDate
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />

                    <FieldError message={chapterErrors.startDate} />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      End Date
                    </Label>

                    <Input
                      type="date"
                      name="endDate"
                      disabled={!formData.startDate || !formData.endDate}
                      value={chapter.endDate}
                      onChange={handleChapterChange}
                      min={chapter.startDate || formData.startDate}
                      max={formData.endDate}
                      className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                        chapterErrors.endDate
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />

                    <FieldError message={chapterErrors.endDate} />
                  </div>
                </div>

                {/* Add Chapter Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={handleAddChapter}
                    className="h-10 px-4 text-xs"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Added Chapters                                                   */}
            {/* ---------------------------------------------------------------- */}

            {chapters.length > 0 && (
              <div className="space-y-3">
                {chapters.map((chapterItem, index) => (
                  <div
                    key={chapterItem.id ?? `new-chapter-${index}`}
                    className="rounded-lg border border-border bg-background overflow-hidden"
                  >
                    {/* Chapter Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">
                          Chapter {index + 1}
                        </p>

                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {chapterItem.topic}
                        </p>
                      </div>

                      <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        Chapter
                      </span>
                    </div>

                    {/* Chapter Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Facilitator
                        </p>

                        <p className="text-xs text-foreground mt-1">
                          {chapterItem.facilitatorName}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Job Title
                        </p>

                        <p className="text-xs text-foreground mt-1">
                          {chapterItem.facilitatorJobTitle}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Start Date
                        </p>

                        <p className="text-xs text-foreground mt-1">
                          {chapterItem.startDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          End Date
                        </p>

                        <p className="text-xs text-foreground mt-1">
                          {chapterItem.endDate}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isReadOnly && (
                      <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/60 bg-muted/10">
                        {/* Edit */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!chapterItem.id}
                          onClick={() => {
                            if (!chapterItem.id) return;

                            setReqForChapterEditForm(true);

                            setChapterId(String(chapterItem.id));
                          }}
                          className="h-8 text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>

                        {/* Delete */}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteChapter(
                              chapterItem.id ? String(chapterItem.id) : null,
                              index
                            )
                          }
                          className="h-8 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isReadOnly && chapters.length === 0 && (
              <div className="text-center py-8 rounded-lg border border-dashed border-border">
                <p className="text-xs font-medium text-muted-foreground">
                  No chapters added yet.
                </p>

                <p className="text-[10px] text-muted-foreground mt-1">
                  Fill in the chapter information above and click Add Chapter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Footer                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
          {IsNotShowMode(mode) ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 text-xs"
              >
                Cancel
              </Button>

              <Button
                id={SUBMIT_BUTTON_PROVIDER_ID}
                disabled={isLoading}
                type="button"
                className="h-10 px-5 text-xs"
                onClick={() =>
                  reqForConfirmationModelFunc(
                    IsCreateMode(mode)
                      ? TrainingCreationMessage
                      : TrainingEditionMessage,
                    () => handleSubmit()
                  )
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />

                    {IsEditMode(mode) ? "Updating..." : "Saving..."}
                  </>
                ) : IsEditMode(mode) ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>

      {/* -------------------------------------------------------------------- */}
      {/* Edit Chapter Dialog                                                  */}
      {/* -------------------------------------------------------------------- */}

      {reqForChpaterEditForm && chapterId && (
        <CreateNewChapterForm
          open={reqForChpaterEditForm}
          onOpenChange={(value) => {
            setReqForChapterEditForm(value);

            if (!value) {
              setChapterId(null);
            }
          }}
          mode="edit"
          title="Edit Chapter"
          chaptersDataStateSetter={setChapters}
          chapterId={chapterId}
        />
      )}
    </Dialog>
  );
};

export default TrainingFormDialog;
