"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DataTableDemo from "@/components/global/MulitSelectTable";

import {
  mainDatabaseAndKitDatabaseBeneficiaryColumns,
} from "@/definitions/DataTableColumnsDefinitions";

import { useParentContext } from "@/contexts/ParentContext";
import { SubmitSummaryInterface } from "@/interfaces/Interfaces";
import StringHelper from "@/helpers/StringHelpers/StringHelper";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  History,
  MapPin,
  User,
} from "lucide-react";

const SubmitSummary: React.FC<SubmitSummaryInterface> = ({
  open,
  onOpenChange,
  databaseId,
}) => {
  const router = useRouter();

  const {
    reqForToastAndSetMessage,
    requestHandler,
  } = useParentContext();

  /* ---------------------------------------------------------------------- */
  /*                              States                                    */
  /* ---------------------------------------------------------------------- */

  const [
    reqForPermissionUpdateForm,
    setReqForPermissionUpdateForm,
  ] = useState<boolean>(false);

  const [
    idFeildForEditStateSetter,
    setIdFeildForEditStateSetter,
  ] = useState<number | null>(null);

  const [databaseDetails, setDatabaseDetails] = useState<
    {
      label: string;
      value: string | { id: string; name: string };
    }[]
  >([]);

  const [projectDetails, setProjectDetails] = useState<
    {
      label: string;
      value:
        | string
        | { id: string; projectCode: string };
    }[]
  >([]);

  const [aprLogs, setAprLogs] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*                         Load Database Details                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open || !databaseId) return;

    setIsLoading(true);

    const fetchDatabaseDetails = async () => {
      try {
        const response = await requestHandler().get(
          `/db_management/show_database/${databaseId}`
        );

        const data = response.data.data;

        setAprLogs(data.logs ?? []);

        /* -------------------------------------------------------------- */
        /* Database Details                                               */
        /* -------------------------------------------------------------- */

        setDatabaseDetails([
          {
            label: "Database",
            value: data.database,
          },
          {
            label: "Province",
            value: data.province,
          },
          {
            label: "Date",
            value: `${data.fromDate} → ${data.toDate}`,
          },
          {
            label: "Submitted by",
            value: data.submittedBy,
          },

          ...(data.database === "psychoeducation_database"
            ? [
                {
                  label: "# Of men host community",
                  value: String(data.ofMenHostCommunity ?? 0),
                },
                {
                  label: "# Of men idp",
                  value: String(data.ofMenIdp ?? 0),
                },
                {
                  label: "# Of men refugee",
                  value: String(data.ofMenRefugee ?? 0),
                },
                {
                  label: "# Of men returnee",
                  value: String(data.ofMenReturnee ?? 0),
                },

                {
                  label: "# Of women host community",
                  value: String(data.ofWomenHostCommunity ?? 0),
                },
                {
                  label: "# Of women idp",
                  value: String(data.ofWomenIdp ?? 0),
                },
                {
                  label: "# Of women refugee",
                  value: String(data.ofWomenRefugee ?? 0),
                },
                {
                  label: "# Of women returnee",
                  value: String(data.ofWomenReturnee ?? 0),
                },

                {
                  label: "# Of boy host community",
                  value: String(data.ofBoyHostCommunity ?? 0),
                },
                {
                  label: "# Of boy idp",
                  value: String(data.ofBoyIdp ?? 0),
                },
                {
                  label: "# Of boy refugee",
                  value: String(data.ofBoyRefugee ?? 0),
                },
                {
                  label: "# Of boy returnee",
                  value: String(data.ofBoyReturnee ?? 0),
                },

                {
                  label: "# Of girl host community",
                  value: String(data.ofGirlHostCommunity ?? 0),
                },
                {
                  label: "# Of girl idp",
                  value: String(data.ofGirlIdp ?? 0),
                },
                {
                  label: "# Of girl refugee",
                  value: String(data.ofGirlRefugee ?? 0),
                },
                {
                  label: "# Of girl returnee",
                  value: String(data.ofGirlReturnee ?? 0),
                },
              ]
            : []),
        ]);

        /* -------------------------------------------------------------- */
        /* Project Details                                                */
        /* -------------------------------------------------------------- */

        setProjectDetails([
          {
            label: "Project",
            value: data.project?.projectCode ?? "—",
          },
          {
            label: "Program",
            value:
              data.program?.name ??
              data.programName ??
              data.database ??
              "—",
          },
          {
            label: "Status",
            value:
              data.status ??
              data.aprStatus ??
              "Submitted",
          },
        ]);
      } catch (error: any) {
        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "Unable to load database summary !",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatabaseDetails();
  }, [open, databaseId]);

  /* ---------------------------------------------------------------------- */
  /*                              Helpers                                   */
  /* ---------------------------------------------------------------------- */

  const databaseValue = databaseDetails.find(
    (item) => item.label === "Database"
  )?.value;

  const isPsychoeducationDatabase =
    databaseValue === "psychoeducation_database";

  const getDisplayValue = (
    value: string | { id: string; name: string }
  ) => {
    if (typeof value === "object") {
      return StringHelper.normalize(value.name);
    }

    return StringHelper.normalize(String(value));
  };

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (
      normalized.includes("approved") ||
      normalized.includes("completed") ||
      normalized.includes("accepted")
    ) {
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    }

    if (
      normalized.includes("reject") ||
      normalized.includes("decline")
    ) {
      return "bg-destructive/10 text-destructive";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("review")
    ) {
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    }

    return "bg-primary/10 text-primary";
  };

  /* ---------------------------------------------------------------------- */
  /*                                Render                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
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
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Database Summary
          </DialogTitle>
        </DialogHeader>

        {/* ---------------------------------------------------------------- */}
        {/* Body                                                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {/* ---------------------------------------------------------------- */}
          {/* Subtitle                                                        */}
          {/* ---------------------------------------------------------------- */}

          <div>
            <p className="text-xs text-muted-foreground">
              Summary and submission information for the selected
              database.
            </p>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Database Information                                             */}
          {/* ---------------------------------------------------------------- */}

          <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Database className="h-3.5 w-3.5" />
              Database Information
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[72px] rounded-md bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {databaseDetails.map((item) => {
                  let icon = <Database className="h-3.5 w-3.5" />;

                  if (item.label === "Province") {
                    icon = <MapPin className="h-3.5 w-3.5" />;
                  }

                  if (item.label === "Date") {
                    icon = <CalendarDays className="h-3.5 w-3.5" />;
                  }

                  if (item.label === "Submitted by") {
                    icon = <User className="h-3.5 w-3.5" />;
                  }

                  return (
                    <div
                      key={item.label}
                      className="
                        rounded-md
                        border
                        border-border/70
                        bg-background
                        px-3
                        py-3
                        min-h-[72px]
                        flex
                        flex-col
                        justify-center
                        gap-1
                        transition-colors
                        hover:bg-muted/40
                      "
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {icon}
                        {item.label}
                      </div>

                      <div
                        className="
                          text-xs
                          font-medium
                          text-foreground
                          break-words
                          leading-relaxed
                        "
                      >
                        {getDisplayValue(item.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Project Information                                              */}
          {/* ---------------------------------------------------------------- */}

          <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Project Information
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[72px] rounded-md bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {projectDetails.map((item) => {
                  const isProject =
                    item.label === "Project";

                  const isStatus =
                    item.label === "Status";

                  const statusValue =
                    typeof item.value === "string"
                      ? item.value
                      : "";

                  return (
                    <button
                      key={item.label}
                      type="button"
                      disabled={!isProject}
                      onClick={() => {
                        if (!isProject) return;

                        if (
                          typeof item.value === "object"
                        ) {
                          router.push(
                            `/projects/show_project/${item.value.id}`
                          );
                        }
                      }}
                      className={`
                        min-h-[72px]
                        rounded-md
                        border
                        border-border/70
                        bg-background
                        px-3
                        py-3
                        flex
                        flex-col
                        justify-center
                        gap-1
                        text-left
                        transition-colors
                        ${
                          isProject
                            ? "hover:bg-muted/40 cursor-pointer"
                            : "cursor-default"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {item.label}
                        </span>

                        {isProject && (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>

                      {isStatus ? (
                        <span
                          className={`
                            w-fit
                            px-2
                            py-1
                            rounded-md
                            text-[10px]
                            font-semibold
                            ${getStatusClass(statusValue)}
                          `}
                        >
                          {StringHelper.normalize(
                            statusValue
                          )}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-foreground">
                          {typeof item.value === "object"
                            ? item.value.projectCode
                            : StringHelper.normalize(
                                item.value
                              )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Beneficiaries                                                    */}
          {/* ---------------------------------------------------------------- */}

          {!isPsychoeducationDatabase && (
            <section className="rounded-lg border border-border/80 bg-muted/20 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />

                  <div>
                    <p className="text-xs font-bold text-foreground">
                      List of Beneficiaries
                    </p>

                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Beneficiaries associated with this database
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary">
                  Submitted
                </span>
              </div>

              <div className="p-4">
                <DataTableDemo
                  columns={
                    mainDatabaseAndKitDatabaseBeneficiaryColumns
                  }
                  indexUrl={`/global/databaseBeneficiaries/${databaseId}`}
                  deleteUrl="user_mng/delete_permissions"
                  searchableColumn="name"
                  idFeildForEditStateSetter={
                    setIdFeildForEditStateSetter
                  }
                  editModelOpenerStateSetter={
                    setReqForPermissionUpdateForm
                  }
                />
              </div>
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Submission History                                               */}
          {/* ---------------------------------------------------------------- */}

          {aprLogs.length > 0 && (
            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <History className="h-3.5 w-3.5" />
                Submission / Review History
              </div>

              <div className="relative space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {aprLogs.map((log, index) => (
                  <div
                    key={index}
                    className="
                      relative
                      rounded-md
                      border
                      border-border/70
                      bg-background
                      px-3
                      py-3
                      transition-colors
                      hover:bg-muted/30
                    "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          {index === 0 ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Clock3 className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground capitalize">
                            {log.action}
                            {log.user
                              ? ` — ${log.user}`
                              : ""}
                          </p>

                          {log.comment && (
                            <p className="mt-1 text-[10px] leading-relaxed text-destructive">
                              Reason: {log.comment}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
                        {log.created_at}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex justify-end pt-4 border-t border-border mt-auto">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="
              inline-flex
              items-center
              gap-1.5
              h-10
              px-5
              rounded-md
              border
              border-border
              bg-background
              text-xs
              font-medium
              text-foreground
              hover:bg-muted
              transition-colors
            "
          >
            Close
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitSummary;