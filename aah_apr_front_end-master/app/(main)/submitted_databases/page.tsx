"use client";

import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import Cards from "@/components/ui/shadcn-io/Cards";
import SubmitNewDB from "@/components/ui/shadcn-io/SubmitNewDB";
import SubmitSummary from "@/components/ui/shadcn-io/submitSummary";
import { useState } from "react";
import { submittedAndFirstApprovedDatabasesTableColumn } from "@/definitions/DataTableColumnsDefinitions";
import { Button } from "@/components/ui/button";
import { useParentContext } from "@/contexts/ParentContext";
import { Check, XCircle } from "lucide-react";
import {
  ApproveDatabaseMessage,
  RejectDatabaseMessage,
} from "@/constants/ConfirmationModelsTexts";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import CommentDialog from "@/components/global/CommentBox";
import { Edit } from "lucide-react";
import { SUBMITTED_DATABASE_FILTERS_LIST } from "@/constants/FilterListURLS";
import { withPermission } from "@/lib/withPermission";
import { Can } from "@/components/Can";

const SubmittedDatabasesPage = () => {
  const {
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    axiosInstance,
    handleReload,
    handleAprReload,
  } = useParentContext();

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  const [reqForSubmitNewDatabase, setReqForSubmitNewDatabase] =
    useState<boolean>(false);

  const [reqForDatabaseEditForm, setReqForDatabaseEditForm] =
    useState<boolean>(false);

  const [reqForSubmittedDatabaseSummary, setReqForSubmittedDatabaseSummary] =
    useState<boolean>(false);

  const [reqForCommentDialog, setReqForCommentDialog] =
    useState<boolean>(false);

  const approveDatabase = () => {
    axiosInstance
      .post(`/db_management/change_db_status/${idFeildForEditStateSetter}`, {
        newStatus: "firstApproved",
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

  const rejectDatabase = (comment: string) => {
    axiosInstance
      .post(`/db_management/change_db_status/${idFeildForEditStateSetter}`, {
        newStatus: "firstRejected",
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

  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader
          pageTitle={"Submitted Database"}
          children={
            <div className="flex flex-row items-center gap-2">
              <Can permission="Database_submission.create">
                <Button
                  onClick={() =>
                    setReqForSubmitNewDatabase(!reqForSubmitNewDatabase)
                  }
                >
                  Submitt New
                </Button>
              </Can>
            </div>
          }
        ></SubHeader>
        <Cards />
        <DataTableDemo
          columns={submittedAndFirstApprovedDatabasesTableColumn}
          indexUrl="/db_management/submitted_databases"
          deleteUrl="/db_management/delete_apr"
          searchableColumn="name"
          deleteBtnPermission="Database_submission.delete"
          editBtnPermission="Database_submission.edit"
          viewPermission="Database_submission.view"
          idFeildForShowStateSetter={setIdFeildForEditStateSetter}
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          showModelOpenerStateSetter={setReqForSubmittedDatabaseSummary}
          injectedElementForOneSelectedItem={
            <div className="flex flex-row items-center gap-1">
              <Can permission="Database_submission.approve">
                <Button
                  title="Approve"
                  className="text-green-400"
                  variant={"outline"}
                  onClick={() =>
                    reqForConfirmationModelFunc(
                      ApproveDatabaseMessage,
                      approveDatabase,
                    )
                  }
                >
                  <Check />
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
              <Can permission="Database_submission.edit">
                <Button
                  title="Edit"
                  variant={"outline"}
                  onClick={() => setReqForDatabaseEditForm(true)}
                >
                  <Edit
                    className="cursor-pointer text-orange-500 hover:text-orange-700"
                    size={18}
                  ></Edit>
                </Button>
              </Can>
            </div>
          }
          filtersListURL={SUBMITTED_DATABASE_FILTERS_LIST}
        ></DataTableDemo>

        {reqForSubmitNewDatabase && (
          <SubmitNewDB
            open={reqForSubmitNewDatabase}
            onOpenChange={setReqForSubmitNewDatabase}
            mode="create"
          />
        )}

        {reqForDatabaseEditForm && (
          <SubmitNewDB
            open={reqForDatabaseEditForm}
            onOpenChange={setReqForDatabaseEditForm}
            mode="edit"
            id={idFeildForEditStateSetter as unknown as number}
          />
        )}

        {reqForSubmittedDatabaseSummary && (
          <SubmitSummary
            open={reqForSubmittedDatabaseSummary}
            onOpenChange={setReqForSubmittedDatabaseSummary}
            databaseId={idFeildForEditStateSetter as unknown as string}
          />
        )}

        {reqForCommentDialog && (
          <CommentDialog
            open={reqForCommentDialog}
            onOpenChange={setReqForCommentDialog}
            onSubmit={rejectDatabase}
            confirmationModelMessage={RejectDatabaseMessage}
          ></CommentDialog>
        )}
      </div>
    </>
  );
};

export default withPermission(SubmittedDatabasesPage, [
  "Database_submission.create",
  "Database_submission.view",
  "Database_submission.edit",
  "Database_submission.delete",
  "Database_submission.approve",
]);
