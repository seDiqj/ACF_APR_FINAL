type Indicator = {
  id: string | null;
  outputId: string | null;
  outputRef: string;
  indicator: string;
  indicatorRef: string;
  target: number;
  status: string;
  database: string;
  type: string | null;
  provinces: {
    province: string;
    target: number;
    councilorCount: number;
  }[];
  dessaggregationType: "session" | "indevidual" | "enact" | string;
  description: string;
  subIndicator: {
    id: string | null;
    indicatorRef: string;
    name: string;
    target: number;
    dessaggregationType: string;
    type: null | string;
    provinces: {
      province: string;
      target: number;
      councilorCount: number;
    }[];
  } | null;
};

type Output = { name: string; indicators: Indicator_[] };

type Outcome = { name: string; outputs: Output[] };

type Disaggregation = { name: string; target: number };

type Indicator_ = {
  code: string;
  name: string;
  disaggregation: Disaggregation[];
};

type Project = {
  id: string | null;
  projectCode: string;
  projectTitle: string;
  projectGoal: string;
  projectDonor: string;
  startDate: string;
  endDate: string;
  status: string;
  projectManager: string;
  provinces: string[];
  thematicSector: string[];
  reportingPeriod: string;
  reportingDate: string;
  aprStatus: string;
  description: string;
};