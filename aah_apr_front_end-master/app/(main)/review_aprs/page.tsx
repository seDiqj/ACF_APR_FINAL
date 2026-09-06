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
import { ClipboardCheck, Eye, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  RejectSecondApprovedDatabaseMessage,
  ReviewAprMessage,
} from "@/constants/ConfirmationModelsTexts";
import { ReviewAprFiltersList } from "@/constants/FiltersList";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import CommentDialog from "@/components/global/CommentBox";

const ReviewAprPage = () => {
  const {
    axiosInstance,
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    handleReload,
    handleAprReload,
  } = useParentContext();

  const router = useRouter();

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  const [reqForCommentDialog, setReqForCommentDialog] =
    useState<boolean>(false);

  const [
    OpenSubmittedDatabaseSummaryModel,
    setOpenSubmittedDatabaseSummaryModel,
  ] = useState<boolean>(false);

  const previewApr = () => {
    router.push(`/apr_preview/${idFeildForEditStateSetter}`);
  };

  const markAprAsReviewed = () => {
    axiosInstance
      .post(`/apr_management/mark_apr_as_reviewed/${idFeildForEditStateSetter}`)
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
    axiosInstance
      .post(
        `/apr_management/reject_in_review_stage/${idFeildForEditStateSetter}`,
        {
          comment: comment,
        },
      )
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
        <SubHeader pageTitle={"Review Apr's"}></SubHeader>
        <Cards />

        <DataTableDemo
          columns={submittedAndFirstApprovedDatabasesTableColumn}
          indexUrl="/apr_management/generated_aprs"
          deleteUrl="/db_management/delete_apr"
          searchableColumn="name"
          idFeildForShowStateSetter={setIdFeildForEditStateSetter}
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          showModelOpenerStateSetter={setOpenSubmittedDatabaseSummaryModel}
          injectedElementForOneSelectedItem={
            <div className="flex flex-row items-center gap-1">
              <Button
                title="Review Apr"
                className="text-blue-600"
                variant={"outline"}
                onClick={previewApr}
              >
                <Eye />
              </Button>
              <Button
                title="Mark as reviewed"
                className="text-blue-600"
                variant={"outline"}
                onClick={() =>
                  reqForConfirmationModelFunc(
                    ReviewAprMessage,
                    markAprAsReviewed,
                  )
                }
              >
                <ClipboardCheck />
              </Button>
              <Button
                title="Reject"
                className="text-red-500"
                variant={"outline"}
                onClick={() => setReqForCommentDialog(true)}
              >
                <XCircle />
              </Button>
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
            confirmationModelMessage={RejectSecondApprovedDatabaseMessage}
          />
        )}
      </div>
    </>
  );
};

export default ReviewAprPage;
