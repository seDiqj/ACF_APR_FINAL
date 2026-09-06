"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";
import React, { createContext, useContext } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectForm from "../../Components/ProjectForm";
import OutputForm from "../../Components/OutputForm";
import DessaggregationForm from "../../Components/DessaggregationForm";
import AprFinalizationSubPage from "../../Components/AprFinalizationSubPage";
import { Dessaggregation, Indicator, Isp3, Outcome, Output } from "../../types/Types";
import OutcomeForm from "../../Components/OutcomeForm";
import AprLogsSubPage from "../../Components/AprLogsSubPage";
import IndicatorForm from "../../Components/IndicatorForm";
import Isp3SubPage from "../../Components/Isp3SubPage";
import { IndicatorModel } from "@/components/global/IndicatorEditModel";
import OutcomeModel from "@/components/global/OutcomeEditModel";
import OutputModel from "@/components/global/OutputEditModel";
import { Isp3Default } from "@/constants/FormsDefaultValues";
import ChromeTabs from "../../Components/ChromeTab";
import { IsNoOutcome } from "@/constants/Constants";
import MonitoringTablePage from "@/components/global/ExcelSheet";
import StringHelper from "@/helpers/StringHelpers/StringHelper";

const EditProjectPage = () => {
  const { id } = useParams();

  const { reqForToastAndSetMessage, requestHandler } = useParentContext();

  const [formData, setFormData] = useState<Project>({
    id: null,
    projectCode: "",
    projectTitle: "",
    projectGoal: "",
    projectDonor: "",
    startDate: "",
    endDate: "",
    status: "active",
    projectManager: "",
    provinces: [],
    thematicSector: [],
    reportingPeriod: "",
    reportingDate: "",
    aprStatus: "NotCreatedYet",
    description: "",
  });

  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  const [outputs, setOutputs] = useState<Output[]>([]);

  const [indicators, setIndicators] = useState<Indicator[]>([]);

  const [dessaggregations, setDessaggregations] = useState<Dessaggregation[]>(
    []
  );

  const [isp3, setIsp3] = useState<Isp3[]>(Isp3Default());

  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectProvinces, setProjectProvinces] = useState<string[]>(["kabul"]);
  const [projectGoal, setProjectGoal] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("project");

  const [actionLogs, setActionLogs] = useState([]);

  const [logs, setLogs] = useState<
    {
      action: string;
      userName: string;
      projectCode: string;
      result: string;
      date: string;
      comment: string;
    }[]
  >([]);

  const [projectAprStatus, setProjectAprStatus] =
    useState<string>("notCreatedYet");

  // Fech project data
  useEffect(() => {
    requestHandler()
      .get(`/projects/${id}`)
      .then((response: any) => {
        const { outcomesInfo, ...project } = response.data.data;
        project["provinces"] = project.provinces.map(
          (province: { id: string; name: string; pivo: any }) => province.name
        );
        setFormData(project);
        setProjectProvinces(project["provinces"]);
        setOutcomes(
          outcomesInfo.map((outcome: any) => {
            const { outputs, ...outcomeInfo } = outcome;

            return outcomeInfo;
          })
        );
        setOutputs(
          outcomesInfo.flatMap((outcome: any) => {
            const outputs = outcome.outputs.flatMap((output: any) => {
              const { indicators, ...outputInfo } = output;

              outputInfo["outcomeId"] = outcome.id;
              outputInfo["outcomeRef"] = outcome.outcomeRef;

              return outputInfo;
            });

            return outputs;
          })
        );
        setIndicators(
          outcomesInfo.flatMap((outcome: any) => {
            const indicators = outcome.outputs.flatMap((output: any) =>
              output.indicators.flatMap((indicator: any) => {
                const { dessaggregations, ...indicatorInfo } = indicator;

                indicatorInfo["outputId"] = output.id;
                indicatorInfo["outputRef"] = output.outputRef;
                const subIndicator = output.indicators.find(
                  (indicator: Indicator) =>
                    indicator.parent_indicator == indicatorInfo.id
                );

                if (subIndicator) {
                  indicatorInfo.subIndicator = {
                    id: subIndicator.id,
                    indicatorRef: subIndicator.indicatorRef,
                    name: subIndicator.indicator,
                    target: subIndicator.target,
                    dessaggregationType: subIndicator.dessaggregationType,
                    type: subIndicator.type,
                    provinces: subIndicator.provinces,
                  };
                }

                return indicatorInfo;
              })
            );

            return indicators;
          })
        );
        setDessaggregations(
          outcomesInfo.flatMap((outcome: any) => {
            const dessaggregations = outcome.outputs.flatMap((output: any) =>
              output.indicators.flatMap((indicator: any) =>
                indicator.dessaggregations.flatMap((dessaggregation: any) => {
                  dessaggregation["indicatorId"] = dessaggregation.indicator_id;

                  return dessaggregation;
                })
              )
            );
            return dessaggregations;
          })
        );
        setProjectAprStatus(project.aprStatus);
        setProjectId(project.id);
        const newIsp3 = [...isp3];
        outcomesInfo.forEach((outcome: any) => {
          outcome.outputs.forEach((output: any) => {
            output.indicators.forEach((indicator: any) => {
              indicator.isp3.forEach((isp: any) => {
                const index = newIsp3.findIndex(
                  (i) => i.name === isp.description
                );
                if (index !== -1) {
                  newIsp3[index] = {
                    ...newIsp3[index],
                    indicators: [
                      ...newIsp3[index].indicators,
                      isp.pivot.indicator_id,
                    ],
                  };
                }
              });
            });
          });
        });

        setIsp3(newIsp3);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message)
      );
  }, []);

  const [reqForOutcomeForm, setReqForOutcomeForm] = useState(false);
  const [reqForOutputForm, setReqForOutputForm] = useState(false);
  const [reqForIndicatorForm, setReqForIndicatorForm] = useState(false);

  const handleDelete = (url: string, id: string | null) => {
    if (!id) return;

    requestHandler()
      .delete(url + `/${id}`)
      .then((response: any) => reqForToastAndSetMessage(response.data.message))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message)
      );
  };

  return (
    <>
      <ComponentContext.Provider
        value={{
          formData,
          setFormData,
          outcomes,
          setOutcomes,
          outputs,
          setOutputs,
          indicators,
          setIndicators,
          dessaggregations,
          setDessaggregations,
          projectId,
          setProjectId,
          projectGoal,
          setProjectGoal,
          projectProvinces,
          setProjectProvinces,
          currentTab,
          setCurrentTab,
          logs,
          setLogs,
          projectAprStatus,
          setProjectAprStatus,
          isp3,
          setIsp3,
          actionLogs,
          setActionLogs,
          handleDelete,
        }}
      >
        <div className="w-full h-full p-2">
          <Navbar14 />
          <div className="flex flex-row items-center justify-start my-2">
            <BreadcrumbWithCustomSeparator></BreadcrumbWithCustomSeparator>
          </div>
          <SubHeader pageTitle={"Edit Project"}></SubHeader>
          <div className="flex flex-1 h-[440px] w-full flex-col gap-6">
            <Tabs
              defaultValue="project"
              onValueChange={(value: string) => setCurrentTab(value)}
              value={currentTab}
              className="h-full"
            >
              <ChromeTabs
                currentTab={currentTab}
                onCurrentTabChange={setCurrentTab}
                initialTabs={[
                  {
                    value: "project",
                    title: "Project",
                    hoverTitle: `Project status: ${formData.status}`,
                  },
                  {
                    value: "outcome",
                    title: "Outcome",
                    hoverTitle: `Number of outcomes: ${
                      outcomes.filter((outcome) => !IsNoOutcome(outcome)).length
                    }`,
                  },
                  {
                    value: "output",
                    title: "Output",
                    hoverTitle: `Number of outputs: ${outputs.length}`,
                  },
                  {
                    value: "indicator",
                    title: "Indicator",
                    hoverTitle: `Number of indicators: ${indicators.length}`,
                  },
                  {
                    value: "dessaggregation",
                    title: "Disaggregation",
                    hoverTitle: `Number of disaggregation: ${dessaggregations.length}`,
                  },
                  {
                    value: "aprPreview",
                    title: "APR Preview",
                  },
                  {
                    value: "isp3",
                    title: "ISP3",
                  },
                  {
                    value: "finalization",
                    title: "APR Finalization",
                    hoverTitle: `Apr status: ${StringHelper.normalize(projectAprStatus)}`,
                  },
                  {
                    value: "logs",
                    title: "Activity Logs",
                  },
                ]}
              />

              {/* Project */}
              <TabsContent value="project" className="h-full">
                <ProjectForm mode="edit"></ProjectForm>
              </TabsContent>

              {/* Outcome */}
              <TabsContent value="outcome" className="h-full">
                <OutcomeForm mode="edit"></OutcomeForm>
              </TabsContent>

              {/* Output */}
              <TabsContent value="output" className="h-full">
                <OutputForm mode="edit"></OutputForm>
              </TabsContent>

              {/* Indicator */}
              <TabsContent value="indicator" className="h-full">
                <IndicatorForm mode="edit"></IndicatorForm>
              </TabsContent>

              {/* Dessaggregation */}
              <TabsContent value="dessaggregation" className="h-full">
                <DessaggregationForm mode="edit"></DessaggregationForm>
              </TabsContent>

              {/* APR preview */}
              <TabsContent value="aprPreview" className="h-full">
                <MonitoringTablePage mode="edit"></MonitoringTablePage>
              </TabsContent>

              {/* ISP3 */}
              <TabsContent value="isp3" className="h-full">
                <Isp3SubPage mode="edit"></Isp3SubPage>
              </TabsContent>

              {/* APR Finalization */}
              <TabsContent value="finalization" className="h-full">
                <AprFinalizationSubPage mode="edit"></AprFinalizationSubPage>
              </TabsContent>

              {/* APR Logs */}
              <TabsContent value="logs" className="h-full overflow-hidden">
                <AprLogsSubPage mode="edit"></AprLogsSubPage>
              </TabsContent>
            </Tabs>
          </div>

          {reqForIndicatorForm && (
            <IndicatorModel
              isOpen={reqForIndicatorForm}
              onClose={() => setReqForIndicatorForm(false)}
              mode="create"
              pageIdentifier="edit"
            />
          )}

          {reqForOutcomeForm && (
            <OutcomeModel
              isOpen={reqForOutcomeForm}
              onOpenChange={setReqForOutcomeForm}
              mode="create"
              pageIdentifier="edit"
            ></OutcomeModel>
          )}

          {reqForOutputForm && (
            <OutputModel
              isOpen={reqForOutputForm}
              onOpenChange={setReqForOutputForm}
              mode={"create"}
              pageIdentifier={"edit"}
            ></OutputModel>
          )}
        </div>
      </ComponentContext.Provider>
    </>
  );
};

export const ComponentContext = createContext<any>({});

export const useProjectEditContext = () => useContext(ComponentContext);

export default withPermission(EditProjectPage, "Project.edit");
