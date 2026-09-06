"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DataTableDemo from "@/components/global/MulitSelectTable";
import { permissionColumns } from "@/definitions/DataTableColumnsDefinitions";
import { useState } from "react";

interface AddBeneInCDProfileProps {
  title: string;
}

const AddBeneInCDProfile: React.FC<AddBeneInCDProfileProps> = ({ title }) => {
  let [reqForPermissionUpdateForm, setReqForPermissionUpdateForm] =
    useState<boolean>(false);

  let [idFeildForEditStateSetter, setIdFeildForEditStateSetter] = useState<
    number | null
  >(null);

  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 rounded-md bg-primary text-white">
          {title}
        </button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{
          maxHeight: "80vh",
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        {/* Header with centered search bar */}
        <div className="relative mb-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              List of Beneficiaries
            </DialogTitle>
          </DialogHeader>

          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 mt-1">
            <Input placeholder="Search..." className="h-8 w-60" />
          </div>
        </div>

        {/* List / Table */}
        <div className="mt-2">
          <DataTableDemo
            columns={permissionColumns}
            indexUrl="user_mng/permissions"
            deleteUrl="user_mng/delete_permissions"
            searchableColumn="name"
            idFeildForEditStateSetter={setIdFeildForEditStateSetter}
            editModelOpenerStateSetter={setReqForPermissionUpdateForm}
          ></DataTableDemo>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBeneInCDProfile;
