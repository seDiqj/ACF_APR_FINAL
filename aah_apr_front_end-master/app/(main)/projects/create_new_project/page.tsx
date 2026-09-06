"use client";

import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import MonitoringTablePage from "@/components/global/ExcelSheet";
import SubHeader from "@/components/global/SubHeader";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { withPermission } from "@/lib/withPermission";
import React, { createContext, useContext, useState } from "react";
import OutcomeForm from "../Components/OutcomeForm";
import OutputForm from "../Components/OutputForm";
import DessaggregationForm from "../Components/DessaggregationForm";
import ProjectForm from "../Components/ProjectForm";
import AprFinalizationSubPage from "../Components/AprFinalizationSubPage";
import AprLogsSubPage from "../Components/AprLogsSubPage";
import IndicatorForm from "../Components/IndicatorForm";
import Isp3SubPage from "../Components/Isp3SubPage";
import ChromeTabs from "../Components/ChromeTab";
import { useParentContext } from "@/contexts/ParentContext";
import { Isp3Default, ProjectDefault } from "@/constants/FormsDefaultValues";
import {
  Dessaggregation,
  Isp3,
  Output,
  Outcome,
  Indicator,
  Project,
} from "../types/Types";

const NewProjectPage = () => {
  const { reqForToastAndSetMessage, requestHandler } = useParentContext();

  const [formData, setFormData] = useState<Project>(ProjectDefault());
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [dessaggregations, setDessaggregations] = useState<Dessaggregation[]>(
    []
  );
  const [isp3, setIsp3] = useState<Isp3[]>(Isp3Default());
  const [projectAprStatus, setProjectAprStatus] =
    useState<string>("notCreatedYet");
  const [actionLogs, setActionLogs] = useState([]);

  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectProvinces, setProjectProvinces] = useState<string[]>(["kabul"]);
  const [projectGoal, setProjectGoal] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("project");

  const handleDelete = (url: string, id: string | null) => {
    if (!id) return;

    requestHandler()
      .delete(`${url}/${id}`)
      .then((response: any) =>
        reqForToastAndSetMessage(response.data.message, "success")
      )
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error deleting resource",
          "error"
        )
      );
  };
  return (
    <>
      <ComponentContext.Provider
        value={{
          outcomes,
          outputs,
          indicators,
          setOutcomes,
          setOutputs,
          setIndicators,
          setCurrentTab,
          projectProvinces,
          setProjectProvinces,
          projectId,
          setProjectId,
          projectGoal,
          setProjectGoal,
          dessaggregations,
          setDessaggregations,
          formData,
          setFormData,
          actionLogs,
          setActionLogs,
          projectAprStatus,
          setProjectAprStatus,
          isp3,
          setIsp3,
          handleDelete,
        }}
      >
        <div className="max-w-full h-full p-4 flex flex-col gap-4 bg-background">
          {/* نوار ابزار هدر بالایی */}
          <Navbar14 />

          {/* بردکرامب و عنوان شیک تفکیک شده بر پایه Slate */}
          <div className="flex flex-col gap-2 pt-2 border-b border-border/60 pb-3">
            <BreadcrumbWithCustomSeparator />
            <SubHeader pageTitle="Create New Project" />
          </div>

          {/* بدنه ماژولار تب‌های پروژه با قابلیت چیدمان منعطف */}
          <div className="flex flex-1 w-full flex-col min-h-[600px] overflow-hidden">
            <Tabs
              defaultValue="project"
              onValueChange={(value: string) => setCurrentTab(value)}
              value={currentTab}
              className="h-full flex flex-col gap-4 flex-1"
            >
              <ChromeTabs
                currentTab={currentTab}
                onCurrentTabChange={setCurrentTab}
                initialTabs={[
                  { value: "project", title: "Project" },
                  { value: "outcome", title: "Outcome" },
                  { value: "output", title: "Output" },
                  { value: "indicator", title: "Indicator" },
                  { value: "dessaggregation", title: "Disaggregation" },
                  { value: "isp3", title: "ISP3" },
                  { value: "finalization", title: "APR Finalization" },
                  { value: "logs", title: "Activity Logs" },
                ]}
              />

              <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                {/* Project */}
                <TabsContent
                  value="project"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <ProjectForm mode="create" />
                </TabsContent>

                {/* Outcome */}
                <TabsContent
                  value="outcome"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <OutcomeForm mode="create" />
                </TabsContent>

                {/* Output */}
                <TabsContent
                  value="output"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <OutputForm mode="create" />
                </TabsContent>

                {/* Indicator */}
                <TabsContent
                  value="indicator"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <IndicatorForm mode="create" />
                </TabsContent>

                {/* Dessaggregation */}
                <TabsContent
                  value="dessaggregation"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <DessaggregationForm mode="create" />
                </TabsContent>

                {/* ISP3 */}
                <TabsContent
                  value="isp3"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <Isp3SubPage mode="create" />
                </TabsContent>

                {/* APR Finalization */}
                <TabsContent
                  value="finalization"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <AprFinalizationSubPage mode="create" />
                </TabsContent>

                {/* APR Logs */}
                <TabsContent
                  value="logs"
                  className="h-full mt-0 focus-visible:outline-none flex-1 flex flex-col"
                >
                  <AprLogsSubPage mode="create" />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </ComponentContext.Provider>
    </>
  );
};

export const ComponentContext = createContext<any>({});
export const useProjectContext = () => useContext(ComponentContext);

export default withPermission(NewProjectPage, "Project.create");
