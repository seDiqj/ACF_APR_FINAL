import { SingleAndMultiSelectOptionsListType } from "@/types/Types";
import { Check, Shield, User } from "lucide-react";

export const ProjectStatusOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "planed", label: "Planed" },
  { value: "ongoing", label: "On Going" },
  { value: "completed", label: "Compleated" },
  { value: "onhold", label: "On Hold" },
  { value: "canclled", label: "Canclled" },
];

export const ProvinceOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "kabul", label: "Kabul" },
  { value: "badakhshan", label: "Badakhshan" },
  { value: "ghor", label: "Ghor" },
  { value: "helmand", label: "Helmand" },
  { value: "daikundi", label: "Daikundi" },
];

export const SectorOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "mhpss", label: "MHPSS" },
  { value: "wash", label: "WASH" },
  { value: "health&nutrition", label: "Health and Nutrition" },
  { value: "fsl", label: "FSL" },
];

export const HousholdStatusOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "idp_drought", label: "IDP (Drought)" },
  { value: "idp_conflict", label: "IDP (Conflict)" },
  { value: "returnee", label: "Returnee" },
  { value: "host_community", label: "Host Community" },
  { value: "refugee", label: "Refugee" },
];

export const GenderOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const MaritalStatusOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "widower", label: "Widower" },
  { value: "separated", label: "Separated" },
];

export const DisabilityTypeOptions: SingleAndMultiSelectOptionsListType[] = [
  {
    value: "person_with_disability",
    label: "With Disability",
  },
  {
    value: "person_without_disability",
    label: "Without Disability",
  },
];

export const ReferredForProtectionOptions: SingleAndMultiSelectOptionsListType[] =
  [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];

export const KitRecievedOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export const KitStatusOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const indicatorStatus: SingleAndMultiSelectOptionsListType[] = [
  { value: "notStarted", label: "Not Started" },
  { value: "inProgress", label: "In Progress" },
  { value: "achived", label: "Achived" },
  { value: "notAchived", label: "Not Achived" },
];

export const databases: SingleAndMultiSelectOptionsListType[] = [
  {
    value: "main_database",
    label: "Main Database",
  },
  {
    value: "main_database_meal_tool",
    label: "Main Database (Target: Meal Tool)",
  },
  {
    value: "kit_database",
    label: "Kit Database",
  },
  {
    value: "psychoeducation_database",
    label: "Psychoeducation Database",
  },
  {
    value: "cd_database",
    label: "Community Dialog Database",
  },
  {
    value: "training_database",
    label: "Training Database",
  },
  {
    value: "refferal_database",
    label: "Referral Database",
  },
  {
    value: "enact_database",
    label: "Enact Database",
  },
];

export const indicatorTypes: SingleAndMultiSelectOptionsListType[] = [
  {
    value: "adult_psychosocial_support",
    label: "Adult Psychosocial Support",
  },
  {
    value: "child_psychosocial_support",
    label: "Child Psychosocial Support",
  },
  {
    value: "parenting_skills",
    label: "Parenting Skills",
  },
  {
    value: "child_care_practices",
    label: "Child Care Practices",
  },
];

export const baselineOptions = [
  "low",
  "moderate",
  "high",
  "evaluationNotPossible",
  "n/a",
];

export const endlineOptions = [
  "low",
  "moderate",
  "high",
  "evaluationNotPossible",
  "n/a",
];

export const servicesOptions = [
  "Alternative care",
  "Security (safe shelter)",
  "Education (formal)",
  "Non-formal education",
  "S/GBV specialized care",
  "Family tracing and reunification",
  "Basic psychosocial support",
  "Food",
  "Non-food items",
  "Documentation",
  "Services for beneficiary with disabilities",
  "Shelter",
  "WASH",
  "Relocation",
  "Cash assistance",
  "Livelihoods",
  "Sexual & reproductive health",
  "Protection issues",
  "Others (please specify)",
  "General health & medical support",
  "Nutrition",
  "Legal support",
];

export const LanguagesOptions = [
  { value: "pashto", label: "Pashto" },
  { value: "dari", label: "Dari" },
  { value: "other", label: "Other" },
];

export const EvaluationOptions = [
  "informative",
  "usefulness",
  "understanding",
  "relevance",
  "applicability",
];

export const incentiveReceivedOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export const steps = [
  { id: 1, label: "Personal Info", icon: <User size={18} /> },
  { id: 2, label: "Permissions", icon: <Shield size={18} /> },
  { id: 3, label: "Summary", icon: <Check size={18} /> },
];

export const clientSatisfactionOptions: { emoji: string; label: string }[] = [
  { emoji: "😡", label: "veryBad" },
  { emoji: "🙁", label: "bad" },
  { emoji: "😐", label: "neutral" },
  { emoji: "🙂", label: "good" },
  { emoji: "😊", label: "veryGood" },
];

export const AssessmentTypeOptions: SingleAndMultiSelectOptionsListType[] = [
  { value: "enact", label: "Enact" },
];

export const webSiteContentList = [
  { contentTitle: "Dashboard", contentUrl: "/" },
  { contentTitle: "Projects", contentUrl: "/projects" },
  { contentTitle: "Create New Project", contentUrl: "/create_new_project" },
  { contentTitle: "Main Database", contentUrl: "/main_db" },
  { contentTitle: "Kit Distribution", contentUrl: "/kit" },
  { contentTitle: "Psychoeducation", contentUrl: "/psychoeducation" },
  { contentTitle: "Community Dialogue", contentUrl: "/community_dialogue" },
  { contentTitle: "Training", contentUrl: "/training" },
  { contentTitle: "Referral", contentUrl: "/referral" },
  { contentTitle: "Settings", contentUrl: "/settings" },
  { contentTitle: "Notifications", contentUrl: "/notifications" },
];

// Will be used in version 2.
const enactTabsList = [
  "ENACT: FOUNDATIONAL HELPING SKILLS-ADULT",
  "PROBLEUM MANAGEMENT PLUS (COMINED ENACT & PM+)",
  "PROBLEUM MANAGEMENT PLUS (PM+) COMPETENCIES [LEGACY VERSION]",
  "SELF HELP PLUS",
  "BEHAVIORAL ACTIVATION COMPETENCIES",
];
