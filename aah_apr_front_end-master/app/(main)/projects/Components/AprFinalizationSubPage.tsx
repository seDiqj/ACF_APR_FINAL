"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  aprFinalizationSteps,
  projectAprStatusList,
} from "../utils/OptionLists";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { useProjectContext } from "../create_new_project/page";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { GitPullRequest, User } from "lucide-react";
import {
  IsCreateMode,
  IsEnteredStatusCallingToBeApproveAtLevelAboveTheAllowedLevel,
  IsEnteredStatusCallsToRejectAtTheLevelAboveTheCurrentLimit,
  IsEnteredStatusLocaltedAtTheLowerLevelThenTheCurrentStatus,
  IsShowMode,
  IsValidAprStatus,
} from "@/constants/Constants";
import { AprFinalizationSubPageInterface } from "@/interfaces/Interfaces";
import {
  AcceptFinalizationMessage,
  RejectFinalizationMessage,
} from "@/constants/ConfirmationModelsTexts";
import { usePermissions } from "@/contexts/PermissionContext";
import UserAvatar from "@/components/global/UserAvatar";
import StringHelper from "@/helpers/StringHelpers/StringHelper";

const AprFinalizationSubPage: React.FC<AprFinalizationSubPageInterface> = ({
  mode,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const {
    projectId,
    actionLogs,
    setActionLogs,
    projectAprStatus,
    setProjectAprStatus,
  } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();

  const { permissions, loading } = usePermissions();
  const [comment, setComment] = useState<string>(" ");
  const [reqForCreationModel, setReqForCreationModel] = useState(false);
  const [reqForSubmitionModel, setReqForSubmitionModel] = useState(false);
  const [reqForGrantFinalizationModel, setReqForGrantFinalizationModel] =
    useState(false);
  const [reqForHqFinalizationModel, setReqForHqFinalizationModel] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasPositiveResult = (action: string) => {
    return (
      action === "create" ||
      action === "submit" ||
      action === "grantFinalize" ||
      action === "hqFinalize"
    );
  };

  const changeProjectAprStatus = (status: string) => {
    if (!IsValidAprStatus(status)) {
      reqForToastAndSetMessage("Wrong status !", "error");
      return;
    } else if (
      IsEnteredStatusLocaltedAtTheLowerLevelThenTheCurrentStatus(
        projectAprStatus,
        status
      )
    ) {
      reqForToastAndSetMessage(
        `You cannot set the project status to ${status} while it is ${projectAprStatus}!`,
        "warning"
      );
      return;
    } else if (
      IsEnteredStatusCallsToRejectAtTheLevelAboveTheCurrentLimit(
        projectAprStatus,
        status
      )
    ) {
      reqForToastAndSetMessage(
        `You cannot reject a project at the ${status} stage while it is on ${projectAprStatus}!`,
        "warning"
      );
      return;
    } else if (
      IsEnteredStatusCallingToBeApproveAtLevelAboveTheAllowedLevel(
        projectAprStatus,
        status
      )
    ) {
      reqForToastAndSetMessage(
        `You cannot approve this step before previous steps!`,
        "warning"
      );
      return;
    }

    setIsLoading(true);
    requestHandler()
      .post(`projects/status/change_apr_status/${projectId}`, {
        newStatus: status,
        comment,
      })
      .then((response: any) => {
        setComment(" ");
        reqForToastAndSetMessage(response.data.message, "success");
        setProjectAprStatus(response.data.data);
        [
          setReqForCreationModel,
          setReqForSubmitionModel,
          setReqForGrantFinalizationModel,
          setReqForHqFinalizationModel,
        ].forEach((fn) => fn(false));
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error modifying status",
          "error"
        )
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!projectId) return;
    requestHandler()
      .get(`/projects/get_project_finalizers_details/${projectId}`)
      .then((response: any) => {
        setActionLogs(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );
  }, [projectAprStatus, projectId]);

  const readOnly = IsShowMode(mode);

  return (
    <Card className="h-full border border-border bg-card shadow-sm flex flex-col rounded-xl overflow-hidden min-h-[500px]">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <GitPullRequest className="text-primary" size={22} />
          APR Finalization Workflow
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track, review, and authorize execution milestones across institutional
          steps.
        </p>
      </CardHeader>

      <CardContent className="p-6 overflow-y-auto flex-1 no-scrollbar space-y-6">
        <div className="flex flex-col gap-4">
          {aprFinalizationSteps
            .filter((step) => permissions.includes(step.permission))
            .map((step) => {
              const canReject = true;
              return (
                <div
                  key={step.id}
                  className="rounded-xl border border-border bg-muted/10 p-4 hover:bg-muted/20 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <AlertDialog
                      open={
                        step.id === "create"
                          ? reqForCreationModel
                          : step.id === "submit"
                          ? reqForSubmitionModel
                          : step.id === "grantFinalize"
                          ? reqForGrantFinalizationModel
                          : reqForHqFinalizationModel
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <Checkbox
                          id={step.id}
                          checked={
                            (() => {
                              const currentIdx =
                                projectAprStatusList.indexOf(projectAprStatus);
                              const stepIdx = projectAprStatusList.indexOf(
                                step.acceptStatusValue!
                              );
                              const isRejected = step.rejectStatusValue
                                ? projectAprStatus === step.rejectStatusValue
                                : false;
                              return (
                                !isRejected &&
                                stepIdx !== -1 &&
                                currentIdx >= stepIdx
                              );
                            })() || projectAprStatus === step.acceptStatusValue
                          }
                          onCheckedChange={() =>
                            step.id === "create"
                              ? setReqForCreationModel(true)
                              : step.id === "submit"
                              ? setReqForSubmitionModel(true)
                              : step.id === "grantFinalize"
                              ? setReqForGrantFinalizationModel(true)
                              : setReqForHqFinalizationModel(true)
                          }
                          disabled={
                            readOnly ||
                            (loading && !permissions.includes(step.permission))
                          }
                          className="h-5 w-5 rounded-md border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </AlertDialogTrigger>

                      <AlertDialogContent className="max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
                        <AlertDialogHeader className="border-b pb-3">
                          <AlertDialogTitle className="text-lg font-bold text-foreground">
                            {canReject
                              ? "Accept or Reject this step?"
                              : `Confirm ${step.label}?`}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-2 mt-4">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Comment
                          </Label>
                          <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your comment..."
                            disabled={readOnly}
                            className="rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary min-h-[90px]"
                          />
                        </div>

                        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-2 border-t pt-4">
                          <AlertDialogCancel
                            onClick={() => {
                              setReqForCreationModel(false);
                              setReqForGrantFinalizationModel(false);
                              setReqForHqFinalizationModel(false);
                              setReqForSubmitionModel(false);
                            }}
                            className="rounded-lg h-9 px-4 border-muted hover:bg-muted"
                          >
                            Cancel
                          </AlertDialogCancel>
                          {canReject ? (
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                disabled={readOnly || isLoading}
                                onClick={() =>
                                  reqForConfirmationModelFunc(
                                    RejectFinalizationMessage,
                                    () =>
                                      comment.trim()
                                        ? changeProjectAprStatus(
                                            step.rejectStatusValue!
                                          )
                                        : reqForToastAndSetMessage(
                                            "Comment is required!",
                                            "warning"
                                          )
                                  )
                                }
                                className="rounded-lg h-9 px-4 shadow-sm"
                              >
                                Reject
                              </Button>
                              <Button
                                disabled={readOnly || isLoading}
                                onClick={() =>
                                  reqForConfirmationModelFunc(
                                    AcceptFinalizationMessage,
                                    () =>
                                      comment.trim()
                                        ? changeProjectAprStatus(
                                            step.acceptStatusValue!
                                          )
                                        : reqForToastAndSetMessage(
                                            "Comment is required!",
                                            "warning"
                                          )
                                  )
                                }
                                className="rounded-lg h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
                              >
                                Accept
                              </Button>
                            </div>
                          ) : (
                            <Button
                              disabled={readOnly || isLoading}
                              onClick={() =>
                                comment.trim()
                                  ? changeProjectAprStatus(
                                      step.acceptStatusValue!
                                    )
                                  : reqForToastAndSetMessage(
                                      "Comment is required!",
                                      "warning"
                                    )
                              }
                              className="rounded-lg h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
                            >
                              {step.buttonLabel}
                            </Button>
                          )}
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                      <Label className="font-semibold text-foreground text-sm">
                        {step.label}
                      </Label>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-md border self-start sm:self-auto">
                        {actionLogs.find((log: any) => log.action === step.id)
                          ?.name ?? "Pending"}{" "}
                        •{" "}
                        {actionLogs.find((log: any) => log.action === step.id)
                          ?.role?.name
                          ? StringHelper.normalize(
                              actionLogs.find(
                                (log: any) => log.action === step.id
                              )?.role?.name
                            )
                          : "Pending"}{" "}
                        •{" "}
                        {actionLogs.find((log: any) => log.action === step.id)
                          ?.date ?? "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* ================= Timeline ================= */}
        <div className="border-t pt-6 mt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Action Timeline
          </h3>
          <div className="flex flex-row items-center gap-4 overflow-x-auto p-4 rounded-xl border bg-muted/5 shadow-inner no-scrollbar">
            {actionLogs.map((log: any, i: number) => (
              <div
                key={log.id || i}
                className="flex items-center gap-4 shrink-0"
              >
                <div className="flex flex-col items-center text-center w-24">
                  {log.avatar && log.avatar !== "default" ? (
                    <img
                      src={log.avatar}
                      alt={log.name}
                      className="w-10 h-10 rounded-full border border-border shadow-sm object-cover"
                    />
                  ) : (
                    <UserAvatar userName={log.name} />
                  )}
                  <span className="text-xs font-semibold text-foreground mt-1.5 truncate w-full">
                    {log.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border shadow-sm ${
                      hasPositiveResult(log.action)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-destructive/5 text-destructive border-destructive/20"
                    }`}
                  >
                    {StringHelper.normalize(log.action)}
                  </span>
                </div>
                {i < actionLogs.length - 1 && (
                  <div className="w-10 h-px bg-border shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AprFinalizationSubPage;
