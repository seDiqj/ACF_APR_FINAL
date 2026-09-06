"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AxiosError, AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Info, Loader2, Database, CalendarDays } from "lucide-react";

import { useParentContext } from "@/contexts/ParentContext";
import { SubmitNewDatabaseMessage } from "@/constants/ConfirmationModelsTexts";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import StringHelper from "@/helpers/StringHelpers/StringHelper";
import { toDateOnly } from "@/components/global/MainDatabaseBeneficiaryCreationForm";
import SubmitNewDBSkeleton from "@/components/skeleton/DatabaseSubmition.skeleton";
import { SubmitNewDBSchema } from "@/schemas/FormsSchema";

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

interface ComponentProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode: "create" | "edit";
  id?: number;
}

interface Project {
  id: string;
  projectCode: string;
}

interface DatabaseItem {
  id: string;
  name: string;
}

interface Province {
  id: string;
  name: string;
}

interface Manager {
  id: string;
  name: string;
}

type FormErrors = Partial<
  Record<keyof z.infer<typeof SubmitNewDBSchema>, string>
>;

/* -------------------------------------------------------------------------- */
/*                              Error Component                               */
/* -------------------------------------------------------------------------- */

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
      <Info className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

const SubmitNewDB: React.FC<ComponentProps> = ({
  open,
  onOpenChange,
  mode,
  id,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*                              Form Errors                               */
  /* ---------------------------------------------------------------------- */

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /* ---------------------------------------------------------------------- */
  /*                              Date Range                                */
  /* ---------------------------------------------------------------------- */

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------------------------------------------------------------- */
  /*                              Data Lists                                */
  /* ---------------------------------------------------------------------- */

  const [projects, setProjects] = useState<Project[]>([]);
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);

  /* ---------------------------------------------------------------------- */
  /*                            Selected Data                                */
  /* ---------------------------------------------------------------------- */

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseItem | null>(
    null
  );

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );

  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  /* ---------------------------------------------------------------------- */
  /*                         Project Date Range                             */
  /* ---------------------------------------------------------------------- */

  const [registrationDateValidRange, setRegistrationDateValidRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });

  /* ---------------------------------------------------------------------- */
  /*                              Error Helper                              */
  /* ---------------------------------------------------------------------- */

  const clearFieldError = (field: keyof FormErrors) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };
      delete next[field];

      return next;
    });
  };

  /* ---------------------------------------------------------------------- */
  /*                           Reset Form Errors                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      setFormErrors({});
      setLoading(false);
      setIsFieldsLoading(false);
    }
  }, [open]);

  /* ---------------------------------------------------------------------- */
  /*                         Load Initial Data                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    setInitLoading(true);

    const fetchBaseData = async () => {
      try {
        const [projectsRes, managersRes]: [AxiosResponse, AxiosResponse] =
          await Promise.all([
            requestHandler().get("/projects/projects_for_submition"),
            requestHandler().get("/global/managers"),
          ]);

        setProjects(projectsRes.data.data);
        setManagers(managersRes.data.data);

        if (mode === "create") {
          setInitLoading(false);
        }
      } catch (err) {
        const error = err as AxiosError<any>;

        reqForToastAndSetMessage(
          error.response?.data?.message || "Error loading initial data !",
          "error"
        );

        setInitLoading(false);
      }
    };

    fetchBaseData();
  }, [open, mode]);

  /* ---------------------------------------------------------------------- */
  /*                       Load Edit Form Data                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open || mode !== "edit" || !id) return;

    const fetchEditData = async () => {
      try {
        const res = await requestHandler().get(
          `/db_management/get_database_info_for_editing/${id}`
        );

        const data = res.data.data;

        setSelectedProject(data.project);
        setSelectedDatabase(data.database);
        setSelectedProvince(data.province);
        setSelectedManager(data.manager);
        setFromDate(data.fromDate);
        setToDate(data.toDate);
      } catch (err) {
        const error = err as AxiosError<any>;

        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "Error loading database information !",
          "error"
        );
      } finally {
        setInitLoading(false);
      }
    };

    fetchEditData();
  }, [open, mode, id]);

  /* ---------------------------------------------------------------------- */
  /*                    Load Project Dependent Data                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedProject) return;

    setIsFieldsLoading(true);

    const fetchProjectDetails = async () => {
      try {
        const [dbProvinceRes, dateRangeRes]: [AxiosResponse, AxiosResponse] =
          await Promise.all([
            requestHandler().get(
              `/projects/project_databases_&_provinces/${selectedProject.id}`
            ),
            requestHandler().get(
              `/date/project_date_range/${selectedProject.id}`
            ),
          ]);

        setDatabases(dbProvinceRes.data.data.databases);
        setProvinces(dbProvinceRes.data.data.provinces);

        setRegistrationDateValidRange({
          start: toDateOnly(dateRangeRes.data.data.start),
          end: toDateOnly(dateRangeRes.data.data.end),
        });
      } catch (err) {
        const error = err as AxiosError<any>;

        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "Error loading project information !",
          "error"
        );
      } finally {
        setIsFieldsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [selectedProject]);

  /* ---------------------------------------------------------------------- */
  /*                         Validate Form                                  */
  /* ---------------------------------------------------------------------- */

  const validateForm = () => {
    const formData = {
      project_id: selectedProject?.id ?? "",
      database_id: selectedDatabase?.id ?? "",
      province_id: selectedProvince?.id ?? "",
      manager_id: selectedManager?.id ?? "",
      fromDate,
      toDate,
    };

    const result = SubmitNewDBSchema.safeParse(formData);

    if (!result.success) {
      const errors: FormErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;

        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });

      setFormErrors(errors);

      reqForToastAndSetMessage(
        "Please fix the highlighted fields before submitting !",
        "warning"
      );

      return false;
    }

    /* ------------------------------------------------------------------ */
    /*                Validate Date Against Project Range                */
    /* ------------------------------------------------------------------ */

    if (
      registrationDateValidRange.start &&
      fromDate < registrationDateValidRange.start
    ) {
      setFormErrors({
        fromDate: "From date must be within the project's valid date range !",
      });

      reqForToastAndSetMessage(
        "From date is outside the project's valid date range !",
        "warning"
      );

      return false;
    }

    if (
      registrationDateValidRange.end &&
      fromDate > registrationDateValidRange.end
    ) {
      setFormErrors({
        fromDate: "From date must be within the project's valid date range !",
      });

      reqForToastAndSetMessage(
        "From date is outside the project's valid date range !",
        "warning"
      );

      return false;
    }

    if (
      registrationDateValidRange.start &&
      toDate < registrationDateValidRange.start
    ) {
      setFormErrors({
        toDate: "To date must be within the project's valid date range !",
      });

      reqForToastAndSetMessage(
        "To date is outside the project's valid date range !",
        "warning"
      );

      return false;
    }

    if (
      registrationDateValidRange.end &&
      toDate > registrationDateValidRange.end
    ) {
      setFormErrors({
        toDate: "To date must be within the project's valid date range !",
      });

      reqForToastAndSetMessage(
        "To date is outside the project's valid date range !",
        "warning"
      );

      return false;
    }

    setFormErrors({});

    return true;
  };

  /* ---------------------------------------------------------------------- */
  /*                              Submit                                    */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      project_id: selectedProject!.id,
      database_id: selectedDatabase!.id,
      province_id: selectedProvince!.id,
      manager_id: selectedManager!.id,
      fromDate,
      toDate,
    };

    try {
      const request =
        mode === "create"
          ? requestHandler().post("/db_management/submit_new_database", payload)
          : requestHandler().put(
              `/db_management/edit_submitted_database/${id}`,
              payload
            );

      const res = await request;

      reqForToastAndSetMessage(res.data.message, "success");

      onOpenChange(false);
      handleReload();
    } catch (err) {
      const error = err as AxiosError<any>;

      reqForToastAndSetMessage(
        error.response?.data?.message ||
          "Something went wrong while submitting the database !",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                                Render                                  */
  /* ---------------------------------------------------------------------- */

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
        {initLoading ? (
          <SubmitNewDBSkeleton />
        ) : (
          <>
            {/* ---------------------------------------------------------- */}
            {/* Header                                                     */}
            {/* ---------------------------------------------------------- */}

            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />

                {mode === "create"
                  ? "Submit New Database"
                  : "Edit Submitted Database"}
              </DialogTitle>
            </DialogHeader>

            {/* ---------------------------------------------------------- */}
            {/* Body                                                       */}
            {/* ---------------------------------------------------------- */}

            <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
              {/* -------------------------------------------------------- */}
              {/* Database Information                                    */}
              {/* -------------------------------------------------------- */}

              <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <Database className="h-3.5 w-3.5" />
                  Database Information
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Project */}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Project
                    </Label>

                    <Select
                      value={selectedProject?.id ?? ""}
                      onValueChange={(id) => {
                        clearFieldError("project_id");
                        clearFieldError("database_id");
                        clearFieldError("province_id");
                        clearFieldError("fromDate");
                        clearFieldError("toDate");

                        setSelectedDatabase(null);
                        setSelectedProvince(null);

                        setFromDate("");
                        setToDate("");

                        setSelectedProject(
                          projects.find((p) => p.id === id) ?? null
                        );
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                        className={`h-10 rounded-md text-xs bg-background border-input text-foreground focus:ring-ring ${
                          formErrors.project_id
                            ? "border-destructive focus:ring-destructive"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>

                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project.id}
                            className="text-xs"
                          >
                            {project.projectCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError message={formErrors.project_id} />
                  </div>

                  {/* Database */}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Database
                    </Label>

                    <Select
                      disabled={isFieldsLoading || !selectedProject || loading}
                      value={selectedDatabase?.id ?? ""}
                      onValueChange={(id) => {
                        clearFieldError("database_id");

                        setSelectedDatabase(
                          databases.find((database) => database.id === id) ??
                            null
                        );
                      }}
                    >
                      <SelectTrigger
                        className={`h-10 rounded-md text-xs bg-background border-input text-foreground focus:ring-ring ${
                          formErrors.database_id
                            ? "border-destructive focus:ring-destructive"
                            : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            isFieldsLoading
                              ? "Loading Databases..."
                              : "Select Database"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {databases.map((database) => (
                          <SelectItem
                            key={database.id}
                            value={database.id}
                            className="text-xs"
                          >
                            {StringHelper.normalize(database.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError message={formErrors.database_id} />
                  </div>

                  {/* Province */}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Province
                    </Label>

                    <Select
                      disabled={isFieldsLoading || !selectedProject || loading}
                      value={selectedProvince?.id ?? ""}
                      onValueChange={(id) => {
                        clearFieldError("province_id");

                        setSelectedProvince(
                          provinces.find((province) => province.id === id) ??
                            null
                        );
                      }}
                    >
                      <SelectTrigger
                        className={`h-10 rounded-md text-xs bg-background border-input text-foreground focus:ring-ring ${
                          formErrors.province_id
                            ? "border-destructive focus:ring-destructive"
                            : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            isFieldsLoading
                              ? "Loading Provinces..."
                              : "Select Province"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem
                            key={province.id}
                            value={province.id}
                            className="text-xs"
                          >
                            {StringHelper.normalize(province.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError message={formErrors.province_id} />
                  </div>

                  {/* Manager */}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Manager
                    </Label>

                    <Select
                      value={selectedManager?.id ?? ""}
                      onValueChange={(id) => {
                        clearFieldError("manager_id");

                        setSelectedManager(
                          managers.find((manager) => manager.id === id) ?? null
                        );
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger
                        className={`h-10 rounded-md text-xs bg-background border-input text-foreground focus:ring-ring ${
                          formErrors.manager_id
                            ? "border-destructive focus:ring-destructive"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select Manager" />
                      </SelectTrigger>

                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem
                            key={manager.id}
                            value={manager.id}
                            className="text-xs"
                          >
                            {StringHelper.normalize(manager.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldError message={formErrors.manager_id} />
                  </div>
                </div>
              </section>

              {/* -------------------------------------------------------- */}
              {/* Date Information                                        */}
              {/* -------------------------------------------------------- */}

              <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Submission Date Range
                </div>

                {/* Project Valid Range */}

                {selectedProject &&
                  registrationDateValidRange.start &&
                  registrationDateValidRange.end && (
                    <div className="rounded-md border border-border/60 bg-background px-3 py-2">
                      <p className="text-[10px] text-muted-foreground">
                        Project valid date range
                      </p>

                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {registrationDateValidRange.start}
                        <span className="mx-2 text-muted-foreground">→</span>
                        {registrationDateValidRange.end}
                      </p>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* From Date */}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      From Date
                    </Label>

                    <Input
                      type="date"
                      disabled={isFieldsLoading || !selectedProject || loading}
                      value={fromDate}
                      min={registrationDateValidRange.start}
                      max={registrationDateValidRange.end}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        clearFieldError("fromDate");

                        if (toDate && e.target.value > toDate) {
                          setFormErrors((prev) => ({
                            ...prev,
                            toDate:
                              "To date cannot be earlier than the from date !",
                          }));
                        } else if (
                          formErrors.toDate?.includes("earlier than")
                        ) {
                          clearFieldError("toDate");
                        }
                      }}
                      className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                        formErrors.fromDate
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />

                    <FieldError message={formErrors.fromDate} />
                  </div>

                  {/* To Date */}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      To Date
                    </Label>

                    <Input
                      type="date"
                      disabled={isFieldsLoading || !selectedProject || loading}
                      value={toDate}
                      min={registrationDateValidRange.start}
                      max={registrationDateValidRange.end}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        clearFieldError("toDate");

                        if (fromDate && e.target.value < fromDate) {
                          setFormErrors((prev) => ({
                            ...prev,
                            toDate:
                              "To date cannot be earlier than the from date !",
                          }));
                        }
                      }}
                      className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                        formErrors.toDate
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                    />

                    <FieldError message={formErrors.toDate} />
                  </div>
                </div>
              </section>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Footer                                                     */}
            {/* ---------------------------------------------------------- */}

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => onOpenChange(false)}
                className="h-10 px-5 text-xs border-border bg-background hover:bg-muted text-foreground"
              >
                Cancel
              </Button>

              <Button
                id={SUBMIT_BUTTON_PROVIDER_ID}
                type="button"
                disabled={loading || isFieldsLoading || !selectedProject}
                onClick={() =>
                  reqForConfirmationModelFunc(
                    SubmitNewDatabaseMessage,
                    handleSubmit
                  )
                }
                className="h-10 px-6 text-xs min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    {mode === "create" ? "Submitting..." : "Updating..."}
                  </>
                ) : mode === "create" ? (
                  "Submit"
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmitNewDB;
