export const MainDatabaseBeneficiariesFilters: string[] = [
  "projectCode",
  "indicator",
  "focalPoint",
  "province",
  "siteCode",
  "healthFacilitator",
  "dateOfRegistration",
  "age",
  "maritalStatus",
  "householdStatus",
  "baselineDate",
  "endlineDate",
  "code",
];

export const MainDatabaseProgramsFilters: string[] = [
  "projectCode",
  "focalPoint",
  "province",
  "district",
  "village",
  "siteCode",
  "healthFacilityName",
  "interventionModality",
];

export const KitDatabaseBeneficiaryFiltersList: string[] = [
  "projectCode",
  "indicator",
  "focalPoint",
  "province",
  "siteCode",
  "healthFacilitator",
  "dateOfRegistration",
  "age",
  "maritalStatus",
  "householdStatus",
  "code",
];

export const KitDatabaseProgramsFiltersList: string[] = [
  "projectCode",
  "focalPoint",
  "province",
  "district",
  "village",
  "siteCode",
  "healthFacilityName",
  "interventionModality",
];

export const KitDatabaseBeneficiaryKitsTableFiltersList: string[] = [
  "kit",
  "distributionDate",
  "isReceived",
];

export const PsychoeducationsFiltersList: string[] = [
  "indicator",
  "awarenessTopic",
  "awarenessDate",
];

export const TrainingDatabaseBeneficiaryFiltersList: string[] = [
  "projectCode",
  "indicator",
  "province",
  "age",
  "gender",
  "code",
];

export const TrainingBeneficiariesFiltersList: string[] = [
  "age",
  "gender",
  "code",
];

export const TrainingFiltersList: string[] = [
  "projectCode",
  "indicatorRef",
  "province",
];

export const ReferralsFiltersList: string[] = [
  "projectCode",
  "province",
  "age",
  "gender",
  "dateOfRegistration",
  "code",
];

export const CommunityDialogueBeneficiariesFiltersList: string[] = [
  "projectCode",
  "province",
  "indicator",
  "age",
  "gender",
  "dateOfRegistration",
  "code",
];

export const CommunityDialoguesFiltersList: string[] = [
  "projectCode",
  "focalPoint",
  "province",
  "indicator",
];

export const AssessmentsFiltersList: string[] = [
  "projectCode",
  "province",
  "indicator",
  "date",
];

export const UserFiltersList: string[] = [
  "name",
  "email",
  "title",
  "status",
  "create_at",
];

export const RoleFiltersList: string[] = ["name", "status"];

export const PermissionFiltersList: string[] = ["group_name"];

export const ApprovedAprsFiltersList: string[] = [
  "projectCode",
  "province",
  "database",
  "fromDate",
  "toDate",
];

export const ApprovedDatabasesFiltersList: string[] = [
  "projectCode",
  "province",
  "database",
  "fromDate",
  "toDate",
];

// export const SubmittedDatabasesFiltersList: {
//   filter: string;
//   type: "text" | "singleSelect" | "multiSelect";
//   options?: Option[];
// }[] = [
//   {
//     filter: "projectCode",
//     type: "multiSelect",
//   },
//   {
//     filter: "province",
//     type: "multiSelect",
//   },
//   {
//     filter: "database",
//     type: "multiSelect",
//   },
//   {
//     filter: "fromDate",
//     type: "text",
//   },
//   {
//     filter: "toDate",
//     type: "text",
//   },
// ];
// export const SubmittedDatabasesFiltersList: string[] = [
//   "projectCode",
//   "province",
//   "database",
//   "fromDate",
//   "toDate",
// ];

export const ReviewAprFiltersList: string[] = [
  "projectCode",
  "province",
  "database",
  "fromDate",
  "toDate",
];

// export const ProjectFiltersList: string[] = [
//   "projectCode",
//   "projectManager",
//   "provinces",
//   "thematicSector",
//   "startDate",
//   "endDate",
//   "status",
// ];
