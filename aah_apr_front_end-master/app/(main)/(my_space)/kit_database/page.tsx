"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { mainDatabaseAndKitDatabaseBeneficiaryColumns } from "@/definitions/DataTableColumnsDefinitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import KitDatabaseBeneficiaryForm from "@/components/global/KitDatabaseBeneficiaryForm";
import KitDatabaseBeneficiaryUpdateForm from "@/components/global/KitDatabaseBeneficiaryUpdateForm";
import { Can } from "@/components/Can";
import { withPermission } from "@/lib/withPermission";
import { Plus, ToggleRight } from "lucide-react";
import { useParentContext } from "@/contexts/ParentContext";
import {
  ChangeAprIncludedStatusButtonMessage,
  ChangeAprNotIncludedStatusButtonMessage,
} from "@/constants/ConfirmationModelsTexts";
import KitForm from "@/components/global/KitForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const KitDatabasePage = () => {
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

  const [reqForBeneficiaryUpdateForm, setReqForBeneficiaryUpdateForm] =
    useState<boolean>(false);

  const [reqForKitForm, setReqForKitForm] = useState<boolean>(false);

  const [selectedRowsIds, setSelectedRows] = useState<{}>({});

  const openBeneficiaryProfile = (value: boolean, id: number) => {
    router.push(`kit_database/beneficiary_profile/${id}`);
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
            <Can permission="Kit.view">
              <Button onClick={() => router.push("/kit_database/programs")}>
                Programs
              </Button>
            </Can>
            <Can permission="Kit.create">
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
          indexUrl="/kit_db/beneficiaries"
          deleteUrl="kit_db/delete_beneficiaries"
          searchableColumn="name"
          deleteBtnPermission="Kit.delete"
          editBtnPermission="Kit.edit"
          viewPermission="Kit.view"
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          editModelOpenerStateSetter={setReqForBeneficiaryUpdateForm}
          idFeildForShowStateSetter={setIdFeildForShowStateSetter}
          showModelOpenerStateSetter={() => {}}
          selectedRowsIdsStateSetter={setSelectedRows}
          filtersListURL="/filters_list/kit_database_bnf_filters_list"
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
              <Can permission="Kit.assign">
                <Button
                  onClick={() => setReqForKitForm(!reqForKitForm)}
                  variant={"outline"}
                  title="Add Kit"
                >
                  <Plus></Plus>
                </Button>
              </Can>
            </div>
          }
        ></DataTableDemo>

        {/* Create new beneficiary form */}
        {reqForBeneficiaryCreationForm && (
          <KitDatabaseBeneficiaryForm
            open={reqForBeneficiaryCreationForm}
            onOpenChange={setReqForBeneficiaryCreationForm}
            title={"Create New Beneficiary"}
          ></KitDatabaseBeneficiaryForm>
        )}

        {reqForBeneficiaryUpdateForm && idFeildForEditStateSetter != null && (
          <KitDatabaseBeneficiaryUpdateForm
            open={reqForBeneficiaryUpdateForm}
            onOpenChange={setReqForBeneficiaryUpdateForm}
            beneficiaryId={idFeildForEditStateSetter as unknown as string}
            title={""}
          ></KitDatabaseBeneficiaryUpdateForm>
        )}

        {reqForKitForm && (
          <KitForm
            open={reqForKitForm}
            onOpenChange={setReqForKitForm}
            mode="select"
            ids={Object.keys(selectedRowsIds)}
          ></KitForm>
        )}
      </div>
    </>
  );
};

export default withPermission(KitDatabasePage, [
  "Kit.view",
  "Kit.create",
  "Kit.edit",
  "Kit.delete",
  "Kit.assign",
]);
