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
import { FileChartColumn, XCircle } from "lucide-react";
import {
  GenerateAprMessage,
  RejectFirstApprovedDatabaseMessage,
} from "@/constants/ConfirmationModelsTexts";
import { AxiosError, AxiosResponse } from "axios";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import CommentDialog from "@/components/global/CommentBox";
import { withPermission } from "@/lib/withPermission";
import { Can } from "@/components/Can";

const ApprovedDatabasesPage = () => {
  const {
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    requestHandler,
    handleReload,
    handleAprReload,
  } = useParentContext();

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  const [
    OpenSubmittedDatabaseSummaryModel,
    setOpenSubmittedDatabaseSummaryModel,
  ] = useState<boolean>(false);

  const [reqForCommentDialog, setReqForCommentDialog] =
    useState<boolean>(false);

  const generateApr = () => {
    requestHandler()
      .post(`/apr_management/generate_apr/${idFeildForEditStateSetter}`)
      .then((response: any) => {
        {
          reqForToastAndSetMessage(response.data.message, "success");
          handleAprReload();
          handleReload();
        }
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  };

  const rejectDatabase = (comment: string) => {
    requestHandler()
      .post(`/db_management/change_db_status/${idFeildForEditStateSetter}`, {
        newStatus: "secondRejected",
        comment: comment,
      })
      .then((response: AxiosResponse<any, any, any>) => {
        reqForToastAndSetMessage(response.data.message, "success");
        handleAprReload();
        handleReload();
      })
      .catch((error: AxiosError<any, any>) =>
        reqForToastAndSetMessage(error.response?.data.message, "error"),
      );
  };

  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Approved Databases"}></SubHeader>
        <Cards />

        <DataTableDemo
          columns={submittedAndFirstApprovedDatabasesTableColumn}
          indexUrl="/db_management/first_approved_databases"
          deleteUrl="/db_management/delete_apr"
          searchableColumn="name"
          idFeildForShowStateSetter={setIdFeildForEditStateSetter}
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          showModelOpenerStateSetter={setOpenSubmittedDatabaseSummaryModel}
          deleteBtnPermission="Database_submission.delete"
          editBtnPermission="Database_submission.edit"
          viewPermission="Database_submission.view"
          injectedElementForOneSelectedItem={
            <div className="flex flex-row items-center gap-1">
              <Can permission="Database_submission.generate_apr">
                <Button
                  title="Generate Apr"
                  className="text-blue-600"
                  variant={"outline"}
                  onClick={() =>
                    reqForConfirmationModelFunc(GenerateAprMessage, generateApr)
                  }
                >
                  <FileChartColumn />
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
            onSubmit={rejectDatabase}
            confirmationModelMessage={RejectFirstApprovedDatabaseMessage}
          ></CommentDialog>
        )}
      </div>
    </>
  );
};

export default withPermission(ApprovedDatabasesPage, [
  "Database_submission.create",
  "Database_submission.view",
  "Database_submission.edit",
  "Database_submission.delete",
  "Database_submission.approve",
]);
