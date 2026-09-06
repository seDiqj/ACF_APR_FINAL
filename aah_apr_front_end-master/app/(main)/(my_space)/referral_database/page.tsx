"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { mainDatabaseAndKitDatabaseBeneficiaryColumns } from "@/definitions/DataTableColumnsDefinitions";
import { withPermission } from "@/lib/withPermission";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ReferralDatabasePage = () => {
  const router = useRouter();

  let [idFeildForShowStateSetter, setIdFeildForShowStateSetter] = useState<
    number | null
  >(null);

  const openBeneficiaryProfile = (value: boolean, id: number) => {
    router.push(`referral_database/beneficiary_profile/${id}`);
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
        <SubHeader pageTitle={"Benficiaries"}></SubHeader>
        <DataTableDemo
          columns={mainDatabaseAndKitDatabaseBeneficiaryColumns}
          indexUrl="/referral_db/beneficiaries"
          deleteUrl="/referral_db/delete_beneficiaries"
          deleteBtnPermission="Referral.delete"
          editBtnPermission="Referral.edit"
          viewPermission="Referral.view"
          searchableColumn="Name"
          idFeildForShowStateSetter={setIdFeildForShowStateSetter}
          filtersListURL="/filters_list/refferal_filters_list"
        ></DataTableDemo>
      </div>
    </>
  );
};

export default withPermission(ReferralDatabasePage, [
  "Referral.create",
  "Referral.view",
  "Referral.edit",
  "Referral.delete",
  "Export.referral excel report",
]);
