"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import CreateNewBeneficiaryTraining from "@/components/global/CreateNewBeneficiaryTraining";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import TrainingSelectorDialog from "@/components/global/TrainingSelectorDialog";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { trainingDatabaseBeneificiaryListColumn } from "@/definitions/DataTableColumnsDefinitions";
import { Plus, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import {
  ChangeAprIncludedStatusButtonMessage,
  ChangeAprNotIncludedStatusButtonMessage,
} from "@/constants/ConfirmationModelsTexts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { withPermission } from "@/lib/withPermission";
import { Can } from "@/components/Can";

const TrainingDatabasePage = () => {
  const { reqForConfirmationModelFunc, changeBeneficairyAprIncludedStatus } =
    useParentContext();

  const router = useRouter();

  const [reqForBeneficiaryCreationForm, setReqForBeneficiaryCreationForm] =
    useState<boolean>(false);

  const [openTrainingSelectorDialog, setOpenTrainingSelectorDialog] =
    useState<boolean>(false);

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  let [idFeildForShowStateSetter, setIdFeildForShowStateSetter] = useState<
    number | null
  >(null);

  const [reqForBeneficiaryEditionForm, setReqForBeneficiaryEditionForm] =
    useState<boolean>(false);

  const [selectedRowsIds, setSelectedRows] = useState<{}>({});

  const openTrainingProfilePage = (value: boolean, id: number) => {
    router.push(`/training_database/beneficiary_profile/${id}`);
  };

  useEffect(() => {
    if (idFeildForShowStateSetter)
      openTrainingProfilePage(true, idFeildForShowStateSetter);
  }, [idFeildForShowStateSetter]);

  return (
    <div className="w-full h-full p-2">
      <Navbar14 />
      <div className="flex flex-row items-center justify-start my-2">
        <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
      </div>
      <SubHeader pageTitle={"Benficiaries"}>
        <div className="flex flex-row items-center justify-around gap-2">
          <Can permission="Training.view">
            <Button onClick={() => router.push("/training_database/trainings")}>
              Trainings
            </Button>
          </Can>
          <Can permission="Training.create">
            <Button
              onClick={() =>
                setReqForBeneficiaryCreationForm(!reqForBeneficiaryCreationForm)
              }
            >
              Create New Beneficiary
            </Button>
          </Can>
        </div>
      </SubHeader>
      <DataTableDemo
        columns={trainingDatabaseBeneificiaryListColumn}
        indexUrl="/training_db/beneficiaries"
        deleteUrl="training_db/delete_beneficiaries"
        searchableColumn="name"
        idFeildForEditStateSetter={setIdFeildForEditStateSetter}
        editModelOpenerStateSetter={setReqForBeneficiaryEditionForm}
        idFeildForShowStateSetter={setIdFeildForShowStateSetter}
        showModelOpenerStateSetter={() => {}}
        selectedRowsIdsStateSetter={setSelectedRows}
        deleteBtnPermission="Training.delete"
        editBtnPermission="Training.edit"
        viewPermission="Training.view"
        injectedElement={
          <div className="flex flex-row items-center gap-1">
            <Can permission="Training.assign_training">
              <Button
                onClick={() =>
                  setOpenTrainingSelectorDialog(!openTrainingSelectorDialog)
                }
                variant={"outline"}
                title="Add Training"
              >
                <Plus></Plus>
              </Button>
            </Can>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ToggleRight />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    reqForConfirmationModelFunc(
                      ChangeAprIncludedStatusButtonMessage,
                      () =>
                        changeBeneficairyAprIncludedStatus(
                          Object.keys(selectedRowsIds),
                          "included",
                        ),
                    )
                  }
                >
                  Include
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    reqForConfirmationModelFunc(
                      ChangeAprNotIncludedStatusButtonMessage,
                      () =>
                        changeBeneficairyAprIncludedStatus(
                          Object.keys(selectedRowsIds),
                          "notIncluded",
                        ),
                    )
                  }
                >
                  Not Include
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        filtersListURL="/filters_list/training_database_bnf_filters_list"
      ></DataTableDemo>

      {reqForBeneficiaryCreationForm && (
        <CreateNewBeneficiaryTraining
          open={reqForBeneficiaryCreationForm}
          onOpenChange={setReqForBeneficiaryCreationForm}
          title={"Create New Beneficiary"}
          mode="create"
        ></CreateNewBeneficiaryTraining>
      )}

      {reqForBeneficiaryEditionForm && idFeildForEditStateSetter && (
        <CreateNewBeneficiaryTraining
          open={reqForBeneficiaryEditionForm}
          onOpenChange={setReqForBeneficiaryEditionForm}
          title={"Update Beneficiary"}
          mode="edit"
          editId={idFeildForEditStateSetter}
        ></CreateNewBeneficiaryTraining>
      )}

      {openTrainingSelectorDialog && (
        <TrainingSelectorDialog
          open={openTrainingSelectorDialog}
          onOpenChange={setOpenTrainingSelectorDialog}
          ids={Object.keys(selectedRowsIds)}
        ></TrainingSelectorDialog>
      )}
    </div>
  );
};

export default withPermission(TrainingDatabasePage, [
  "Training.create",
  "Training.edit",
  "Training.view",
  "Training.delete",
  "Training.assign_training",
  "Training_database.download_excel_report",
]);
