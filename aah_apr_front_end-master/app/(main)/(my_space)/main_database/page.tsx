"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import MainDatabaseBeneficiaryForm from "@/components/global/MainDatabaseBeneficiaryCreationForm";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { useParentContext } from "@/contexts/ParentContext";
import { mainDatabaseAndKitDatabaseBeneficiaryColumns } from "@/definitions/DataTableColumnsDefinitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, Share2, ToggleRight } from "lucide-react";
import { Can } from "@/components/Can";
import MainDatabaseBeneficiaryUpdateForm from "@/components/global/MainDatabaseBeneficiaryUpdateForm";
import { withPermission } from "@/lib/withPermission";
import {
  ChangeAprIncludedStatusButtonMessage,
  ChangeAprNotIncludedStatusButtonMessage,
} from "@/constants/ConfirmationModelsTexts";
import RefferalIndicatorSelector from "@/components/global/RefferalIndicatorSelector";
import ProgramAndIndicatorSelector from "@/components/global/ProgramSelector";
import { MAIN_DATABASE_BENEFICIARY_FILTERS_LIST_URL } from "@/constants/FilterListURLS";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MainDatabasePage = () => {
  const { changeBeneficairyAprIncludedStatus, reqForConfirmationModelFunc } =
    useParentContext();

  const router = useRouter();

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  let [idFeildForShowStateSetter, setIdFeildForShowStateSetter] = useState<
    number | null
  >(null);

  const [selectedRowsIds, setSelectedRows] = useState<{}>({});

  const [reqForBeneficiaryCreationForm, setReqForBeneficiaryCreationForm] =
    useState<boolean>(false);

  const [reqForBeneficiaryEditionForm, setReqForBeneficiaryEditionForm] =
    useState<boolean>(false);

  const [reqForProgramSelector, setReqForProgramSelector] =
    useState<boolean>(false);

  const [
    reqForRefferalIndicatorSelectorForm,
    setReqForRefferalIndicatorSelectorForm,
  ] = useState<boolean>(false);

  const openBeneficiaryProfile = (value: boolean, id: number) => {
    router.push(`main_database/beneficiary_profile/${id}`);
  };

  useEffect(() => {
    if (idFeildForShowStateSetter)
      openBeneficiaryProfile(true, idFeildForShowStateSetter);
  }, [idFeildForShowStateSetter]);

  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Benficiaries"}>
          <div className="flex flex-row items-center justify-around gap-2">
            <Can permission="Maindatabase.view">
              <Button onClick={() => router.push("/main_database/programs")}>
                Programs
              </Button>
            </Can>
            <Can permission="Maindatabase.create">
              <Button
                onClick={() =>
                  setReqForBeneficiaryCreationForm(
                    !reqForBeneficiaryCreationForm,
                  )
                }
              >
                Create New Benficiary
              </Button>
            </Can>
          </div>
        </SubHeader>
        <DataTableDemo
          columns={mainDatabaseAndKitDatabaseBeneficiaryColumns}
          indexUrl="/main_db/beneficiaries"
          deleteUrl="main_db/delete_beneficiaries"
          searchableColumn="name"
          deleteBtnPermission="Maindatabase.delete"
          editBtnPermission="Maindatabase.edit"
          viewPermission="Maindatabase.view"
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          editModelOpenerStateSetter={setReqForBeneficiaryEditionForm}
          idFeildForShowStateSetter={setIdFeildForShowStateSetter}
          selectedRowsIdsStateSetter={setSelectedRows}
          showModelOpenerStateSetter={() => {}}
          injectedElement={
            <div className="flex flex-row items-center justify-end gap-2">
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
              <Button
                onClick={() => setReqForProgramSelector(true)}
                variant="outline"
                title="Add beneficiary to kit list"
              >
                <Boxes />
              </Button>
              <Button
                onClick={() => setReqForRefferalIndicatorSelectorForm(true)}
                variant="outline"
                title="Send Beneficiary to referral"
              >
                <Share2 />
              </Button>
            </div>
          }
          filtersListURL={MAIN_DATABASE_BENEFICIARY_FILTERS_LIST_URL}
        ></DataTableDemo>
        {reqForBeneficiaryCreationForm && (
          <MainDatabaseBeneficiaryForm
            title={"Create new Beneficiary"}
            open={reqForBeneficiaryCreationForm}
            onOpenChange={setReqForBeneficiaryCreationForm}
          ></MainDatabaseBeneficiaryForm>
        )}
        {reqForBeneficiaryEditionForm && (
          <MainDatabaseBeneficiaryUpdateForm
            open={reqForBeneficiaryEditionForm}
            onOpenChange={setReqForBeneficiaryEditionForm}
            beneficiaryId={idFeildForEditStateSetter as unknown as string}
          ></MainDatabaseBeneficiaryUpdateForm>
        )}
        {reqForRefferalIndicatorSelectorForm && (
          <RefferalIndicatorSelector
            open={reqForRefferalIndicatorSelectorForm}
            onOpenChange={setReqForRefferalIndicatorSelectorForm}
            ids={selectedRowsIds}
          ></RefferalIndicatorSelector>
        )}
        {reqForProgramSelector && (
          <ProgramAndIndicatorSelector
            open={reqForProgramSelector}
            onOpenChange={setReqForProgramSelector}
            ids={selectedRowsIds}
          ></ProgramAndIndicatorSelector>
        )}
      </div>
    </>
  );
};

export default withPermission(MainDatabasePage, [
  "Maindatabase.create",
  "Maindatabase.view",
  "Maindatabase.edit",
  "Maindatabase.delete",
]);
