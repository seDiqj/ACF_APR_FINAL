"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import SubHeader from "@/components/global/SubHeader";
import { Button } from "@/components/ui/button";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { useEffect, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentFormType } from "@/types/Types";
import { useParentContext } from "@/contexts/ParentContext";
import { useParams } from "next/navigation";
import AssessmentScoreForm from "@/components/global/AssessmentScoreForm";
import { IsIdFeild } from "@/constants/Constants";
import { Edit, Eye, Trash } from "lucide-react";
import { AxiosError, AxiosResponse } from "axios";
import { AssessmentDeleteMessage } from "@/constants/ConfirmationModelsTexts";
import ChromeTabs from "@/app/(main)/projects/Components/ChromeTab";
import { withPermission } from "@/lib/withPermission";
import { Can } from "@/components/Can";

const EnactProfilePage = () => {
  const {
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    requestHandler,
    reloadFlag,
    handleReload,
  } = useParentContext();

  const { id } = useParams<{
    id: string;
  }>();

  const [reqForAddNewAssessment, setReqForAddNewAssessment] =
    useState<boolean>(false);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    number | null
  >(null);

  const [currentTab, setCurrentTab] = useState<string>("assessmentDetails");

  const [reqForAssessmentEditModel, setReqForAssessmentEditModel] =
    useState<boolean>(false);
  const [reqForAssessmentShowModel, setReqForAssessmentShowModel] =
    useState<boolean>(false);

  const [assessmentInfo, setAssessmentInfo] =
    useState<AssessmentFormType | null>(null);

  const [assessmentsData, setAssessmentsData] = useState<
    {
      id: string;
      totalScore: string;
      date: string;
    }[]
  >();

  const [projectStartDate, setProjectStartDate] = useState<string>("");
  const [projectEndDate, setProjectEndDate] = useState<string>("");

  const handleDelete = (id: string) => {
    requestHandler()
      .delete(`/enact_database/delete_assessment/${id}`)
      .then((response: AxiosResponse<any, any, any>) => {
        reqForToastAndSetMessage(response.data.message, "success");
        handleReload();
      })
      .catch((error: AxiosError<any, any>) =>
        reqForToastAndSetMessage(error.response?.data.message, "error"),
      );
  };

  useEffect(() => {
    requestHandler()
      .get(`/enact_database/show_for_profile/${id}`)
      .then((response: any) => {
        const { assessments, ...assessmentData } = response.data.data;
        setProjectStartDate(assessmentData.projectStartDate);
        setProjectEndDate(assessmentData.projectEndDate);
        delete assessmentData.projectStartDate;
        delete assessmentData.projectEndDate;
        setAssessmentInfo(assessmentData);
        setAssessmentsData(assessments);
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(error.response.data.message, "error");
      });
  }, [reloadFlag]);

  return (
    <>
      <div className="max-w-full w-full h-full p-2">
        <Navbar14 />
        <div className="flex flex-row items-center justify-start my-2">
          <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
        </div>
        <SubHeader pageTitle={"Benficiaries"}>
          <Can permission="Enact.create">
            <div className="flex flex-row items-center justify-around gap-2">
              <Button
                onClick={() =>
                  setReqForAddNewAssessment(!reqForAddNewAssessment)
                }
              >
                Add Assessment
              </Button>
            </div>
          </Can>
        </SubHeader>

        <div className="w-full ">
          <Tabs
            defaultValue="assessmentDetails"
            value={currentTab}
            onValueChange={setCurrentTab}
            className="h-full max-w-full w-full overflow-auto"
          >
            <ChromeTabs
              currentTab={currentTab}
              onCurrentTabChange={setCurrentTab}
              initialTabs={[
                {
                  value: "assessmentDetails",
                  title: "Assessment Details",
                },
                {
                  value: "assessments",
                  title: "Assessments",
                },
              ]}
            ></ChromeTabs>

            <TabsContent value="assessmentDetails" className="h-full">
              <Card className="min-h-[400px] shadow-sm border border-border w-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Assessment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    {assessmentInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(assessmentInfo).map(
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              className="flex flex-col items-start justify-around overflow-auto"
              value={"assessments"}
            >
              <Card className="min-h-[400px] shadow-sm border border-border max-h-full w-full overflow-y-auto">
                <CardContent>
                  {assessmentsData?.length == 0
                    ? Message()
                    : assessmentsData?.map((assessment, i) => {
                        return (
                          <Card
                            key={i}
                            className="flex flex-row items-center justify-between w-full px-2 mb-2"
                          >
                            <div>
                              <span>{`Assessment ${i + 1} `}</span>
                              <span className="text-gray-400">{`( ${assessment.date} )`}</span>
                              &nbsp;
                              <span className="text-gray-400">{`( ${assessment.totalScore} )`}</span>
                            </div>
                            <CardContent className="flex flex-row gap-4">
                              <Eye
                                className="cursor-pointer text-orange-500 hover:text-orange-700"
                                onClick={() => {
                                  setSelectedAssessmentId(
                                    Number(assessment.id),
                                  );
                                  setReqForAssessmentShowModel(
                                    !reqForAssessmentShowModel,
                                  );
                                }}
                                size={18}
                              ></Eye>
                              <Edit
                                className="cursor-pointer text-orange-500 hover:text-orange-700"
                                onClick={() => {
                                  setSelectedAssessmentId(
                                    Number(assessment.id),
                                  );
                                  setReqForAssessmentEditModel(
                                    !reqForAssessmentEditModel,
                                  );
                                }}
                                size={18}
                              ></Edit>
                              <Trash
                                onClick={() =>
                                  reqForConfirmationModelFunc(
                                    AssessmentDeleteMessage,
                                    () =>
                                      handleDelete(
                                        assessment.id as unknown as string,
                                      ),
                                  )
                                }
                                className="cursor-pointer text-red-500 hover:text-red-700"
                                size={18}
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {reqForAddNewAssessment && (
            <AssessmentScoreForm
              open={reqForAddNewAssessment}
              onOpenChange={setReqForAddNewAssessment}
              mode={"create"}
              dateRange={{
                startDate: projectStartDate,
                endDate: projectEndDate,
              }}
              exceptMonth={
                assessmentsData?.map((assessment) => {
                  return new Date(assessment.date).getMonth() + 1;
                }) ?? []
              }
            ></AssessmentScoreForm>
          )}
          {reqForAssessmentEditModel && selectedAssessmentId && (
            <AssessmentScoreForm
              open={reqForAssessmentEditModel}
              onOpenChange={setReqForAssessmentEditModel}
              mode={"edit"}
              assessmentId={selectedAssessmentId}
              dateRange={{
                startDate: projectStartDate,
                endDate: projectEndDate,
              }}
              exceptMonth={
                assessmentsData?.map((assessment) => {
                  return new Date(assessment.date).getMonth() + 1;
                }) ?? []
              }
            ></AssessmentScoreForm>
          )}
          {reqForAssessmentShowModel && selectedAssessmentId && (
            <AssessmentScoreForm
              open={reqForAssessmentShowModel}
              onOpenChange={setReqForAssessmentShowModel}
              mode={"show"}
              assessmentId={selectedAssessmentId}
              dateRange={{
                startDate: projectStartDate,
                endDate: projectEndDate,
              }}
              exceptMonth={
                assessmentsData?.map((assessment) => {
                  return new Date(assessment.date).getMonth() + 1;
                }) ?? []
              }
            ></AssessmentScoreForm>
          )}
        </div>
      </div>
    </>
  );
};

const Message = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-center text-center">
        No assessments was found !
      </div>
    </>
  );
};

export default withPermission(EnactProfilePage, "Enact.view");
