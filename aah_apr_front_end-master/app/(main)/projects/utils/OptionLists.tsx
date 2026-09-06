export const sessionDessaggregationOptions: string[] = [
  "# 0f indevidual MHPSS consultations",
  "# 0f group MHPSS consultations",
];

export const indevidualDessaggregationOptions: string[] = [
  "# Of Male (above 18)",
  "# Of Female (above 18)",
  "# of Male adolescents (12 to 17 years old)",
  "# of Female adolescents (12 to 17 years old)",
  "# of Male children (6 to 11 years old)",
  "# of Female children (6 to 11 years old)",
  "# of Male CU5 (boys)",
  "# of Female CU5 (girls)",
];

export const enactDessaggregationOptions: string[] = [
  "# of supervised psychosocial counsellors",
  "# Accumulated score EQUIP (ENACT) Tool",
];

export const isp3s: string[] = [
  "Improved Mental health and psychosocial well-being",
  "Total transfers for the MHPSS & Protection sector",
  "Reach of Care Practices",
  "Reach of Mental health and Psychosocial Support and Protection",
  "Reach of MHPSS, Care Practices and Protection capacity building activities",
  "Reach of MHPSS, Care Practices and Protection kits deliveries",
];

export const projectAprStatusList = [
  "notCreatedYet",
  "created",
  "hodDhodApproved",
  "hodDhodRejected",
  "grantFinalized",
  "grantRejected",
  "hqFinalized",
  "hqRejected",
];

export const aprFinalizationSteps = [
  {
    id: "create",
    buttonLabel: "Create",
    label: "Create",
    stepValue: 1,
    description:
      "This action will change the status of project to CREATED and send notification to manager for submitting.",
    acceptStatusValue: "created",
    rejectStatusValue: "notCreatedYet",
    permission: "Project.create",
  },
  {
    id: "submit",
    buttonLabel: "Submit",
    label: "Submit By FC/HoD",
    stepValue: 2,
    description: "This action will mark the project as submitted by FC/HoD.",
    acceptStatusValue: "hodDhodApproved",
    rejectStatusValue: "hodDhodRejected",
    permission: "Project.submit",
  },
  {
    id: "grantFinalize",
    buttonLebel: "Finalize",
    label: "Grant Finalization",
    stepValue: 3,
    description:
      "This action will finalize the grant and update project status.",
    acceptStatusValue: "grantFinalized",
    rejectStatusValue: "grantRejected",
    permission: "Project.grantFinalize",
  },
  {
    id: "hqFinalize",
    buttonLebel: "Finalize",
    label: "HQ Finalization",
    stepValue: 4,
    description: "This action will finalize the project at HQ level.",
    acceptStatusValue: "hqFinalized",
    rejectStatusValue: "hqRejected",
    permission: "Project.HQFinalize",
  },
];
