"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { useState } from "react";
import { roleColumns } from "@/definitions/DataTableColumnsDefinitions";
import RoleForm from "@/components/global/RoleForm";
import { Can } from "@/components/Can";
import { withPermission } from "@/lib/withPermission";

const RolesPage = () => {
  let [reqForRoleShowForm, setReqForRoleShowForm] = useState<boolean>(false);

  let [reqForRoleCreationForm, setReqForRoleCreationForm] =
    useState<boolean>(false);

  let [reqForRoleUpdateForm, setReqForRoleUpdateForm] =
    useState<boolean>(false);

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  let [idFeildForShowStateSetter, setIdFeildForShowStateSetter] = useState<
    number | null
  >(null);

  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Roles"}>
          <Can permission="Create Role">
            <Button onClick={() => setReqForRoleCreationForm(true)}>
              Create New Role
            </Button>
          </Can>
        </SubHeader>
        <DataTableDemo
          columns={roleColumns}
          indexUrl="/user_mng/roles"
          deleteUrl="/user_mng/delete_role"
          searchableColumn="Name"
          deleteBtnPermission="Delete Role"
          editBtnPermission="Edit Role"
          viewPermission="View Role"
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          editModelOpenerStateSetter={() => setReqForRoleUpdateForm(true)}
          idFeildForShowStateSetter={setIdFeildForShowStateSetter}
          showModelOpenerStateSetter={() => setReqForRoleShowForm(true)}
          filtersListURL="/filters_list/roles_filters_list"
        ></DataTableDemo>

        {/* For Creation */}
        {reqForRoleCreationForm && (
          <RoleForm
            open={reqForRoleCreationForm}
            openStateSetter={setReqForRoleCreationForm}
            mode={"create"}
          ></RoleForm>
        )}
        {/* For Editing */}
        {reqForRoleUpdateForm && (
          <RoleForm
            open={reqForRoleUpdateForm}
            openStateSetter={setReqForRoleUpdateForm}
            mode={"edit"}
            idFeildForEditStateSetter={idFeildForEditStateSetter}
          ></RoleForm>
        )}
        {/* For show */}
        {reqForRoleShowForm && (
          <RoleForm
            open={reqForRoleShowForm}
            openStateSetter={setReqForRoleShowForm}
            mode={"show"}
            idFeildForEditStateSetter={idFeildForShowStateSetter}
          ></RoleForm>
        )}
      </div>
    </>
  );
};

export default withPermission(RolesPage, [
  "List Role",
  "Create Role",
  "Edit Role",
  "View Role",
  "Delete Role",
  "Export Role",
]);
