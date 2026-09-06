import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { SELECT_ALL_BUTTON_PROVIDER } from "@/config/System";
import {
  Role,
  User,
  Permission,
  Project,
  BeneficiaryForm,
  KitFormType,
} from "@/types/Types";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  Minus,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                UI HELPERS                                  */
/* -------------------------------------------------------------------------- */

const SortableHeader = ({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-8 -ml-3 px-3 text-xs font-semibold text-foreground hover:bg-muted/60"
    >
      {children}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  );
};

const SelectColumn = <T,>(selectAllId?: string): ColumnDef<T> => ({
  id: "select",

  header: ({ table }) => (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select all"
        id={selectAllId}
      />
    </div>
  ),

  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      onClick={(e) => e.stopPropagation()}
      aria-label="Select row"
    />
  ),

  enableSorting: false,
  enableHiding: false,
  size: 40,
});

/* -------------------------------------------------------------------------- */
/*                              TEXT COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const TextCell = ({
  value,
  maxWidth = "max-w-[180px]",
  className = "",
}: {
  value: unknown;
  maxWidth?: string;
  className?: string;
}) => {
  const text =
    value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <div className={`${maxWidth} truncate ${className}`} title={text}>
      {text}
    </div>
  );
};

const CodeCell = ({ value }: { value: unknown }) => {
  const text =
    value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <div
      title={text}
      className="inline-flex max-w-[160px] truncate rounded-md border border-border/70 bg-muted/40 px-2 py-1 font-mono text-[11px] font-medium text-foreground"
    >
      {text}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              DATE COMPONENT                                */
/* -------------------------------------------------------------------------- */

const DateCell = ({ value }: { value: unknown }) => {
  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  const text = String(value);

  return (
    <span
      title={text}
      className="whitespace-nowrap text-xs font-medium text-muted-foreground"
    >
      {text}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                             BOOLEAN COMPONENT                              */
/* -------------------------------------------------------------------------- */

const BooleanCell = ({
  value,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: unknown;
  yesLabel?: string;
  noLabel?: string;
}) => {
  const checked = Boolean(value);

  return checked ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
      <Check className="h-3.5 w-3.5" />
      {yesLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />
      {noLabel}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                              STATUS COMPONENT                              */
/* -------------------------------------------------------------------------- */

type StatusType =
  | "active"
  | "deactive"
  | "blocked"
  | "submitted"
  | "resubmitted"
  | "reviewed"
  | "validated"
  | "approved"
  | "pending"
  | "rejected"
  | "refused"
  | "unknown";

const statusConfig: Record<
  StatusType,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CircleCheck,
  },

  deactive: {
    label: "Inactive",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock3,
  },

  blocked: {
    label: "Blocked",
    className:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
    icon: CircleX,
  },

  submitted: {
    label: "Submitted",
    className:
      "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400",
    icon: Clock3,
  },

  resubmitted: {
    label: "Resubmitted",
    className:
      "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400",
    icon: Clock3,
  },

  reviewed: {
    label: "Reviewed",
    className:
      "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400",
    icon: CircleCheck,
  },

  validated: {
    label: "Validated",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CircleCheck,
  },

  approved: {
    label: "Approved",
    className:
      "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400",
    icon: CircleCheck,
  },

  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock3,
  },

  rejected: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
    icon: CircleX,
  },

  refused: {
    label: "Refused",
    className:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
    icon: CircleAlert,
  },

  unknown: {
    label: "Unknown",
    className: "bg-muted text-muted-foreground ring-border",
    icon: CircleAlert,
  },
};

const StatusBadge = ({
  status,
  label,
}: {
  status: string | null | undefined;
  label?: string;
}) => {
  const normalized = String(status ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_") as StatusType;

  const config = statusConfig[normalized] ?? statusConfig.unknown;

  const Icon = config.icon;

  return (
    <span
      title={label ?? config.label}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label ?? config.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                           GENERIC COLUMN HELPERS                           */
/* -------------------------------------------------------------------------- */

const textColumn = <T,>(
  accessorKey: string,
  header: string,
  options?: {
    sortable?: boolean;
    maxWidth?: string;
    className?: string;
  }
): ColumnDef<T> => ({
  accessorKey,

  header: ({ column }) =>
    options?.sortable ? (
      <SortableHeader column={column}>{header}</SortableHeader>
    ) : (
      <div className="text-xs font-semibold text-foreground">{header}</div>
    ),

  cell: ({ row }) => (
    <TextCell
      value={row.getValue(accessorKey)}
      maxWidth={options?.maxWidth}
      className={options?.className}
    />
  ),
});

const dateColumn = <T,>(accessorKey: string, header: string): ColumnDef<T> => ({
  accessorKey,

  header: () => (
    <div className="text-xs font-semibold text-foreground">{header}</div>
  ),

  cell: ({ row }) => <DateCell value={row.getValue(accessorKey)} />,
});

const codeColumn = <T,>(accessorKey: string, header: string): ColumnDef<T> => ({
  accessorKey,

  header: () => (
    <div className="text-xs font-semibold text-foreground">{header}</div>
  ),

  cell: ({ row }) => <CodeCell value={row.getValue(accessorKey)} />,
});

const statusColumn = <T,>(
  accessorKey: string,
  header = "Status"
): ColumnDef<T> => ({
  accessorKey,

  header: () => (
    <div className="text-xs font-semibold text-foreground">{header}</div>
  ),

  cell: ({ row }) => (
    <StatusBadge status={String(row.getValue(accessorKey) ?? "")} />
  ),
});

const booleanColumn = <T,>(
  accessorKey: string,
  header: string
): ColumnDef<T> => ({
  accessorKey,

  header: () => (
    <div className="text-xs font-semibold text-foreground">{header}</div>
  ),

  cell: ({ row }) => <BooleanCell value={row.getValue(accessorKey)} />,
});

/* -------------------------------------------------------------------------- */
/*                               USER COLUMNS                                 */
/* -------------------------------------------------------------------------- */

export const userColumns: ColumnDef<User>[] = [
  SelectColumn<User>(),

  textColumn<User>("name", "Name", {
    sortable: true,
    maxWidth: "max-w-[180px]",
    className: "font-medium",
  }),

  textColumn<User>("email", "Email", {
    sortable: true,
    maxWidth: "max-w-[220px]",
    className: "lowercase text-muted-foreground",
  }),

  textColumn<User>("title", "Title", {
    maxWidth: "max-w-[180px]",
  }),

  statusColumn<User>("status"),

  textColumn<User>("updated_by", "Updated By", {
    maxWidth: "max-w-[150px]",
  }),

  dateColumn<User>("created_date", "Created At"),

  dateColumn<User>("updated_date", "Updated At"),

  textColumn<User>("created_by", "Created By", {
    maxWidth: "max-w-[150px]",
  }),
];

/* -------------------------------------------------------------------------- */
/*                               ROLE COLUMNS                                 */
/* -------------------------------------------------------------------------- */

export const roleColumns: ColumnDef<Role>[] = [
  SelectColumn<Role>(),

  textColumn<Role>("name", "Name", {
    sortable: true,
    maxWidth: "max-w-[180px]",
    className: "font-medium",
  }),

  statusColumn<Role>("status"),

  dateColumn<Role>("created_at", "Created At"),

  dateColumn<Role>("updated_at", "Updated At"),
];

/* -------------------------------------------------------------------------- */
/*                           PERMISSION COLUMNS                               */
/* -------------------------------------------------------------------------- */

export const permissionColumns: ColumnDef<Permission>[] = [
  SelectColumn<Permission>(),

  textColumn<Permission>("name", "Name", {
    sortable: true,
    maxWidth: "max-w-[220px]",
    className: "font-medium",
  }),

  textColumn<Permission>("label", "Label", {
    maxWidth: "max-w-[220px]",
  }),

  textColumn<Permission>("group_name", "Group", {
    maxWidth: "max-w-[180px]",
  }),
];

/* -------------------------------------------------------------------------- */
/*                              PROJECT COLUMNS                               */
/* -------------------------------------------------------------------------- */

export const projectColumns: ColumnDef<Project>[] = [
  SelectColumn<Project>(SELECT_ALL_BUTTON_PROVIDER),

  codeColumn<Project>("projectCode", "Project Code"),

  textColumn<Project>("projectTitle", "Project Title", {
    maxWidth: "max-w-[240px]",
    className: "font-medium",
  }),

  textColumn<Project>("projectGoal", "Project Goal", {
    maxWidth: "max-w-[220px]",
  }),

  textColumn<Project>("projectDonor", "Project Donor", {
    maxWidth: "max-w-[180px]",
  }),

  dateColumn<Project>("startDate", "Start Date"),

  dateColumn<Project>("endDate", "End Date"),

  statusColumn<Project>("status"),

  textColumn<Project>("projectManager", "Project Manager", {
    maxWidth: "max-w-[180px]",
  }),

  dateColumn<Project>("reportingDate", "Reporting Date"),

  textColumn<Project>("reportingPeriod", "Reporting Period", {
    maxWidth: "max-w-[160px]",
  }),

  textColumn<Project>("description", "Description", {
    maxWidth: "max-w-[240px]",
    className: "text-muted-foreground",
  }),
];

/* -------------------------------------------------------------------------- */
/*                    MAIN DATABASE / KIT PROGRAM                             */
/* -------------------------------------------------------------------------- */

export const mainDatabaseAndKitDatabaseProgramColumns: ColumnDef<Project>[] = [
  SelectColumn<Project>(),

  textColumn<Project>("database", "Database Name", {
    sortable: true,
    maxWidth: "max-w-[200px]",
    className: "font-medium",
  }),

  codeColumn<Project>("projectCode", "Project Code"),

  textColumn<Project>("focalPoint", "Focal Point", {
    maxWidth: "max-w-[180px]",
  }),

  textColumn<Project>("province", "Province", {
    maxWidth: "max-w-[150px]",
  }),

  textColumn<Project>("district", "District", {
    maxWidth: "max-w-[150px]",
  }),

  textColumn<Project>("village", "Village", {
    maxWidth: "max-w-[150px]",
  }),

  codeColumn<Project>("siteCode", "Site Code"),

  textColumn<Project>("healthFacilityName", "Health Facility", {
    maxWidth: "max-w-[220px]",
  }),

  textColumn<Project>("interventionModality", "Intervention Modality", {
    maxWidth: "max-w-[200px]",
  }),
];

/* -------------------------------------------------------------------------- */
/*                         BENEFICIARY COLUMNS                                */
/* -------------------------------------------------------------------------- */

export const mainDatabaseAndKitDatabaseBeneficiaryColumns: ColumnDef<BeneficiaryForm>[] =
  [
    SelectColumn<BeneficiaryForm>(),

    textColumn<BeneficiaryForm>("programName", "Program", {
      maxWidth: "max-w-[180px]",
      className: "font-medium",
    }),

    dateColumn<BeneficiaryForm>("dateOfRegistration", "Registration Date"),

    codeColumn<BeneficiaryForm>("code", "Code"),

    textColumn<BeneficiaryForm>("name", "Name", {
      maxWidth: "max-w-[180px]",
      className: "font-medium",
    }),

    textColumn<BeneficiaryForm>("fatherHusbandName", "Father / Husband", {
      maxWidth: "max-w-[180px]",
    }),

    textColumn<BeneficiaryForm>("gender", "Gender", {
      maxWidth: "max-w-[100px]",
    }),

    textColumn<BeneficiaryForm>("age", "Age", {
      maxWidth: "max-w-[70px]",
      className: "font-semibold",
    }),

    textColumn<BeneficiaryForm>("maritalStatus", "Marital Status", {
      maxWidth: "max-w-[130px]",
    }),

    codeColumn<BeneficiaryForm>("childCode", "Child Code"),

    textColumn<BeneficiaryForm>("childAge", "Child Age", {
      maxWidth: "max-w-[90px]",
      className: "font-semibold",
    }),

    textColumn<BeneficiaryForm>("phone", "Phone", {
      maxWidth: "max-w-[150px]",
    }),

    textColumn<BeneficiaryForm>("householdStatus", "Household Status", {
      maxWidth: "max-w-[160px]",
    }),

    textColumn<BeneficiaryForm>("literacyLevel", "Literacy Level", {
      maxWidth: "max-w-[150px]",
    }),

    textColumn<BeneficiaryForm>("disabilityType", "Disability Type", {
      maxWidth: "max-w-[180px]",
    }),

    booleanColumn<BeneficiaryForm>(
      "referredForProtection",
      "Protection Referral"
    ),
  ];

/* -------------------------------------------------------------------------- */
/*                           KIT DISTRIBUTION                                 */
/* -------------------------------------------------------------------------- */

export const beneficiaryKitListColumns: ColumnDef<KitFormType>[] = [
  SelectColumn<KitFormType>(),

  textColumn<KitFormType>("kit", "Kit", {
    maxWidth: "max-w-[180px]",
    className: "font-medium",
  }),

  dateColumn<KitFormType>("distributionDate", "Distribution Date"),

  booleanColumn<KitFormType>("isReceived", "Received"),

  textColumn<KitFormType>("remark", "Remark", {
    maxWidth: "max-w-[240px]",
    className: "text-muted-foreground",
  }),
];

/* -------------------------------------------------------------------------- */
/*                              TRAININGS                                     */
/* -------------------------------------------------------------------------- */

export const trainingsListColumns: ColumnDef<KitFormType>[] = [
  SelectColumn<KitFormType>(),

  codeColumn<KitFormType>("projectCode", "Project Code"),

  textColumn<KitFormType>("province", "Province", {
    maxWidth: "max-w-[140px]",
  }),

  textColumn<KitFormType>("district", "District", {
    maxWidth: "max-w-[140px]",
  }),

  textColumn<KitFormType>("indicator", "Indicator", {
    maxWidth: "max-w-[180px]",
  }),

  textColumn<KitFormType>("trainingLocation", "Location", {
    maxWidth: "max-w-[180px]",
  }),

  textColumn<KitFormType>("name", "Training Name", {
    maxWidth: "max-w-[220px]",
    className: "font-medium",
  }),

  textColumn<KitFormType>("participantCatagory", "Participant Category", {
    maxWidth: "max-w-[180px]",
  }),

  booleanColumn<KitFormType>("aprIncluded", "APR Included"),

  textColumn<KitFormType>("trainingModality", "Modality", {
    maxWidth: "max-w-[160px]",
  }),

  dateColumn<KitFormType>("startDate", "Start Date"),

  dateColumn<KitFormType>("endDate", "End Date"),
];

/* -------------------------------------------------------------------------- */
/*                    TRAINING BENEFICIARY                                    */
/* -------------------------------------------------------------------------- */

export const trainingDatabaseBeneificiaryListColumn: ColumnDef<KitFormType>[] =
  [
    SelectColumn<KitFormType>(),

    textColumn<KitFormType>("name", "Name", {
      maxWidth: "max-w-[180px]",
      className: "font-medium",
    }),

    textColumn<KitFormType>("fatherHusbandName", "Father / Husband", {
      maxWidth: "max-w-[180px]",
    }),

    textColumn<KitFormType>("gender", "Gender", {
      maxWidth: "max-w-[100px]",
    }),

    textColumn<KitFormType>("age", "Age", {
      maxWidth: "max-w-[70px]",
      className: "font-semibold",
    }),

    textColumn<KitFormType>("phone", "Phone", {
      maxWidth: "max-w-[150px]",
    }),

    textColumn<KitFormType>("email", "Email", {
      maxWidth: "max-w-[220px]",
      className: "lowercase text-muted-foreground",
    }),

    textColumn<KitFormType>(
      "participantOrganization",
      "Participant Organization",
      {
        maxWidth: "max-w-[220px]",
      }
    ),

    textColumn<KitFormType>("jobTitle", "Participant Job Title", {
      maxWidth: "max-w-[200px]",
    }),
  ];

/* -------------------------------------------------------------------------- */
/*                         PSYCHOEDUCATION                                    */
/* -------------------------------------------------------------------------- */

export const psychoeducationTableListColumn: ColumnDef<any>[] = [
  SelectColumn<any>(),

  textColumn<any>("programName", "Program", {
    maxWidth: "max-w-[180px]",
    className: "font-medium",
  }),

  codeColumn<any>("projectCode", "Project Code"),

  textColumn<any>("indicator", "Indicator", {
    maxWidth: "max-w-[220px]",
  }),

  dateColumn<any>("awarenessDate", "Awareness Date"),
];

/* -------------------------------------------------------------------------- */
/*                         BENEFICIARY SESSIONS                               */
/* -------------------------------------------------------------------------- */

export const beneficiarySessionsTableColumn = (
  onSwitchChange: (id: number) => void
): ColumnDef<any>[] => {
  return [
    SelectColumn<any>(),

    textColumn<any>("type", "Type", {
      maxWidth: "max-w-[140px]",
      className: "font-medium",
    }),

    textColumn<any>("topic", "Topic", {
      maxWidth: "max-w-[240px]",
    }),

    dateColumn<any>("date", "Date"),

    {
      accessorKey: "isPresent",

      header: () => (
        <div className="text-xs font-semibold text-foreground">Attendance</div>
      ),

      cell: ({ row }) => (
        <Switch
          id={`attendance-${row.id}`}
          checked={Boolean(row.getValue("isPresent"))}
          onCheckedChange={() => onSwitchChange(Number(row.original.id))}
          className="h-5 w-8 [&_span]:size-4 data-[state=checked]:[&_span]:translate-x-3 data-[state=checked]:[&_span]:rtl:-translate-x-3"
          aria-label="Toggle attendance"
        />
      ),
    },
  ];
};

/* -------------------------------------------------------------------------- */
/*                              ENACT                                         */
/* -------------------------------------------------------------------------- */

export const enactTableColumn: ColumnDef<any>[] = [
  SelectColumn<any>(),

  codeColumn<any>("projectCode", "Project"),

  textColumn<any>("province", "Province", {
    maxWidth: "max-w-[140px]",
  }),

  textColumn<any>("indicatorRef", "Indicator", {
    maxWidth: "max-w-[220px]",
  }),

  textColumn<any>("councilorName", "Councilor", {
    maxWidth: "max-w-[180px]",
  }),

  textColumn<any>("raterName", "Rater", {
    maxWidth: "max-w-[180px]",
  }),

  textColumn<any>("type", "Type", {
    maxWidth: "max-w-[140px]",
  }),

  dateColumn<any>("date", "Date"),

  booleanColumn<any>("aprIncluded", "APR Included"),
];

/* -------------------------------------------------------------------------- */
/*                    DATABASE SUBMISSION / APPROVAL                          */
/* -------------------------------------------------------------------------- */

const getDatabaseStatus = (status: unknown) => {
  switch (status) {
    case "aprGenerated":
      return {
        status: "pending",
        label: "Pending APR Review",
      };

    case "thirdRejected":
    case "fourthRejected":
      return {
        status: "rejected",
        label: "APR Rejected",
      };

    case "firstRejected":
    case "secondRejected":
      return {
        status: "refused",
        label: "Refused",
      };

    case "reviewed":
      return {
        status: "reviewed",
        label: "Reviewed",
      };

    case "secondApproved":
      return {
        status: "validated",
        label: "Validated",
      };

    case "submitted":
    case "resubmitted":
      return {
        status: "submitted",
        label: status === "resubmitted" ? "Resubmitted" : "Submitted",
      };

    default:
      return {
        status: "approved",
        label: "Approved",
      };
  }
};

export const submittedAndFirstApprovedDatabasesTableColumn: ColumnDef<any>[] = [
  SelectColumn<any>(),

  codeColumn<any>("projectCode", "Project Code"),

  textColumn<any>("database", "Database", {
    maxWidth: "max-w-[220px]",
    className: "font-medium",
  }),

  textColumn<any>("province", "Province", {
    maxWidth: "max-w-[140px]",
  }),

  {
    accessorKey: "status",

    header: () => (
      <div className="text-xs font-semibold text-foreground">Status</div>
    ),

    cell: ({ row }) => {
      const result = getDatabaseStatus(row.getValue("status"));

      return <StatusBadge status={result.status} label={result.label} />;
    },
  },

  dateColumn<any>("fromDate", "From Date"),

  dateColumn<any>("toDate", "To Date"),
];

/* -------------------------------------------------------------------------- */
/*                         COMMUNITY DIALOGUE                                 */
/* -------------------------------------------------------------------------- */

export const communityDialoguesSessionTableColumns: ColumnDef<any>[] = [
  SelectColumn<any>(),

  textColumn<any>("type", "Type", {
    maxWidth: "max-w-[140px]",
    className: "font-medium",
  }),

  textColumn<any>("topic", "Topic", {
    maxWidth: "max-w-[240px]",
  }),

  dateColumn<any>("date", "Date"),
];

/* -------------------------------------------------------------------------- */
/*                         COMMUNITY DIALOGUES                                */
/* -------------------------------------------------------------------------- */

export const communityDialoguesTableColumns: ColumnDef<any>[] = [
  SelectColumn<any>(),

  textColumn<any>("name", "Name", {
    maxWidth: "max-w-[180px]",
  }),

  codeColumn<any>("projectCode", "Project Code"),

  textColumn<any>("focalPoint", "Focal Point", {
    maxWidth: "max-w-[180px]",
  }),

  textColumn<any>("province", "Province", {
    maxWidth: "max-w-[140px]",
  }),

  textColumn<any>("district", "District", {
    maxWidth: "max-w-[140px]",
  }),

  textColumn<any>("village", "Village", {
    maxWidth: "max-w-[160px]",
  }),

  textColumn<any>("numOfSessions", "Sessions", {
    maxWidth: "max-w-[90px]",
    className: "font-semibold tabular-nums",
  }),

  textColumn<any>("numOfGroups", "Groups", {
    maxWidth: "max-w-[90px]",
    className: "font-semibold tabular-nums",
  }),

  textColumn<any>("indicator", "Indicator", {
    maxWidth: "max-w-[220px]",
  }),
];

/* -------------------------------------------------------------------------- */
/*                                KIT                                         */
/* -------------------------------------------------------------------------- */

export const KitTableColumns: ColumnDef<any>[] = [
  SelectColumn<any>(),

  textColumn<any>("name", "Name", {
    maxWidth: "max-w-[200px]",
    className: "font-medium",
  }),

  textColumn<any>("description", "Description", {
    maxWidth: "max-w-[260px]",
    className: "text-muted-foreground",
  }),

  statusColumn<any>("status"),
];
