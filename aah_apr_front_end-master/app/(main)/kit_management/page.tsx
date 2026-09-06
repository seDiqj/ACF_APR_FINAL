"use client";

import { Can } from "@/components/Can";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { KitTableColumns } from "@/definitions/DataTableColumnsDefinitions";
import { useState } from "react";
import KitForm from "./components/KitForm";
import { withPermission } from "@/lib/withPermission";

const KitManagementPage = () => {
  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  let [idFeildForShowStateSetter, setIdFeildForShowStateSetter] = useState<
    number | null
  >(null);

  const [reqForKitCreationForm, setReqForKitCreationForm] =
    useState<boolean>(false);
  const [reqForKitEditionForm, setReqForKitEditionForm] =
    useState<boolean>(false);
  const [reqForKitShowForm, setReqForKitShowForm] = useState<boolean>(false);

  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Kit Management"}>
          <Can permission="Kit.create">
            <Button onClick={() => setReqForKitCreationForm(true)}>
              Create New Kit
            </Button>
          </Can>
        </SubHeader>

        <DataTableDemo
          columns={KitTableColumns}
          indexUrl="/kit_db/kit_mng"
          deleteUrl="/kit_db/kit_mng/delete_kits"
          searchableColumn="Name"
          deleteBtnPermission="Kit.delete"
          editBtnPermission="Kit.edit"
          viewPermission="Kit.view"
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          editModelOpenerStateSetter={setReqForKitEditionForm}
          idFeildForShowStateSetter={setIdFeildForShowStateSetter}
          showModelOpenerStateSetter={setReqForKitShowForm}
        ></DataTableDemo>

        {reqForKitCreationForm && (
          <KitForm
            open={reqForKitCreationForm}
            onOpenChange={setReqForKitCreationForm}
            mode={"create"}
          ></KitForm>
        )}
        {reqForKitEditionForm && (
          <KitForm
            open={reqForKitEditionForm}
            onOpenChange={setReqForKitEditionForm}
            mode={"edit"}
            kitId={idFeildForEditStateSetter as unknown as number}
          ></KitForm>
        )}
        {reqForKitShowForm && (
          <KitForm
            open={reqForKitShowForm}
            onOpenChange={setReqForKitShowForm}
            mode={"show"}
            kitId={idFeildForShowStateSetter as unknown as number}
          ></KitForm>
        )}
      </div>
    </>
  );
};

export default withPermission(KitManagementPage, [
  "Kit.create",
  "Kit.view",
  "Kit.edit",
  "Kit.delete",
]);
