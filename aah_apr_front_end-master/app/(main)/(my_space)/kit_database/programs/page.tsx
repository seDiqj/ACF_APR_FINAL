"use client";

import { Can } from "@/components/Can";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import CreateNewProgramKit from "@/components/global/CreateNewProgramKit";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { mainDatabaseAndKitDatabaseProgramColumns } from "@/definitions/DataTableColumnsDefinitions";
import { useState } from "react";
import { withPermission } from "@/lib/withPermission";

const KitDatabaseProgramsPage = () => {
  // State for opening and closing the program create form model.
  const [open, setOpen] = useState<boolean>(false);

  // State for opening and closing the program edit form model.
  const [openEditMode, setOpenEditMode] = useState<boolean>(false);

  // State for opening and closing the program show form model.
  const [openShowMode, setOpenShowMode] = useState<boolean>(false);

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
        <SubHeader pageTitle={"Kit Database Programs"}>
          <Can permission={"Kit.create"}>
            <div className="flex flex-row items-center justify-around gap-2">
              <Button onClick={() => setOpen(!open)}>Create New Program</Button>
            </div>
          </Can>
        </SubHeader>
        <DataTableDemo
          columns={mainDatabaseAndKitDatabaseProgramColumns}
          indexUrl="/global/programs/kit_database"
          deleteUrl="/global/delete_programs"
          searchableColumn="Program Name"
          deleteBtnPermission="Kit.delete"
          editBtnPermission="Kit.edit"
          viewPermission="Kit.view"
          idFeildForEditStateSetter={setIdFeildForEditStateSetter}
          editModelOpenerStateSetter={setOpenEditMode}
          idFeildForShowStateSetter={setIdFeildForShowStateSetter}
          showModelOpenerStateSetter={setOpenShowMode}
          filtersListURL="/filters_list/kit_database_programs_filters_list"
        ></DataTableDemo>

        {/* Program create form */}
        {open && (
          <CreateNewProgramKit
            open={open}
            onOpenChange={setOpen}
            mode="create"
          ></CreateNewProgramKit>
        )}
        {openEditMode && idFeildForEditStateSetter !== null && (
          <CreateNewProgramKit
            open={openEditMode}
            onOpenChange={setOpenEditMode}
            mode="edit"
            programId={idFeildForEditStateSetter}
          />
        )}

        {openShowMode && idFeildForShowStateSetter !== null && (
          <CreateNewProgramKit
            open={openShowMode}
            onOpenChange={setOpenShowMode}
            mode="show"
            programId={idFeildForShowStateSetter}
          />
        )}
      </div>
    </>
  );
};

export default withPermission(KitDatabaseProgramsPage, "Kit.view");
