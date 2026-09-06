"use client";

import * as React from "react";
import { useState, useEffect } from "react";

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
import { Textarea } from "../textarea";

import { useParentContext } from "@/contexts/ParentContext";
import { CdFormSchema } from "@/schemas/FormsSchema";
import { CommunityDialogueFormType } from "@/types/Types";
import { CommunityDialogueFormDefault } from "@/constants/FormsDefaultValues";

import {
  CommunityDialogueCreationMessage,
  CommunityDialogueEditionMessage,
} from "@/constants/ConfirmationModelsTexts";

import { CommunityDialogueFormInterface } from "@/interfaces/Interfaces";

import {
  IsCreateMode,
  IsEditMode,
  IsEditOrShowMode,
  IsNotShowMode,
  IsShowMode,
} from "@/constants/Constants";

import { AxiosError, AxiosResponse } from "axios";

import { toDateOnly } from "@/components/global/MainDatabaseBeneficiaryCreationForm";

import {
  Loader2,
  Info,
  Landmark,
  Users,
  CalendarDays,
  MessageSquareText,
  ClipboardList,
  Plus,
  MapPin,
} from "lucide-react";

const CommunityDialogueFormComponent: React.FC<
  CommunityDialogueFormInterface
> = ({ open, onOpenChange, mode, dialogueId }) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<CommunityDialogueFormType>(
    CommunityDialogueFormDefault(),
  );

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const [groups, setGroups] = useState<
    { id: number | null; name: string }[]
  >([]);

  const [sessions, setSessions] = useState<
    {
      id: number | null;
      type: "initial" | "followUp";
      topic: string;
      date: string;
    }[]
  >([
    {
      id: null,
      type: "initial",
      topic: "",
      date: "",
    },
  ]);

  const [remark, setRemark] = useState<string>("");

  const [projects, setProjects] = useState<
    { id: string; projectCode: string }[]
  >([]);

  const [provinces, setProvinces] = useState<
    { id: string; name: string }[]
  >([]);

  const [districts, setDistricts] = useState<
    { id: string; name: string }[]
  >([]);

  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [registrationDateValidRange, setRegistrationDateValidRange] =
    useState<{
      start: string;
      end: string;
    }>({
      start: "",
      end: "",
    });

  const isReadOnly = IsShowMode(mode);

  // ============================================================
  // HELPERS
  // ============================================================

  const clearFieldError = (field: string) => {
    if (!formErrors[field]) return;

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearFieldError(name);
  };

  const handleSessionChange = (
    index: number,
    field: "topic" | "date",
    value: string,
  ) => {
    setSessions((prev) =>
      prev.map((session, sessionIndex) =>
        sessionIndex === index
          ? {
              ...session,
              [field]: value,
            }
          : session,
      ),
    );

    clearFieldError(`sessions.${index}.${field}`);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = () => {
    /*
     * Sessions are included here because they are part of
     * validation, while they are stored separately from formData.
     */
    const validationData = {
      ...formData,
      sessions,
    };

    const result = CdFormSchema.safeParse(validationData);

    if (!result.success) {
      const errors: { [key: string]: string } = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path;

        if (path.length === 0) return;

        /*
         * Normal form fields
         *
         * project_id
         * name
         * province_id
         * ...
         */
        if (path.length === 1) {
          errors[String(path[0])] = issue.message;
          return;
        }

        /*
         * Session fields
         *
         * sessions.0.topic
         * sessions.0.date
         */
        if (
          path[0] === "sessions" &&
          typeof path[1] === "number" &&
          path.length >= 3
        ) {
          const sessionIndex = path[1];
          const field = path[2];

          errors[`sessions.${sessionIndex}.${String(field)}`] =
            issue.message;
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

    const payload = {
      programInformation: formData,
      sessions,
      groups,
      remark,
    };

    if (IsCreateMode(mode)) {
      requestHandler()
        .post(
          "/community_dialogue_db/community_dialogue",
          payload,
        )
        .then((response: any) => {
          reqForToastAndSetMessage(
            response.data.message,
            "success",
          );

          onOpenChange(false);
          handleReload();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message ||
              "An error occurred.",
            "error",
          ),
        )
        .finally(() => {
          setIsLoading(false);
        });
    } else if (IsEditMode(mode) && dialogueId) {
      requestHandler()
        .put(
          `/community_dialogue_db/community_dialogue/${dialogueId}`,
          payload,
        )
        .then((response: any) => {
          reqForToastAndSetMessage(
            response.data.message,
            "success",
          );

          handleReload();
          onOpenChange(false);
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message ||
              "An error occurred.",
            "error",
          ),
        )
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // ============================================================
  // GROUPS
  // ============================================================

  const addGroup = () => {
    setGroups((prev) => [
      ...prev,
      {
        id: null,
        name: "",
      },
    ]);
  };

  // ============================================================
  // SESSIONS
  // ============================================================

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        id: null,
        type: "followUp",
        topic: "",
        date: "",
      },
    ]);
  };

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  useEffect(() => {
    requestHandler()
      .get("/projects/p/cd_database")
      .then((res: any) => {
        setProjects(Object.values(res.data.data));
      })
      .catch((err: any) =>
        reqForToastAndSetMessage(
          err.response?.data?.message,
          "error",
        ),
      );
  }, []);

  // ============================================================
  // LOAD EDIT / SHOW DATA
  // ============================================================

  useEffect(() => {
    if (IsEditOrShowMode(mode) && dialogueId) {
      requestHandler()
        .get(
          `/community_dialogue_db/community_dialogue_for_edit/${dialogueId}`,
        )
        .then((res: any) => {
          const data = res.data.data;

          setFormData(data.programInformation);

          setGroups(
            data.groups?.map((group: any) => ({
              ...group,
            })) ?? [],
          );

          setSessions(
            data.sessions?.length
              ? data.sessions
              : [
                  {
                    id: null,
                    type: "initial",
                    topic: "",
                    date: "",
                  },
                ],
          );

          setRemark(data.remark ?? "");
          setFormErrors({});
        })
        .catch((err: any) =>
          reqForToastAndSetMessage(
            err.response?.data?.message ||
              "Failed to load data",
            "error",
          ),
        );
    }
  }, [mode, dialogueId]);

  // ============================================================
  // LOAD PROJECT DEPENDENT DATA
  // ============================================================

  useEffect(() => {
    if (!formData.project_id) return;

    const projectId = formData.project_id;

    requestHandler()
      .get(
        `projects/indicators/cd_database/${projectId}`,
      )
      .then((res: any) => {
        setIndicators(res.data.data);
      })
      .catch((err: any) =>
        reqForToastAndSetMessage(
          err.response?.data?.message,
          "error",
        ),
      );

    requestHandler()
      .get(`projects/provinces/${projectId}`)
      .then((res: any) => {
        setProvinces(Object.values(res.data.data));
      })
      .catch((err: any) =>
        reqForToastAndSetMessage(
          err.response?.data?.message,
          "error",
        ),
      );

    requestHandler()
      .get("/global/districts")
      .then((res: any) => {
        setDistricts(Object.values(res.data.data));
      })
      .catch((err: any) =>
        reqForToastAndSetMessage(
          err.response?.data?.message,
          "error",
        ),
      );

    requestHandler()
      .get(`/date/project_date_range/${projectId}`)
      .then((response: AxiosResponse<any, any>) => {
        setRegistrationDateValidRange({
          start: toDateOnly(response.data.data.start),
          end: toDateOnly(response.data.data.end),
        });
      })
      .catch((error: AxiosError<any, any>) =>
        reqForToastAndSetMessage(
          error.response?.data?.message,
          "error",
        ),
      );
  }, [formData.project_id]);

  // ============================================================
  // STYLES
  // ============================================================

  const inputClass =
    "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors";

  const errorInputClass =
    "border-destructive focus-visible:ring-destructive";

  const labelClass =
    "text-xs font-semibold text-muted-foreground";

  const fieldContainerClass =
    "flex flex-col gap-1.5";

  const errorClass =
    "text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5";

  // ============================================================
  // RENDER
  // ============================================================

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
        {/* ======================================================
            HEADER
        ====================================================== */}

        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />

            {IsCreateMode(mode)
              ? "Create Community Dialogue"
              : IsEditMode(mode)
                ? "Update Community Dialogue"
                : "View Community Dialogue"}
          </DialogTitle>
        </DialogHeader>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">

          {/* ====================================================
              PROGRAM INFORMATION
          ==================================================== */}

          <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">

            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Program Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Project */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Project Code
                </Label>

                <SingleSelect
                  options={projects.map((project) => ({
                    value: project.id,
                    label: project.projectCode
                      .toUpperCase(),
                  }))}
                  value={formData.project_id}
                  onValueChange={(value) =>
                    handleFormChange({
                      target: {
                        name: "project_id",
                        value,
                      },
                    })
                  }
                  disabled={isReadOnly}
                  error={formErrors.project_id}
                />

                {formErrors.project_id && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.project_id}
                  </span>
                )}
              </div>

              {/* Program Name */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Program Name
                </Label>

                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Program Name"
                  disabled={isReadOnly}
                  className={`${inputClass} ${
                    formErrors.name
                      ? errorInputClass
                      : ""
                  }`}
                />

                {formErrors.name && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Focal Point */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Focal Point
                </Label>

                <Input
                  name="focalPoint"
                  value={formData.focalPoint}
                  onChange={handleFormChange}
                  placeholder="Focal Point"
                  disabled={isReadOnly}
                  className={`${inputClass} ${
                    formErrors.focalPoint
                      ? errorInputClass
                      : ""
                  }`}
                />

                {formErrors.focalPoint && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.focalPoint}
                  </span>
                )}
              </div>

              {/* Province */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Province
                </Label>

                <SingleSelect
                  options={provinces.map((province) => ({
                    value: province.id,
                    label: province.name.toUpperCase(),
                  }))}
                  value={formData.province_id}
                  onValueChange={(value) =>
                    handleFormChange({
                      target: {
                        name: "province_id",
                        value,
                      },
                    })
                  }
                  disabled={isReadOnly}
                  error={formErrors.province_id}
                />

                {formErrors.province_id && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.province_id}
                  </span>
                )}
              </div>

              {/* District */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  District
                </Label>

                <SingleSelect
                  options={districts.map((district) => ({
                    value: district.id,
                    label: district.name.toUpperCase(),
                  }))}
                  value={formData.district_id}
                  onValueChange={(value) =>
                    handleFormChange({
                      target: {
                        name: "district_id",
                        value,
                      },
                    })
                  }
                  disabled={isReadOnly}
                  error={formErrors.district_id}
                />

                {formErrors.district_id && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.district_id}
                  </span>
                )}
              </div>

              {/* Village */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Village
                </Label>

                <Input
                  name="village"
                  value={formData.village}
                  onChange={handleFormChange}
                  placeholder="Village"
                  disabled={isReadOnly}
                  className={`${inputClass} ${
                    formErrors.village
                      ? errorInputClass
                      : ""
                  }`}
                />

                {formErrors.village && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.village}
                  </span>
                )}
              </div>

              {/* Indicator */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Select Indicator
                </Label>

                <SingleSelect
                  options={indicators.map((indicator) => ({
                    value: indicator.id,
                    label: indicator.indicatorRef
                      .toUpperCase(),
                  }))}
                  value={formData.indicator_id}
                  onValueChange={(value) =>
                    handleFormChange({
                      target: {
                        name: "indicator_id",
                        value,
                      },
                    })
                  }
                  disabled={isReadOnly}
                  error={formErrors.indicator_id}
                />

                {formErrors.indicator_id && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.indicator_id}
                  </span>
                )}
              </div>

              {/* CD Name */}

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Community Dialogue Name
                </Label>

                <Input
                  name="cdName"
                  value={formData.cdName}
                  onChange={handleFormChange}
                  placeholder="Community Dialogue Name"
                  disabled={isReadOnly}
                  className={`${inputClass} ${
                    formErrors.cdName
                      ? errorInputClass
                      : ""
                  }`}
                />

                {formErrors.cdName && (
                  <span className={errorClass}>
                    <Info className="h-3 w-3" />
                    {formErrors.cdName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================
              COMMUNITY GROUPS
          ==================================================== */}

          <div className="space-y-4">

            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <Users className="h-4 w-4" />
              Community Groups
            </div>

            <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Community Groups
                  </p>

                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Add and manage community groups.
                  </p>
                </div>

                {IsNotShowMode(mode) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGroup}
                    className="
                      h-9
                      rounded-md
                      text-xs
                      bg-background
                      border-input
                      text-foreground
                      hover:bg-muted
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Group
                  </Button>
                )}
              </div>

              {groups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groups.map((group, index) => (
                    <div
                      key={index}
                      className={fieldContainerClass}
                    >
                      <Label className={labelClass}>
                        Group Name {index + 1}
                      </Label>

                      <Input
                        placeholder={`Group Name ${index + 1}`}
                        value={group.name}
                        disabled={isReadOnly}
                        className={inputClass}
                        onChange={(e) => {
                          const newGroups = [...groups];

                          newGroups[index] = {
                            ...newGroups[index],
                            name: e.target.value,
                          };

                          setGroups(newGroups);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ====================================================
              COMMUNITY DIALOGUE SESSIONS
          ==================================================== */}

          <div className="space-y-4">

            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <CalendarDays className="h-4 w-4" />
              Community Dialogue Sessions
            </div>

            <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">

              {sessions.map((session, index) => {
                const topicError =
                  formErrors[
                    `sessions.${index}.topic`
                  ];

                const dateError =
                  formErrors[
                    `sessions.${index}.date`
                  ];

                const isInitial = index === 0;

                return (
                  <div
                    key={index}
                    className="
                      rounded-lg
                      border
                      border-border
                      bg-background
                      p-4
                      space-y-4
                    "
                  >
                    {/* Session Header */}

                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-foreground">
                            {isInitial
                              ? "Initial Session"
                              : `Follow Up Session ${index}`}
                          </h3>

                          {isInitial && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Required session
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Session Fields */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Topic */}

                      <div className={fieldContainerClass}>
                        <Label className={labelClass}>
                          CD Topic
                          {isInitial && (
                            <span className="text-destructive ml-1">
                              *
                            </span>
                          )}
                        </Label>

                        <Input
                          value={session.topic}
                          placeholder="Enter session topic"
                          disabled={isReadOnly}
                          className={`${inputClass} ${
                            topicError
                              ? errorInputClass
                              : ""
                          }`}
                          onChange={(e) =>
                            handleSessionChange(
                              index,
                              "topic",
                              e.target.value,
                            )
                          }
                        />

                        {topicError && (
                          <span className={errorClass}>
                            <Info className="h-3 w-3" />
                            {topicError}
                          </span>
                        )}
                      </div>

                      {/* Date */}

                      <div className={fieldContainerClass}>
                        <Label className={labelClass}>
                          CD Date
                          {isInitial && (
                            <span className="text-destructive ml-1">
                              *
                            </span>
                          )}
                        </Label>

                        <Input
                          type="date"
                          value={session.date}
                          disabled={
                            isReadOnly ||
                            !formData.project_id
                          }
                          min={
                            registrationDateValidRange.start
                          }
                          max={
                            registrationDateValidRange.end
                          }
                          className={`${inputClass} ${
                            dateError
                              ? errorInputClass
                              : ""
                          }`}
                          onChange={(e) =>
                            handleSessionChange(
                              index,
                              "date",
                              e.target.value,
                            )
                          }
                        />

                        {dateError && (
                          <span className={errorClass}>
                            <Info className="h-3 w-3" />
                            {dateError}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Follow Up */}

              {IsNotShowMode(mode) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSession}
                  className="
                    w-full
                    h-10
                    rounded-md
                    border-dashed
                    border-border
                    bg-background
                    text-foreground
                    hover:bg-muted
                    text-xs
                    font-medium
                    flex
                    items-center
                    justify-center
                    gap-1.5
                  "
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Follow Up Session
                </Button>
              )}
            </div>
          </div>

          {/* ====================================================
              ADDITIONAL INFORMATION
          ==================================================== */}

          <div className="space-y-4">

            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <MessageSquareText className="h-4 w-4" />
              Additional Information
            </div>

            <div className="rounded-lg border border-border/80 p-4 bg-muted/20">

              <div className={fieldContainerClass}>
                <Label className={labelClass}>
                  Remark
                </Label>

                <Textarea
                  value={remark}
                  onChange={(e) =>
                    setRemark(e.target.value)
                  }
                  placeholder="Enter remark or additional information..."
                  disabled={isReadOnly}
                  className="
                    min-h-[120px]
                    bg-background
                    border-input
                    text-foreground
                    focus-visible:ring-ring
                    rounded-md
                    text-xs
                    resize-none
                  "
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">

          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
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
            {IsShowMode(mode) ? "Close" : "Cancel"}
          </Button>

          {IsNotShowMode(mode) && (
            <Button
              id="community-dialogue-submit"
              disabled={isLoading}
              type="button"
              onClick={() =>
                reqForConfirmationModelFunc(
                  IsCreateMode(mode)
                    ? CommunityDialogueCreationMessage
                    : CommunityDialogueEditionMessage,
                  () => handleSubmit(),
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
                min-w-[150px]
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />

                  <span>
                    {IsCreateMode(mode)
                      ? "Saving..."
                      : "Updating..."}
                  </span>
                </>
              ) : (
                <>
                  <ClipboardList className="h-3.5 w-3.5" />

                  <span>
                    {IsCreateMode(mode)
                      ? "Save Community Dialogue"
                      : "Update Community Dialogue"}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityDialogueFormComponent;
