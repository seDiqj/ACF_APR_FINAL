"use client";

import { Can } from "@/components/Can";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import KitForm from "@/components/global/KitForm";
import DataTableDemo from "@/components/global/MulitSelectTable";
import SubHeader from "@/components/global/SubHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useParentContext } from "@/contexts/ParentContext";
import { beneficiaryKitListColumns } from "@/definitions/DataTableColumnsDefinitions";
import { KitDatabaseBeneficiaryProfileInterface } from "@/interfaces/Interfaces";
import { IsANullValue, IsIdFeild } from "@/constants/Constants";
import { KitDatabaseBeneficiaryKitsTableFiltersList } from "@/constants/FiltersList";
import { withPermission } from "@/lib/withPermission";
import {
  KitDatabaseBeneficiaryProfileInfoType,
  MainDatabaseProgram,
} from "@/types/Types";
import { use, useEffect, useState } from "react";
import ChromeTabs from "@/app/(main)/projects/Components/ChromeTab";

const KitDbBeneficiaryProfilePage: React.FC<
  KitDatabaseBeneficiaryProfileInterface
> = (params: KitDatabaseBeneficiaryProfileInterface) => {
  const { id } = use(params.params);

  const { reqForToastAndSetMessage, requestHandler } = useParentContext();

  const [currentTab, setCurrentTab] = useState<string>("beneficiaryInfo");

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

  const [beneficiaryInfo, setBeneficiaryInfo] =
    useState<KitDatabaseBeneficiaryProfileInfoType>();

  const [programInfo, setProgramInfo] = useState<MainDatabaseProgram[]>();

  useEffect(() => {
    // Fitching Beneficiary info.
    requestHandler()
      .get(`/kit_db/beneficiary/${id}`)
      .then((response: any) => {
        const { programs, ...benefciaryDetails } = response.data.data;
        if (response.data.status) setBeneficiaryInfo(benefciaryDetails);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );

    // Fitching Program Info.
    requestHandler()
      .get(`kit_db/program/${id}`)
      .then((response: any) => {
        if (response.data.status) setProgramInfo(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  }, []);

  return (
    <>
      <div className="w-full h-full p-2">
        <Navbar14></Navbar14>
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Beneficiary Profile"}>
          <Can permission="Kit.assign">
            <div>
              <Button
                onClick={() => setReqForKitCreationForm(!reqForKitCreationForm)}
              >
                Add Kit
              </Button>
            </div>
          </Can>
        </SubHeader>

        {/* Main Content */}
        <div className="flex flex-1 h-[440px] w-full flex-col gap-6">
          <Tabs
            defaultValue="beneficiaryInfo"
            value={currentTab}
            className="h-full"
          >
            <ChromeTabs
              currentTab={currentTab}
              onCurrentTabChange={setCurrentTab}
              initialTabs={[
                {
                  value: "beneficiaryInfo",
                  title: "Beneficiary Info",
                },
                {
                  value: "kit",
                  title: "Kit",
                },
              ]}
            ></ChromeTabs>

            {/* Beneficiary Info */}
            <TabsContent value="beneficiaryInfo" className="h-full">
              <Card className="h-full flex flex-col">
                <CardContent className="overflow-auto">
                  <div className="flex flex-col gap-2 items-start justify-around w-full">
                    {/* Beneficiary information */}
                    <div className="flex flex-col gap-2 w-full">
                      <Label>Beneficiary Information</Label>
                      <div className="">
                        {beneficiaryInfo ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(beneficiaryInfo).map(
                              ([key, value], index) => {
                                if (IsIdFeild(key) || IsANullValue(value))
                                  return;
                                return (
                                  <div
                                    key={index}
                                    className="flex flex-col rounded-xl border p-3 transition-all hover:shadow-sm"
                                  >
                                    <span className="text-xs font-medium uppercase opacity-70 tracking-wide">
                                      {key.replace(/([A-Z])/g, " $1")}
                                    </span>
                                    <span className="text-sm font-semibold truncate">
                                      {value?.toString() || "-"}
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-[56px] w-full rounded-xl animate-pulse bg-muted/30"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <Label>Program Information</Label>
                      <div>
                        {programInfo ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {programInfo.map((programInfo) =>
                              Object.entries(programInfo).map(
                                ([key, value], index) => {
                                  if (IsIdFeild(key)) return;
                                  return (
                                    <div
                                      key={index}
                                      className="flex flex-col rounded-xl border p-3 transition-all hover:shadow-sm"
                                    >
                                      <span className="text-xs font-medium uppercase opacity-70 tracking-wide">
                                        {key.replace(/([A-Z])/g, " $1")}
                                      </span>
                                      <span className="text-sm font-semibold truncate">
                                        {value?.toString() || "-"}
                                      </span>
                                    </div>
                                  );
                                },
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-[56px] w-full rounded-xl animate-pulse bg-muted/30"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* kit */}
            <TabsContent value="kit" className="h-full">
              <Card className="relative h-full flex flex-col">
                <CardContent className="flex flex-col gap-4 overflow-auto"></CardContent>
                <DataTableDemo
                  columns={beneficiaryKitListColumns}
                  indexUrl={`/kit_db/bnf_kits/${id}`}
                  deleteUrl={`/kit_db/delete_kit_from_beneficiary/${id}`}
                  filtersListURL="/filters_list/kit_list_filters_list"
                  deleteBtnPermission="Kit.delete"
                  editBtnPermission="Kit.edit"
                  viewPermission="Kit.view"
                  searchableColumn="kit"
                  idFeildForEditStateSetter={setIdFeildForEditStateSetter}
                  editModelOpenerStateSetter={setReqForKitEditionForm}
                  idFeildForShowStateSetter={setIdFeildForShowStateSetter}
                  showModelOpenerStateSetter={setReqForKitShowForm}
                ></DataTableDemo>
                <CardFooter className="flex flex-row w-full gap-2 items-center justify-end"></CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {reqForKitCreationForm && (
          <KitForm
            open={reqForKitCreationForm}
            onOpenChange={setReqForKitCreationForm}
            mode={"create"}
          ></KitForm>
        )}

        {reqForKitEditionForm && idFeildForEditStateSetter && (
          <KitForm
            open={reqForKitEditionForm}
            onOpenChange={setReqForKitEditionForm}
            mode={"edit"}
            kitId={idFeildForEditStateSetter as unknown as number}
          ></KitForm>
        )}

        {reqForKitShowForm && idFeildForShowStateSetter && (
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

export default withPermission(KitDbBeneficiaryProfilePage, "Kit.view");
