"use client";

import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import Cards from "@/components/ui/shadcn-io/Cards";
import SubmitSummary from "@/components/ui/shadcn-io/submitSummary";
import { useState } from "react";
import { submittedAndFirstApprovedDatabasesTableColumn } from "@/definitions/DataTableColumnsDefinitions";
import { Button } from "@/components/ui/button";
import { useParentContext } from "@/contexts/ParentContext";
import { Eye, ShieldCheck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ApproveAprMessage,
  RejectAprMessage,
} from "@/constants/ConfirmationModelsTexts";
import { ApprovedAprsFiltersList } from "@/constants/FiltersList";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import CommentDialog from "@/components/global/CommentBox";
import { withPermission } from "@/lib/withPermission";
import { Can } from "@/components/Can";

const ApproveAprsPage = () => {
  const {
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    requestHandler,
    handleReload,
    handleAprReload,
  } = useParentContext();

  const router = useRouter();

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  const [
    OpenSubmittedDatabaseSummaryModel,
    setOpenSubmittedDatabaseSummaryModel,
  ] = useState<boolean>(false);

  const [reqForCommentDialog, setReqForCommentDialog] =
    useState<boolean>(false);

  const approveApr = () => {
    if (!idFeildForEditStateSetter)
      reqForToastAndSetMessage("Please select a valid apr.");
    requestHandler()
      .post(`/apr_management/approve_apr/${idFeildForEditStateSetter}`, {
        newStatus: "secondApproved",
      })
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
        handleAprReload();
        handleReload();
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  };

  const rejectApr = (comment: string) => {
    if (!idFeildForEditStateSetter)
      reqForToastAndSetMessage("Please select a valid apr.");
    requestHandler()
      .post(`/apr_management/approve_apr/${idFeildForEditStateSetter}`, {
        newStatus: "fourthRejected",
        comment: comment,
      })
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
        handleAprReload();
        handleReload();
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  };

  const previewApr = () => {
    router.push(`/apr_preview/${idFeildForEditStateSetter}`);
  };

  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Approve Apr's"}></SubHeader>
        <Cards />

        <DataTableDemo
          columns={submittedAndFirstApprovedDatabasesTableColumn}
          indexUrl="/apr_management/reviewed_aprs"
          deleteUrl="/db_management/delete_apr"
          searchableColumn="name"
          deleteBtnPermission="Database_submission.delete"
          editBtnPermission="Database_submission.edit"
          viewPermission="Database_submission.view"
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          showModelOpenerStateSetter={setOpenSubmittedDatabaseSummaryModel}
          injectedElementForOneSelectedItem={
            <div className="flex flex-row items-center gap-1">
              <Can permission="Database_submission.approve">
                <Button
                  title="Approve Apr"
                  className="text-blue-600"
                  variant={"outline"}
                  onClick={() =>
                    reqForConfirmationModelFunc(ApproveAprMessage, approveApr)
                  }
                >
                  <ShieldCheck />
                </Button>
              </Can>
              <Can permission="Database_submission.approve">
                <Button
                  title="Reject"
                  className="text-red-500"
                  variant={"outline"}
                  onClick={() => setReqForCommentDialog(true)}
                >
                  <XCircle />
                </Button>
              </Can>
              <Can permission="Apr.mark_as_reviewed">
                <Button
                  title="Review Apr"
                  className="text-blue-600"
                  variant={"outline"}
                  onClick={previewApr}
                >
                  <Eye />
                </Button>
              </Can>
            </div>
          }
          filtersListURL="/filters_list/submitted_database_filters_list"
        ></DataTableDemo>

        {OpenSubmittedDatabaseSummaryModel && (
          <SubmitSummary
            open={OpenSubmittedDatabaseSummaryModel}
            onOpenChange={setOpenSubmittedDatabaseSummaryModel}
            databaseId={idFeildForEditStateSetter as unknown as string}
          />
        )}

        {reqForCommentDialog && (
          <CommentDialog
            open={reqForCommentDialog}
            onOpenChange={setReqForCommentDialog}
            onSubmit={rejectApr}
            confirmationModelMessage={RejectAprMessage}
          ></CommentDialog>
        )}
      </div>
    </>
  );
};

export default withPermission(ApproveAprsPage, [
  "Database_submission.create",
  "Database_submission.view",
  "Database_submission.edit",
  "Database_submission.delete",
  "Database_submission.approve",
]);
