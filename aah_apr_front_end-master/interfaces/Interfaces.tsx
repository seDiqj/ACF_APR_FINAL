import { Option } from "@/components/multi-select";
import { BeneficiaryForm, ChapterForm } from "@/types/Types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export interface DataTableInterface {
  columns: ColumnDef<any>[];
  indexUrl: string;
  deleteUrl?: string;
  searchableColumn: string;

  // For Edit modal
  idFeildForEditStateSetter?: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  editModelOpenerStateSetter?:
    | React.Dispatch<React.SetStateAction<boolean>>
    | VoidFunction;

  // For Show modal
  idFeildForShowStateSetter?: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  showModelOpenerStateSetter?:
    | React.Dispatch<React.SetStateAction<boolean>>
    | VoidFunction;

  selectedRowsIdsStateSetter?: React.Dispatch<React.SetStateAction<{}>>;

  // Injected element
  injectedElement?: React.ReactNode;

  injectedElementForOneSelectedItem?: React.ReactNode;

  filtersListURL?: string;

  deleteBtnPermission?: string;

  editBtnPermission?: string;

  viewPermission?: string;
}

export interface PsychoeducationFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode: "create" | "edit" | "show";
  psychoeducationId?: string;
}

export interface KitDatabaseBeneficiaryFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
}

export interface KitDatabaseBenficiaryUpdateForm {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  beneficiaryId: string;
}

export interface KitFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode: "create" | "edit" | "show" | "select";
  kitId?: number;
  ids?: Record<string, any>;
}

export interface MainDatabaseBeneficiaryCreation {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  createdProgramStateSetter?: any;
}

export interface MainDatabaseBeneficiaryUpdate {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  beneficiaryId: string;
}

export interface MealToolInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mealToolsStateSetter: any;
  mode: "create" | "edit" | "show";
  mealtoolId?: number | null;
}

export interface OutcomeInterface {
  isOpen: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  mode: "create" | "edit" | "show";
  pageIdentifier: "create" | "edit" | "show";
  outcomeId?: number;
}

export interface OutputInterface {
  isOpen: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  mode: "create" | "edit" | "show";
  pageIdentifier: "create" | "edit" | "show";
  outputId?: number | null;
}

export interface PreAndPostTestsInterface {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string;
}

export interface ReferralData {
  id?: number;

  beneficiary_id?: number;
  indicator_id?: number;

  referralConcern?: boolean;
  referralConcernNote?: string | null;

  concentGiven?: boolean;
  needReferral?: boolean;

  consentProvided?: boolean | null;
  consentReason?: string | null;

  caseNumber?: string | null;
  type?: "internal" | "external" | null;

  referrerName?: string | null;
  referrerAgency?: string | null;
  referrerPhone?: string | null;
  referrerEmail?: string | null;
  referrerAddress?: string | null;

  referredToName?: string | null;
  referredToAgency?: string | null;
  referredToPhone?: string | null;
  referredToEmail?: string | null;
  referredToAddress?: string | null;

  dateOfReferral?: string | null;

  nationalId?: string | null;
  currentAddress?: string | null;

  spokenLanguage?: string[] | null;

  mentalHealthAlert?: string[] | null;

  serviceRequested?: string[] | null;

  otherServiceText?: string | null;

  expectedOutcome?: string | null;

  referralAccepted?: boolean | null;

  referralRejectedReasone?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface ReferralInterface {
  beneficiaryInfo: BeneficiaryForm | null;
  referralInfo: ReferralData | null;
}

export interface RoleInterface {
  open: boolean;
  openStateSetter: (value: boolean) => void;
  mode: "create" | "edit" | "show";
  idFeildForEditStateSetter?: number | null;
}

export interface TrainingEvaluationInterface {
  previosTrainingEvaluations?: {
    evaluations: {
      informative: number;
      usefulness: number;
      understanding: number;
      relevance: number;
      applicability: number;
    };
    remark: string;
  } | null;
}

export interface TrainingSelectorInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  ids: {};
  trainingsData?: string;
}

export interface CommunityDialogueUpdateInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  beneficiaryId: number;
}

export interface UpdatePsychoeducationInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  psychoId: string;
}

export interface TrainingUpdateInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  trainingId: number;
}

export interface UserInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode?: "create" | "edit" | "show";
  permission?: "";
  userId?: number;
  reloader?: () => void;
}

export interface IndicatorFormInterface {
  mode: "create" | "edit" | "show";
}

export interface IndicatorModelInterface {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "show";
  pageIdentifier: "create" | "edit" | "show";
  indicatorId?: number | null;
}

export interface MainDatabaseProgramFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode: "create" | "edit" | "show";
  programId?: number;

  // Only for creation mode, temp
  createdProgramStateSetter?: any;

  // temp
  programsListStateSetter?: any;
}

export interface KitDatabaseBeneficiaryProfileInterface {
  params: Promise<{
    id: string;
  }>;
}

export interface TrainingBeneficiaryFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  mode: "create" | "edit";
  editId?: number | string;
}

export interface TrainingFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  mode: "create" | "edit" | "show";
  id?: number;
}

export interface TrainingProfileInterface {
  params: Promise<{
    id: string;
  }>;
}

export interface ChapterFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  chaptersDataStateSetter: React.Dispatch<React.SetStateAction<ChapterForm[]>>;
  mode: "create" | "edit" | "show";
  chapterId?: string;
}

export interface OutputFormInterface {
  mode: "create" | "edit" | "show";
}

export interface DessaggregationFromInterface {
  mode: "create" | "edit" | "show";
}

export interface AssessmentFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode: "create" | "edit" | "show";
  projectId?: number;
}

export interface AssessmentScoreFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode: "create" | "edit" | "show";
  dateRange: {
    startDate: string;
    endDate: string;
  };
  exceptMonth: number[];
  assessmentId?: number;
}

export interface ConfirmationModelInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  message: string;
  onOk: any;
}

export interface SubmitSummaryInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  databaseId: string | null;
}

export interface CdDatabaseBeneficiaryCreationFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

export interface CommunityDialogueSelectorInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  ids: string[];
}

export interface CommunityDialogueSessionFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  sessionId?: string;
  mode: "create" | "edit" | "show";
}

export interface CommunityDialogueFormInterface {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update" | "show";
  dialogueId?: number;
}

export interface MainDatabaseBeneficiaryProfileInterface {
  params: Promise<{
    id: string;
  }>;
}

export interface Isp3SubPageInterface {
  mode: "create" | "edit" | "show";
}

export interface MonitoringTablePageInterface {
  mode: "create" | "edit" | "show";
}

export interface AprFinalizationSubPageInterface {
  mode: "create" | "edit" | "show";
}

export interface OutcomeFormInterface {
  mode: "create" | "edit" | "show";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  unread?: boolean;
  time: string;
  type:
    | "project"
    | "submittedDatabase"
    | "approvedDatabase"
    | "reviewdApr"
    | "approvedApr";
  database_id?: string;
  project_id?: string;
  apr_id?: string;
}

// Types
export interface Navbar14Props extends React.HTMLAttributes<HTMLElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  testMode?: boolean;
  showTestMode?: boolean;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    unread?: boolean;
  }>;
  onSearchChange?: (value: string) => void;
  onTestModeChange?: (enabled: boolean) => void;
  onLayoutClick?: () => void;
  onAddClick?: () => void;
  onInfoItemClick?: (item: string) => void;
  onNotificationClick?: (notificationId: string) => void;
  onSettingsItemClick?: (item: string) => void;
}

export interface KitDatabaseProgramFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  mode: "create" | "edit" | "show";
  programId?: number;

  // Only for creation mode, temp
  createdProgramStateSetter?: any;

  // temp
  programsListStateSetter?: any;
}

export interface CdDatabaseBeneficiaryUpdateFormInterface {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  beneficiaryId: number;
}

export interface ProjectFormInterface {
  mode: "create" | "edit" | "show";
}

export interface AprLogsSubPageInterface {
  mode: "create" | "edit" | "show";
}

export interface ParentInterface {
  children: React.ReactNode;
}

export interface UserAvatarInterface {
  userName: string;
}
