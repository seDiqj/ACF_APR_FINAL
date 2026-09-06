"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";

import BeneProfileTabs from "@/components/ui/shadcn-io/BeneProfileTab";
import { withPermission } from "@/lib/withPermission";

const MainDatabasePage = () => {
  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Benficiary Profile"}></SubHeader>
        <BeneProfileTabs></BeneProfileTabs>
      </div>
    </>
  );
};

export default withPermission(MainDatabasePage, "Dialogue.view");
