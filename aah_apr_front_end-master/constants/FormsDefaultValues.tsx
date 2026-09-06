import {
  Indicator,
  Outcome,
  Output,
  Project,
} from "@/app/(main)/projects/types/Types";
import { isp3s } from "@/app/(main)/projects/utils/OptionLists";
import {
  AssessmentFormType,
  ChapterForm,
  CommunityDialogBeneficiaryForm,
  KitDatabaseBeneficiaryFormType,
  KitDatabaseBeneficiaryUpdateFormType,
  KitFormType,
  MainDatabaseBeneficiary,
  MainDatabaseProgram,
  PsychoeducationForm,
  TrainingBenefeciaryForm,
  TrainingForm,
  MainDatabaseBeneficiaryUpdateType,
  MealToolFormType,
  ReferredByAndReferredToFormType,
  ReferralReasonFormType,
  UserType,
  BeneficiaryEvaluationType,
  CommunityDialogueFormType,
  KitDatabaseProgram,
  KitType,
} from "@/types/Types";

export const ProjectDefault: () => Project = () => ({
  id: null,
  projectCode: "",
  projectTitle: "",
  projectGoal: "",
  projectDonor: "",
  startDate: "",
  endDate: "",
  status: "planed",
  projectManager: "",
  provinces: ["kabul"],
  thematicSector: ["mhpss"],
  reportingPeriod: "",
  reportingDate: "",
  aprStatus: "NotCreatedYet",
  description: "",
});

export const OutcomeDefault: () => Outcome = () => ({
  id: null,
  outcome: "",
  outcomeRef: "",
});

export const OutputDefault: () => Output = () => ({
  id: null,
  outcomeId: "",
  output: "",
  outputRef: "",
});

export const IndicatorDefault: () => Indicator = () => ({
  id: null,
  outputId: null,
  outputRef: "",
  indicator: "",
  indicatorRef: "",
  target: 0,
  status: "notStarted",
  provinces: [],
  dessaggregationType: "indevidual",
  description: "",
  database: "",
  type: null,
  subIndicator: null,
  parentIndicator: undefined,
  parent_indicator: undefined,
});

export const Isp3Default: () => { name: string; indicators: any[] }[] = () => [
  ...isp3s.map((i) => ({
    name: i,
    indicators: [],
  })),
];

export const MainDbBeneficiaryDefault: () => MainDatabaseBeneficiary = () => ({
  id: null,
  program: "",
  beneficiaryCode: "",
  name: "",
  fatherHusbandName: "",
  gender: "",
  age: 0,
  code: "",
  childCode: "",
  childAge: 0,
  phone: "",
  householdStatus: "",
  literacyLevel: "",
  maritalStatus: "",
  disabilityType: "",
  dateOfRegistration: "",
});

export const MainDatabaseProgramDefault: () => MainDatabaseProgram = () => ({
  project_id: "",
  name: "",
  focalPoint: "",
  province: "kabul",
  district: "District 1",
  village: "",
  siteCode: "",
  healthFacilityName: "",
  interventionModality: "",
});

export const KitDatabaseProgramDefault: () => KitDatabaseProgram = () => ({
  project_id: "",
  name: "",
  focalPoint: "",
  province: "1",
  district: "1",
  village: "",
  siteCode: "",
  healthFacilityName: "",
  interventionModality: "",
});

export const PreAndPostTestsDefault: () => any = () => ({
  preTestScore: 0,
  postTestScore: 0,
  remark: "",
});

export const CommunityDialogueBeneficiaryDefault: () => CommunityDialogBeneficiaryForm =
  () => ({
    name: "",
    fatherHusbandName: "",
    age: 0,
    maritalStatus: "",
    gender: "",
    phone: "",
    nationalId: "",
    jobTitle: "",
    code: "",
    incentiveReceived: false,
    incentiveAmount: "",
    currancy: "",
    dateOfRegistration: "",
  });

export const CommunityDialogueSessionDefault: (id: string) => any = (id) => ({
  community_dialogue_id: id,
  topic: "",
  date: "",
});

export const AssessmentDefault: () => AssessmentFormType = () => ({
  project_id: "",
  indicator_id: "",
  province_id: "",
  councilorName: "",
  raterName: "",
  type: "",
  date: "",
  aprIncluded: true,
});

export const TrainingBeneficiaryDefault: () => TrainingBenefeciaryForm =
  () => ({
    name: "",
    fatherHusbandName: "",
    gender: "",
    age: 0,
    phone: "",
    email: "",
    code: "",
    participantOrganization: "",
    jobTitle: "",
    dateOfRegistration: "",
  });

export const ChapterDefault: () => ChapterForm = () => ({
  id: "",
  topic: "",
  facilitatorName: "",
  facilitatorJobTitle: "",
  startDate: "",
  endDate: "",
});

export const TrainingDefault: () => TrainingForm = () => ({
  id: "",
  project_id: "",
  province_id: "",
  district_id: "",
  trainingLocation: "",
  name: "",
  participantCatagory: "",
  aprIncluded: true,
  trainingModality: "",
  startDate: "",
  endDate: "",
  indicator_id: "",
});

export const PsychoeducationDefault: () => PsychoeducationForm = () => ({
  programInformation: {
    indicator_id: "",
    project_id: "",
    name: "",
    focalPoint: "",
    province_id: "",
    district_id: "",
    village: "",
    siteCode: "",
    healthFacilityName: "",
    interventionModality: "",
  },
  psychoeducationInformation: {
    awarenessTopic: "",
    awarenessDate: "",
    // men
    ofMenHostCommunity: "",
    ofMenIdp: "",
    ofMenRefugee: "",
    ofMenReturnee: "",
    // women
    ofWomenHostCommunity: "",
    ofWomenIdp: "",
    ofWomenRefugee: "",
    ofWomenReturnee: "",
    // boy
    ofBoyHostCommunity: "",
    ofBoyIdp: "",
    ofBoyRefugee: "",
    ofBoyReturnee: "",
    // girl
    ofGirlHostCommunity: "",
    ofGirlIdp: "",
    ofGirlRefugee: "",
    ofGirlReturnee: "",
    remark: "",
  },
});

export const KitDatabaseBeneficiaryDefault: () => KitDatabaseBeneficiaryFormType =
  () => ({
    program: "",
    indicators: [],
    dateOfRegistration: "",
    code: "",
    name: "",
    fatherHusbandName: "",
    gender: "",
    age: 0,
    maritalStatus: "",
    childCode: "",
    childAge: 0,
    phone: "",
    householdStatus: "",
    literacyLevel: "",
    disabilityType: "",
    referredForProtection: false,
  });

export const KitDatabaseBeneficiaryUpdateDefault: () => KitDatabaseBeneficiaryUpdateFormType =
  () => ({
    id: "",
    program: "",
    indicators: [],
    dateOfRegistration: "",
    code: "",
    name: "",
    fatherHusbandName: "",
    gender: "",
    age: 0,
    maritalStatus: "",
    childCode: "",
    childAge: 0,
    phone: "",
    householdStatus: "",
    literacyLevel: "",
    disabilityType: "",
    referredForProtection: false,
  });

export const KitDefault: () => KitFormType = () => ({
  kitId: "",
  destribution_date: "",
  remark: "",
  is_received: false,
});

export const KitFormDefault: () => KitType = () => ({
  name: "",
  description: "",
  status: "active",
});

export const MainDatabaseBeneficiaryUpdateDefault: () => MainDatabaseBeneficiaryUpdateType =
  () => ({
    id: "",
    program: "",
    dateOfRegistration: "",
    code: "",
    name: "",
    fatherHusbandName: "",
    gender: "",
    age: 0,
    maritalStatus: "",
    childCode: "",
    childAge: 0,
    phone: "",
    householdStatus: "",
    literacyLevel: "",
    disabilityType: "",
  });

export const MealToolDefault: (id: string) => MealToolFormType = (id) => ({
  beneficiary_id: id,
  type: "",
  baselineDate: "",
  endlineDate: "",
  baselineTotalScore: "",
  endlineTotalScore: "",
  improvementPercentage: "",
  isBaselineActive: false,
  isEndlineActive: false,
  evaluation: "",
});

export const ReferredByAndReferredToDefault: () => ReferredByAndReferredToFormType =
  () => ({
    name: "",
    agency: "",
    phone: "",
    email: "",
    address: "",
  });

export const ReasoneOfReferralDefault: () => ReferralReasonFormType = () => ({
  mentalHealthAlert: "",
  selfHarm: "",
  suicideIdeation: "",
  undiagnosedPsychosis: "",
});

export const ReferralFormPersonalInfoDefault: () => any = () => ({
  nationalId: "",
  currentAddress: "",
  spokenLanguage: [],
});

export const UserDefault: () => UserType = () => ({
  name: "",
  title: "",
  email: "",
  password: "",
  email_verified_at: "",
  photo_path: "",
  department: "",
  status: "active",
  role: "",
});

export const BeneficiaryEvaluationDefault: () => BeneficiaryEvaluationType =
  () => ({
    date: "",
    clientSessionEvaluation: [],
    otherClientSessionEvaluation: "",
    clientSatisfaction: "neutral",
    satisfactionDate: "",
    dischargeReason: [],
    otherDischargeReasone: "",
    dischargeReasonDate: "",
  });

export const CommunityDialogueFormDefault: () => CommunityDialogueFormType =
  () => ({
    project_id: "",
    name: "",
    focalPoint: "",
    province_id: "",
    district_id: "",
    village: "",
    indicator_id: "",
    cdName: "",
  });

export const CommunityDialogueBeneficiaryFormDefault: () => CommunityDialogBeneficiaryForm =
  () => ({
    name: "",
    fatherHusbandName: "",
    age: 0,
    maritalStatus: "",
    gender: "",
    phone: "",
    code: "",
    nationalId: "",
    jobTitle: "",
    incentiveReceived: false,
    incentiveAmount: "",
    currancy: "",
    dateOfRegistration: "",
  });

export const UserFormDefault: () => UserType = () => ({
  name: "",
  title: "",
  email: "",
  password: "",
  email_verified_at: "",
  photo_path: "",
  status: "active",
  role: "",
});
