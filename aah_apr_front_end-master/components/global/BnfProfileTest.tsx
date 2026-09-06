"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useParentContext } from "@/contexts/ParentContext";

import {
  BeneficiarySessionDeleteMessage,
  BeneficiarySessionSubmitButtonMessage,
} from "@/constants/ConfirmationModelsTexts";

import { IsANullOrUndefinedValue } from "@/constants/Constants";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

import StringHelper from "@/helpers/StringHelpers/StringHelper";

import { AxiosError, AxiosResponse } from "axios";

import {
  Loader2,
  Trash2,
  Plus,
  CalendarDays,
  Users,
  BookOpen,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Session = {
  id: number | null;
  group: string | null;
  session: string;
  date: string;
  topic: string;
};

type Dessaggregation = {
  id: string;
  description: string;
};

type IndicatorState = {
  id: number;
  indicatorRef: string;
  type: string;
  sessions: Session[];
  dessaggregations: Dessaggregation[];
};

interface BeneficiarySessionInterface {
  indicatorStateSetter: React.Dispatch<
    React.SetStateAction<IndicatorState[]>
  >;
  indicators: IndicatorState[];
  isLoading: boolean;
}

type SessionError = {
  session?: string;
  group?: string;
  date?: string;
  topic?: string;
};

type ValidationErrors = Record<number, Record<number, SessionError>>;

type ExpandedSession = {
  indicatorId: number;
  sessionIndex: number;
  isGroup: boolean;
};

export default function SessionsPage({
  indicatorStateSetter,
  indicators,
  isLoading,
}: BeneficiarySessionInterface) {
  const { id } = useParams<{ id: string }>();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors>({});

  /*
   * Keeps track of the session currently opened in the
   * expanded modal.
   */
  const [expandedSession, setExpandedSession] =
    useState<ExpandedSession | null>(null);

  // ---------------------------------------------------------------------------
  // State Helpers
  // ---------------------------------------------------------------------------

  const updateSession = (
    indicatorId: number,
    sessionIndex: number,
    field: keyof Session,
    value: string | number | null,
  ) => {
    indicatorStateSetter((prev) =>
      prev.map((indicator) => {
        if (indicator.id !== indicatorId) return indicator;

        return {
          ...indicator,
          sessions: indicator.sessions.map((session, index) =>
            index === sessionIndex
              ? {
                  ...session,
                  [field]: value,
                }
              : session,
          ),
        };
      }),
    );

    // Remove validation error for the edited field
    setValidationErrors((prev) => {
      const indicatorErrors = prev[indicatorId];

      if (!indicatorErrors?.[sessionIndex]) {
        return prev;
      }

      const sessionError = indicatorErrors[sessionIndex];

      if (!sessionError[field as keyof SessionError]) {
        return prev;
      }

      const next = {
        ...prev,
        [indicatorId]: {
          ...indicatorErrors,
          [sessionIndex]: {
            ...sessionError,
            [field]: undefined,
          },
        },
      };

      return next;
    });
  };

  const addSessionRow = (indicatorId: number) => {
    indicatorStateSetter((prev) =>
      prev.map((indicator) =>
        indicator.id === indicatorId
          ? {
              ...indicator,
              sessions: [
                ...indicator.sessions,
                {
                  id: null,
                  group: null,
                  session: "",
                  date: "",
                  topic: "",
                },
              ],
            }
          : indicator,
      ),
    );
  };

  const addGroupRow = (indicatorId: number) => {
    indicatorStateSetter((prev) =>
      prev.map((indicator) =>
        indicator.id === indicatorId
          ? {
              ...indicator,
              sessions: [
                ...indicator.sessions,
                {
                  id: null,
                  group: "",
                  session: "",
                  date: "",
                  topic: "",
                },
              ],
            }
          : indicator,
      ),
    );
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validateIndicators = (): boolean => {
    const errors: ValidationErrors = {};

    indicators.forEach((indicator) => {
      indicator.sessions.forEach((session, index) => {
        const sessionErrors: SessionError = {};

        if (session.group !== null && !session.group.trim()) {
          sessionErrors.group = "Group is required.";
        }

        if (!session.session.trim()) {
          sessionErrors.session = "Session is required.";
        }

        if (!session.date) {
          sessionErrors.date = "Date is required.";
        }

        if (!session.topic.trim()) {
          sessionErrors.topic = "Session topic is required.";
        }

        if (Object.keys(sessionErrors).length > 0) {
          if (!errors[indicator.id]) {
            errors[indicator.id] = {};
          }

          errors[indicator.id][index] = sessionErrors;
        }
      });
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      reqForToastAndSetMessage(
        "Please fix the validation errors before submitting.",
        "warning",
      );

      return false;
    }

    return true;
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = () => {
    if (!validateIndicators()) {
      return;
    }

    console.log(indicators);
    return;

    setButtonLoading(true);

    requestHandler()
      .post(`/main_db/sessions/${id}`, {
        'indicators' : indicators,
      })
      .then((response: AxiosResponse<any>) => {
        reqForToastAndSetMessage(
          response.data.message,
          "success",
        );

        setValidationErrors({});
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "Failed to save sessions.",
          "error",
        );
      })
      .finally(() => setButtonLoading(false));
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDeleteSession = (
    indicatorId: number | null,
    session: Session,
  ) => {
    if (IsANullOrUndefinedValue(indicatorId)) return;

    // New unsaved row
    if (IsANullOrUndefinedValue(session.id)) {
      indicatorStateSetter((prev) =>
        prev.map((indicator) =>
          indicator.id === indicatorId
            ? {
                ...indicator,
                sessions: indicator.sessions.filter(
                  (currentSession) => currentSession !== session,
                ),
              }
            : indicator,
        ),
      );

      /*
       * If the deleted session was open in the modal,
       * close the modal as well.
       */
      setExpandedSession(null);

      return;
    }

    requestHandler()
      .delete(
        `/main_db/beneficiary/sessions/delete_session/${session.id}`,
      )
      .then((response: AxiosResponse<any>) => {
        indicatorStateSetter((prev) =>
          prev.map((indicator) =>
            indicator.id === indicatorId
              ? {
                  ...indicator,
                  sessions: indicator.sessions.filter(
                    (currentSession) =>
                      currentSession !== session,
                  ),
                }
              : indicator,
          ),
        );

        setExpandedSession(null);

        reqForToastAndSetMessage(
          response.data.message,
          "success",
        );
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "Failed to delete session.",
          "error",
        );
      });
  };

  // ---------------------------------------------------------------------------
  // Validation UI
  // ---------------------------------------------------------------------------

  const getError = (
    indicatorId: number,
    sessionIndex: number,
    field: keyof SessionError,
  ) => {
    return validationErrors[indicatorId]?.[sessionIndex]?.[field];
  };

  const hasSessionError = (
    indicatorId: number,
    sessionIndex: number,
  ) => {
    return Boolean(
      validationErrors[indicatorId]?.[sessionIndex],
    );
  };

  const renderError = (message?: string) => {
    if (!message) return null;

    return (
      <span className="flex items-center gap-1 px-1 text-[10px] font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
        <Info className="h-3 w-3 shrink-0" />
        {message}
      </span>
    );
  };

  // ---------------------------------------------------------------------------
  // Expand
  // ---------------------------------------------------------------------------

  const openExpandedSession = (
    indicatorId: number,
    sessionIndex: number,
    isGroup: boolean,
  ) => {
    setExpandedSession({
      indicatorId,
      sessionIndex,
      isGroup,
    });
  };

  const closeExpandedSession = () => {
    setExpandedSession(null);
  };

  // ---------------------------------------------------------------------------
  // Get expanded session
  // ---------------------------------------------------------------------------

  const expandedIndicator = expandedSession
    ? indicators.find(
        (indicator) =>
          indicator.id === expandedSession.indicatorId,
      )
    : null;

  const expandedSessionData =
    expandedIndicator && expandedSession
      ? expandedIndicator.sessions[
          expandedSession.sessionIndex
        ]
      : null;

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 gap-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>

        <div className="w-full max-w-5xl space-y-8 px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 space-y-5"
            >
              <Skeleton className="h-7 w-1/3 rounded-lg" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full pb-8">
      {indicators.map((indicator) => {
        if (!indicator.type) return null;

        const normalSessions = indicator.sessions
          .map((session, index) => ({
            session,
            index,
          }))
          .filter(({ session }) => session.group === null);

        const groupSessions = indicator.sessions
          .map((session, index) => ({
            session,
            index,
          }))
          .filter(({ session }) => session.group !== null);

        return (
          <div
            key={indicator.id}
            className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {/* ---------------------------------------------------------------- */}
            {/* Indicator Title */}
            {/* ---------------------------------------------------------------- */}

            <div className="mx-4 mt-4 mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex min-h-[56px] items-center justify-center px-5 bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>

                  <h1 className="text-base font-bold tracking-tight text-foreground md:text-lg">
                    {StringHelper.normalize(indicator.type)}
                  </h1>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Main Grid */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2">
              {/* ============================================================= */}
              {/* Sessions */}
              {/* ============================================================= */}

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                {/* Header */}

                <div className="border-b border-border bg-muted/20 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <h2 className="text-sm font-semibold text-foreground">
                          Sessions
                        </h2>

                        <p className="text-[10px] text-muted-foreground">
                          Regular beneficiary sessions
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      {normalSessions.length}
                    </span>
                  </div>
                </div>

                {/* Column Labels */}

                <div className="grid grid-cols-[1fr_1fr_40px] gap-2 border-b border-border px-3 py-2.5">
                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Session
                  </span>

                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </span>

                  <span />
                </div>

                {/* Rows */}

                <div className="p-3">
                  {normalSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
                      <CalendarDays className="mb-2 h-7 w-7 text-muted-foreground/50" />

                      <p className="text-xs font-medium text-muted-foreground">
                        No sessions added
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        Add a session using the button below
                      </p>
                    </div>
                  ) : (
                    normalSessions.map(({ session, index }) => {
                      const sessionHasError = hasSessionError(
                        indicator.id,
                        index,
                      );

                      return (
                        <div
                          key={
                            session.id ??
                            `new-session-${indicator.id}-${index}`
                          }
                          className={cn(
                            "relative mb-3 rounded-xl border bg-background p-3 transition-all",
                            sessionHasError
                              ? "border-destructive/50 bg-destructive/[0.03]"
                              : "border-border hover:border-primary/30 hover:shadow-sm",
                          )}
                        >
                          {/* Expand */}

                          <button
                            type="button"
                            onClick={() =>
                              openExpandedSession(
                                indicator.id,
                                index,
                                false,
                              )
                            }
                            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                            title="Expand session"
                            aria-label="Expand session"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="grid grid-cols-[1fr_1fr_40px] items-start gap-2 pr-9">
                            {/* Session */}

                            <div className="flex flex-col gap-1">
                              <Label className="sr-only">
                                Session
                              </Label>

                              <Input
                                placeholder="Session"
                                value={session.session}
                                onChange={(e) =>
                                  updateSession(
                                    indicator.id,
                                    index,
                                    "session",
                                    e.target.value,
                                  )
                                }
                                className={cn(
                                  "h-10 rounded-lg bg-background text-xs transition-colors",
                                  getError(
                                    indicator.id,
                                    index,
                                    "session",
                                  ) &&
                                    "border-destructive focus-visible:ring-destructive",
                                )}
                              />

                              {renderError(
                                getError(
                                  indicator.id,
                                  index,
                                  "session",
                                ),
                              )}
                            </div>

                            {/* Date */}

                            <div className="flex flex-col gap-1">
                              <Label className="sr-only">
                                Date
                              </Label>

                              <Input
                                type="date"
                                value={session.date}
                                onChange={(e) =>
                                  updateSession(
                                    indicator.id,
                                    index,
                                    "date",
                                    e.target.value,
                                  )
                                }
                                className={cn(
                                  "h-10 rounded-lg bg-background text-xs transition-colors",
                                  getError(
                                    indicator.id,
                                    index,
                                    "date",
                                  ) &&
                                    "border-destructive focus-visible:ring-destructive",
                                )}
                              />

                              {renderError(
                                getError(
                                  indicator.id,
                                  index,
                                  "date",
                                ),
                              )}
                            </div>

                            {/* Delete */}

                            <div className="flex h-10 items-center justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  reqForConfirmationModelFunc(
                                    BeneficiarySessionDeleteMessage,
                                    () =>
                                      handleDeleteSession(
                                        indicator.id,
                                        session,
                                      ),
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                title="Delete session"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Topic */}

                          <div className="mt-3 flex flex-col gap-1">
                            <Label className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Session Topic
                            </Label>

                            <Input
                              placeholder="Enter session topic"
                              value={session.topic}
                              onChange={(e) =>
                                updateSession(
                                  indicator.id,
                                  index,
                                  "topic",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                "h-10 rounded-lg bg-background text-xs transition-colors",
                                getError(
                                  indicator.id,
                                  index,
                                  "topic",
                                ) &&
                                  "border-destructive focus-visible:ring-destructive",
                              )}
                            />

                            {renderError(
                              getError(
                                indicator.id,
                                index,
                                "topic",
                              ),
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Add Session */}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => addSessionRow(indicator.id)}
                    className="mt-1 h-9 w-full rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Session
                  </Button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* Groups */}
              {/* ============================================================= */}

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                {/* Header */}

                <div className="border-b border-border bg-muted/20 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>

                      <div>
                        <h2 className="text-sm font-semibold text-foreground">
                          Groups
                        </h2>

                        <p className="text-[10px] text-muted-foreground">
                          Group-based sessions
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      {groupSessions.length}
                    </span>
                  </div>
                </div>

                {/* Column Labels */}

                <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 border-b border-border px-3 py-2.5">
                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Group
                  </span>

                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Session
                  </span>

                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </span>

                  <span />
                </div>

                {/* Rows */}

                <div className="p-3">
                  {groupSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
                      <Users className="mb-2 h-7 w-7 text-muted-foreground/50" />

                      <p className="text-xs font-medium text-muted-foreground">
                        No groups added
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        Add a group session using the button below
                      </p>
                    </div>
                  ) : (
                    groupSessions.map(({ session, index }) => {
                      const sessionHasError = hasSessionError(
                        indicator.id,
                        index,
                      );

                      return (
                        <div
                          key={
                            session.id ??
                            `new-group-${indicator.id}-${index}`
                          }
                          className={cn(
                            "relative mb-3 rounded-xl border bg-background p-3 transition-all",
                            sessionHasError
                              ? "border-destructive/50 bg-destructive/[0.03]"
                              : "border-border hover:border-primary/30 hover:shadow-sm",
                          )}
                        >
                          {/* Expand */}

                          <button
                            type="button"
                            onClick={() =>
                              openExpandedSession(
                                indicator.id,
                                index,
                                true,
                              )
                            }
                            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                            title="Expand group session"
                            aria-label="Expand group session"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="grid grid-cols-[1fr_1fr_1fr_40px] items-start gap-2 pr-9">
                            {/* Group */}

                            <div className="flex flex-col gap-1">
                              <Input
                                placeholder="Group"
                                value={session.group ?? ""}
                                onChange={(e) =>
                                  updateSession(
                                    indicator.id,
                                    index,
                                    "group",
                                    e.target.value,
                                  )
                                }
                                className={cn(
                                  "h-10 rounded-lg bg-background text-xs transition-colors",
                                  getError(
                                    indicator.id,
                                    index,
                                    "group",
                                  ) &&
                                    "border-destructive focus-visible:ring-destructive",
                                )}
                              />

                              {renderError(
                                getError(
                                  indicator.id,
                                  index,
                                  "group",
                                ),
                              )}
                            </div>

                            {/* Session */}

                            <div className="flex flex-col gap-1">
                              <Input
                                placeholder="Session"
                                value={session.session}
                                onChange={(e) =>
                                  updateSession(
                                    indicator.id,
                                    index,
                                    "session",
                                    e.target.value,
                                  )
                                }
                                className={cn(
                                  "h-10 rounded-lg bg-background text-xs transition-colors",
                                  getError(
                                    indicator.id,
                                    index,
                                    "session",
                                  ) &&
                                    "border-destructive focus-visible:ring-destructive",
                                )}
                              />

                              {renderError(
                                getError(
                                  indicator.id,
                                  index,
                                  "session",
                                ),
                              )}
                            </div>

                            {/* Date */}

                            <div className="flex flex-col gap-1">
                              <Input
                                type="date"
                                value={session.date}
                                onChange={(e) =>
                                  updateSession(
                                    indicator.id,
                                    index,
                                    "date",
                                    e.target.value,
                                  )
                                }
                                className={cn(
                                  "h-10 rounded-lg bg-background text-xs transition-colors",
                                  getError(
                                    indicator.id,
                                    index,
                                    "date",
                                  ) &&
                                    "border-destructive focus-visible:ring-destructive",
                                )}
                              />

                              {renderError(
                                getError(
                                  indicator.id,
                                  index,
                                  "date",
                                ),
                              )}
                            </div>

                            {/* Delete */}

                            <div className="flex h-10 items-center justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  reqForConfirmationModelFunc(
                                    BeneficiarySessionDeleteMessage,
                                    () =>
                                      handleDeleteSession(
                                        indicator.id,
                                        session,
                                      ),
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                title="Delete group session"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Topic */}

                          <div className="mt-3 flex flex-col gap-1">
                            <Label className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Session Topic
                            </Label>

                            <Input
                              placeholder="Enter session topic"
                              value={session.topic}
                              onChange={(e) =>
                                updateSession(
                                  indicator.id,
                                  index,
                                  "topic",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                "h-10 rounded-lg bg-background text-xs transition-colors",
                                getError(
                                  indicator.id,
                                  index,
                                  "topic",
                                ) &&
                                  "border-destructive focus-visible:ring-destructive",
                              )}
                            />

                            {renderError(
                              getError(
                                indicator.id,
                                index,
                                "topic",
                              ),
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Add Group */}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => addGroupRow(indicator.id)}
                    className="mt-1 h-9 w-full rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Group Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* -------------------------------------------------------------------- */}
      {/* Expanded Session Modal */}
      {/* -------------------------------------------------------------------- */}

      <Dialog
        open={expandedSession !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeExpandedSession();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] min-w-4xl overflow-hidden rounded-2xl p-0">
          {expandedSessionData && expandedSession ? (
            <>
              {/* Modal Header */}

              <DialogHeader className="border-b border-border bg-muted/20 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    {expandedSession.isGroup ? (
                      <Users className="h-5 w-5 text-primary" />
                    ) : (
                      <CalendarDays className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <DialogTitle className="text-base font-semibold">
                      {expandedSession.isGroup
                        ? "Group Session"
                        : "Session"}
                    </DialogTitle>

                    <DialogDescription className="mt-1 text-xs">
                      Edit the session details with more space.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Modal Body */}

              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {/* Session Information */}

                  <div className="rounded-2xl border border-border bg-muted/10 p-5">
                    <div className="mb-5 flex items-center gap-2">
                      {expandedSession.isGroup ? (
                        <Users className="h-4 w-4 text-primary" />
                      ) : (
                        <CalendarDays className="h-4 w-4 text-primary" />
                      )}

                      <div>
                        <h3 className="text-sm font-semibold">
                          Session Information
                        </h3>

                        <p className="text-[11px] text-muted-foreground">
                          Update the main session information.
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "grid gap-5",
                        expandedSession.isGroup
                          ? "grid-cols-1 md:grid-cols-3"
                          : "grid-cols-1 md:grid-cols-2",
                      )}
                    >
                      {/* Group */}

                      {expandedSession.isGroup && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">
                            Group
                          </Label>

                          <Input
                            placeholder="Enter group"
                            value={
                              expandedSessionData.group ?? ""
                            }
                            onChange={(e) =>
                              updateSession(
                                expandedSession.indicatorId,
                                expandedSession.sessionIndex,
                                "group",
                                e.target.value,
                              )
                            }
                            className={cn(
                              "h-11 rounded-xl",
                              getError(
                                expandedSession.indicatorId,
                                expandedSession.sessionIndex,
                                "group",
                              ) &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                          />

                          {renderError(
                            getError(
                              expandedSession.indicatorId,
                              expandedSession.sessionIndex,
                              "group",
                            ),
                          )}
                        </div>
                      )}

                      {/* Session */}

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                          Session
                        </Label>

                        <Input
                          placeholder="Enter session"
                          value={expandedSessionData.session}
                          onChange={(e) =>
                            updateSession(
                              expandedSession.indicatorId,
                              expandedSession.sessionIndex,
                              "session",
                              e.target.value,
                            )
                          }
                          className={cn(
                            "h-11 rounded-xl",
                            getError(
                              expandedSession.indicatorId,
                              expandedSession.sessionIndex,
                              "session",
                            ) &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                        />

                        {renderError(
                          getError(
                            expandedSession.indicatorId,
                            expandedSession.sessionIndex,
                            "session",
                          ),
                        )}
                      </div>

                      {/* Date */}

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">
                          Date
                        </Label>

                        <Input
                          type="date"
                          value={expandedSessionData.date}
                          onChange={(e) =>
                            updateSession(
                              expandedSession.indicatorId,
                              expandedSession.sessionIndex,
                              "date",
                              e.target.value,
                            )
                          }
                          className={cn(
                            "h-11 rounded-xl",
                            getError(
                              expandedSession.indicatorId,
                              expandedSession.sessionIndex,
                              "date",
                            ) &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                        />

                        {renderError(
                          getError(
                            expandedSession.indicatorId,
                            expandedSession.sessionIndex,
                            "date",
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Topic */}

                  <div className="rounded-2xl border border-border bg-muted/10 p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />

                      <div>
                        <h3 className="text-sm font-semibold">
                          Session Topic
                        </h3>

                        <p className="text-[11px] text-muted-foreground">
                          Enter the complete topic of this session.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">
                        Topic
                      </Label>

                      <Input
                        placeholder="Enter session topic"
                        value={expandedSessionData.topic}
                        onChange={(e) =>
                          updateSession(
                            expandedSession.indicatorId,
                            expandedSession.sessionIndex,
                            "topic",
                            e.target.value,
                          )
                        }
                        className={cn(
                          "h-12 rounded-xl text-sm",
                          getError(
                            expandedSession.indicatorId,
                            expandedSession.sessionIndex,
                            "topic",
                          ) &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                      />

                      {renderError(
                        getError(
                          expandedSession.indicatorId,
                          expandedSession.sessionIndex,
                          "topic",
                        ),
                      )}
                    </div>
                  </div>

                  {/* Status */}

                  {hasSessionError(
                    expandedSession.indicatorId,
                    expandedSession.sessionIndex,
                  ) && (
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.04] p-4">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

                      <div>
                        <p className="text-xs font-semibold text-destructive">
                          Please review this session
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Some fields still contain validation
                          errors. Correct them before submitting.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}

              <div className="flex items-center justify-between border-t border-border bg-muted/10 px-6 py-4">
                <button
                  type="button"
                  onClick={() =>
                    reqForConfirmationModelFunc(
                      BeneficiarySessionDeleteMessage,
                      () =>
                        handleDeleteSession(
                          expandedSession.indicatorId,
                          expandedSessionData,
                        ),
                    )
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={closeExpandedSession}
                  className="h-9 rounded-lg px-4 text-xs"
                >
                  <Minimize2 className="mr-2 h-3.5 w-3.5" />
                  Close
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------- */}
      {/* Submit */}
      {/* -------------------------------------------------------------------- */}

      <div className="mx-4 mt-8 flex items-center justify-end border-t border-border pt-5">
        <Button
          id={SUBMIT_BUTTON_PROVIDER_ID}
          disabled={buttonLoading}
          type="button"
          onClick={() =>
            reqForConfirmationModelFunc(
              BeneficiarySessionSubmitButtonMessage,
              handleSubmit,
            )
          }
          className="h-10 min-w-[120px] rounded-lg px-5 text-xs font-medium shadow-sm transition-all hover:shadow-md"
        >
          {buttonLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
}