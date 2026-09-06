"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { mainDatabaseAndKitDatabaseBeneficiaryColumns } from "@/definitions/DataTableColumnsDefinitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BeneficiaryCreateCD from "@/components/global/BeneficiaryCreateCD";
import { Plus } from "lucide-react";
import CommunityDialogueSelector from "@/components/global/CommunityDialogSelector";
import BeneficiaryUpdateCD from "@/components/global/BeneficiaryUpdateFormCd";
import { withPermission } from "@/lib/withPermission";
import { Can } from "@/components/Can";
import { useParentContext } from "@/contexts/ParentContext";
import {
  ChangeAprIncludedStatusButtonMessage,
  ChangeAprNotIncludedStatusButtonMessage,
} from "@/constants/ConfirmationModelsTexts";
import { ToggleRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CommunityDialogDatabasePage = () => {
  const { reqForConfirmationModelFunc, changeBeneficairyAprIncludedStatus } =
    useParentContext();

  const router = useRouter();

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  let [idFeildForShowStateSetter, setIdFeildForShowStateSetter] = useState<
    number | null
  >(null);

  const [reqForBeneficiaryCreationForm, setReqForBeneficiaryCreationForm] =
    useState<boolean>(false);

  const [reqForBeneficiaryEditionForm, setReqForBeneficiaryEditionForm] =
    useState<boolean>(false);

  const [reqForCommunityDialogueSelector, setReqForCommunityDialogueSelector] =
    useState<boolean>(false);

  const [selectedRowsIds, setSelectedRows] = useState<{}>({});

  const openBeneficiaryProfile = (value: boolean, id: number) => {
    router.push(`/community_dialogue_database/beneficiary_profile/${id}`);
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
            <Can permission="Dialogue.view">
              <Button
                onClick={() =>
                  router.push(
                    "/community_dialogue_database/community_dialogues",
                  )
                }
              >
                Community Dialogues
              </Button>
            </Can>
            {
              <Can permission="Dialogue.create_beneficiary">
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
            }
          </div>
        </SubHeader>
        <DataTableDemo
          columns={mainDatabaseAndKitDatabaseBeneficiaryColumns}
          indexUrl="/community_dialogue_db/beneficiaries"
          deleteUrl="community_dialogue_db/delete_beneficiaries"
          searchableColumn="Name"
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          editModelOpenerStateSetter={setReqForBeneficiaryEditionForm}
          idFeildForShowStateSetter={setIdFeildForShowStateSetter}
          selectedRowsIdsStateSetter={setSelectedRows}
          showModelOpenerStateSetter={() => {}}
          injectedElement={
            <div className="flex flex-row items-center justify-end gap-1">
              {/* <Can permission="'Dialogue.assign'"> */}
                <Button
                  onClick={() =>
                    setReqForCommunityDialogueSelector(
                      !reqForCommunityDialogueSelector,
                    )
                  }
                  title="Add Community Dialogue"
                  variant={"outline"}
                >
                  <Plus></Plus>
                </Button>
              {/* </Can> */}
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
          viewPermission="Dialogue.view"
          editBtnPermission="Dialogue.edit"
          deleteBtnPermission="Dialogue.delete"
          filtersListURL="/filters_list/cd_database_bnf_filters_list"
        ></DataTableDemo>

        {reqForBeneficiaryCreationForm && (
          <BeneficiaryCreateCD
            open={reqForBeneficiaryCreationForm}
            onOpenChange={setReqForBeneficiaryCreationForm}
          ></BeneficiaryCreateCD>
        )}

        {reqForBeneficiaryEditionForm && idFeildForEditStateSetter && (
          <BeneficiaryUpdateCD
            open={reqForBeneficiaryEditionForm}
            onOpenChange={setReqForBeneficiaryEditionForm}
            beneficiaryId={idFeildForEditStateSetter}
          ></BeneficiaryUpdateCD>
        )}

        {reqForCommunityDialogueSelector && (
          <CommunityDialogueSelector
            open={reqForCommunityDialogueSelector}
            onOpenChange={setReqForCommunityDialogueSelector}
            ids={Object.keys(selectedRowsIds)}
          ></CommunityDialogueSelector>
        )}
      </div>
    </>
  );
};

export default withPermission(CommunityDialogDatabasePage, [
  "Dialogue.view",
  "Dialogue.create",
  "Dialogue.edit",
  "Dialogue.delete",
  "Dialogue.assign",
  "Dialogue.create_beneficiary",
  "Community_dailogue.download_excel_report",
]);
