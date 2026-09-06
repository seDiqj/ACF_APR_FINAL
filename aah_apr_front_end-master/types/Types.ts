export type User = {
  id: string;
  name: string;
  title: string;
  status: "active" | "deactive" | "blocked";
  email: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: string;
  name: string;
  status: "active" | "deactive";
};

export type Permission = {
  id: string;
  label: string;
  status: "active" | "deactive";
  goupName: string;
};

export type PermissionsGrouped = {
  [group: string]: Permission[];
};

export type Project = {
  projectCode: string;
  projectTitle: string;
  projectGoal: string;
  projectDonor: string;
  startDate: string;
  endDate: string;
  status: "planned" | "ongoing" | "completed" | "onhold" | "canclled";
  projectManager: string;
  reportingDate: string;
  reportingPeriod: string;
  description: string;
};

export type MainDatabaseBeneficiary = {
  id: string | null;
  program: string;
  beneficiaryCode: string;
  name: string;
  fatherHusbandName: string;
  gender: "male" | "female" | "other" | "";
  age: number;
  childCode: string;
  code: string;
  childAge: number;
  phone: string;
  householdStatus: string;
  maritalStatus: string;
  literacyLevel: string;
  disabilityType: string;
  dateOfRegistration: string;
};

export type MainDatabaseProgram = {
  project_id: string;
  name: string;
  focalPoint: string;
  province: string;
  district: string;
  village: string;
  siteCode: string;
  healthFacilityName: string;
  interventionModality: string;
};

export type KitDatabaseProgram = {
  project_id: string;
  name: string;
  focalPoint: string;
  province: string;
  district: string;
  village: string;
  siteCode: string;
  healthFacilityName: string;
  interventionModality: string;
};

export type BeneficiaryForm = {
  program: string;
  indicators: string[];
  dateOfRegistration: string;
  code: string;
  name: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  childCode: string;
  ageOfChild: number;
  phone: string;
  houseHoldStatus: string;
  literacyLevel: string;
  disablilityType: string;
  referredForProtection: boolean;
};

export type TrainingBenefeciaryForm = {
  name: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  phone: string;
  code: string;
  email: string;
  participantOrganization: string;
  jobTitle: string;
  dateOfRegistration: string;
};

export type KitFormType = {
  kitId: string;
  destribution_date: string;
  remark: string;
  is_received: boolean;
};

export type KitType = {
  name: string;
  description: string;
  status: "active" | "inactive";
};

export type PreAndPostTestFormType = {
  preTestScore: number;
  postTestScore: number;
  remark: string;
};

export type TrainingForm = {
  id: string | null;
  project_id: string;
  province_id: string;
  district_id: string;
  trainingLocation: string;
  name: string;
  participantCatagory: string;
  aprIncluded: boolean;
  trainingModality: string;
  startDate: string;
  endDate: string;
  indicator_id: string;
};

export type ChapterForm = {
  id: string | null;
  topic: string;
  facilitatorName: string;
  facilitatorJobTitle: string;
  startDate: string;
  endDate: string;
};

export type CommunityDialogBeneficiaryForm = {
  name: string;
  fatherHusbandName: string;
  age: number;
  maritalStatus: string;
  gender: string;
  phone: string;
  nationalId: string;
  jobTitle: string;
  code: string;
  incentiveReceived: boolean;
  incentiveAmount: string;
  currancy: string;
  dateOfRegistration: string;
};

export type AssessmentFormType = {
  project_id: string;
  province_id: string;
  indicator_id: string;
  councilorName: string;
  raterName: string;
  type: string;
  date: string;
  aprIncluded: boolean;
};

export type SelectedCommunityDialoguesGroups = {
  communityDialogueId: string;
  group: {
    name: string;
    id: string;
  };
}[];

export type CommunityDialogues = {
  id: string;
  name: string;
  groups: {
    id: string;
    name: string;
  }[];
}[];

export type CommunityDialogueSessionForm = {
  community_dialogue_id: string;
  topic: string;
  date: string;
};

export type PsychoeducationForm = {
  programInformation: {
    indicator_id: string;
    project_id: string;
    name: string;
    focalPoint: string;
    province_id: string;
    district_id: string;
    village: string;
    siteCode: string;
    healthFacilityName: string;
    interventionModality: string;
  };
  psychoeducationInformation: {
    awarenessTopic: string;
    awarenessDate: string;
    // men
    ofMenHostCommunity: string;
    ofMenIdp: string;
    ofMenRefugee: string;
    ofMenReturnee: string;
    // women
    ofWomenHostCommunity: string;
    ofWomenIdp: string;
    ofWomenRefugee: string;
    ofWomenReturnee: string;
    // boy
    ofBoyHostCommunity: string;
    ofBoyIdp: string;
    ofBoyRefugee: string;
    ofBoyReturnee: string;
    // girl
    ofGirlHostCommunity: string;
    ofGirlIdp: string;
    ofGirlRefugee: string;
    ofGirlReturnee: string;
    remark: string;
  };
};

export type KitDatabaseBeneficiaryFormType = {
  program: string;
  indicators: string[];
  dateOfRegistration: string;
  code: string;
  name: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  childCode: string;
  childAge: number;
  phone: string;
  householdStatus: string;
  literacyLevel: string;
  disabilityType: string;
  referredForProtection: boolean;
};

export type KitDatabaseBeneficiaryUpdateFormType = {
  id: string;
  program: string;
  indicators: string[];
  dateOfRegistration: string;
  code: string;
  name: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  childCode: string;
  childAge: number;
  phone: string;
  householdStatus: string;
  literacyLevel: string;
  disabilityType: string;
  referredForProtection: boolean;
};

export type SingleAndMultiSelectOptionsListType = {
  value: string;
  label: string;
};

export type MainDatabaseBeneficiaryUpdateType = {
  id: string;
  program: string;
  dateOfRegistration: string;
  code: string;
  name: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  childCode: string;
  childAge: number;
  phone: string;
  householdStatus: string;
  literacyLevel: string;
  disabilityType: string;
};

export type MealToolFormType = {
  beneficiary_id: string;
  type: string;
  baselineDate: string;
  endlineDate: string;
  baselineTotalScore: string;
  endlineTotalScore: string;
  improvementPercentage: string;
  isBaselineActive: boolean;
  isEndlineActive: boolean;
  evaluation: string;
};

export type ReferredByAndReferredToFormType = {
  name: string;
  agency: string;
  phone: string;
  email: string;
  address: string;
};

export type ReferralReasonFormType = {
  mentalHealthAlert: string;
  selfHarm: string;
  suicideIdeation: string;
  undiagnosedPsychosis: string;
};

export type ReferralFormPersonalInforType = {
  nationalId: string;
  currentAddress: string;
  spokenLanguage: string[];
};
export type Evaluation = {

  participant: string;
  selected: string;
};

export type UserType = {
  name: string;
  title: "";
  email: "";
  password: string;
  email_verified_at: string;
  photo_path: string;
  status: "active" | "deactive";
  role: string;
};

export type Logs = {
  action: string;
  userName: string;
  projectCode: string;
  date: string;
  comment: string;
}[];

export type BeneficiaryEvaluationType = {
  date: string;
  clientSessionEvaluation: string[];
  otherClientSessionEvaluation: string;
  clientSatisfaction: "veryBad" | "bad" | "neutral" | "good" | "veryGood";
  satisfactionDate: string;
  dischargeReason: string[];
  otherDischargeReasone: string;
  dischargeReasonDate: string;
};

export type MainDatabaseBeneficiaryProfileInfoType = {
  dateOfRegistration: string;
  code: string;
  name: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  childCode: string;
  ageOfChild: number;
  phone: string;
  houseHoldStatus: string;
  literacyLevel: string;
  disablilityType: string;
  referredForProtection: boolean;
};

export type KitDatabaseBeneficiaryProfileInfoType = {
  dateOfRegistration: string;
  code: string;
  name: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  maritalStatus: string;
  childCode: string;
  ageOfChild: number;
  phone: string;
  houseHoldStatus: string;
  literacyLevel: string;
  disablilityType: string;
  referredForProtection: boolean;
};

export type Evaluations = {
  evaluations: {
    informative: number;
    usefulness: number;
    understanding: number;
    relevance: number;
    applicability: number;
  };
  remark: string;
} | null;

export type Chapters = {
  trainingId: string | null;
  trainingName: string;
  chapters: {
    id: number;
    topic: string;
    facilitatorName: string;
    facilitatorJobTitle: string;
    startDate: string;
    endDate: string;
  }[];
}[];

export type SelfChapters = {
  id: number;
  isPresent: boolean;
  preTestScore: number;
  postTestScore: number;
  remark: string;
}[];

export type CommunityDialogueFormType = {
  project_id: string;
  name: string;
  focalPoint: string;
  province_id: string;
  district_id: string;
  village: string;
  indicator_id: string;
  cdName: string;
};

export type Assessments = Record<
  string,
  { id: string; group: string; description: string }[]
>;
