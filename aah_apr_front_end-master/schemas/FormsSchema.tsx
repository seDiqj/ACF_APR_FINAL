import { z } from "zod";

export const MainDatabaseBeneficiaryFormSchema = z.object({
  program: z.number().min(1, {
    error: "Select a valid program !",
  }),
  dateOfRegistration: z.string().min(1, "Date of registration is required !"),
  name: z.string().min(3, "Beneficiary name should be at least 3 characters !"),
  fatherHusbandName: z
    .string()
    .min(3, "Beneficiary father/husband name should be at least 3 characters"),
  gender: z.string().min(4, "Select a valid gender"),
  age: z
    .string()
    .min(1, "Beneficiary age should be greather then or equal to 1"),
  code: z
    .string()
    .min(
      1,
      "Beneficiary code should be at least one character or more then or equal to 1 digit !"
    ),
  childCode: z
    .string()
    .min(
      1,
      "Beneficiary child code should be at least one character or greater then or equal to 1 !"
    ),
  childAge: z.string().min(1, "Beneficiary child age should be at least 1 !"),
  phone: z
    .string()
    .min(
      10,
      "Beneficiary phone number should be at least 10 digits (Afganistan format) !"
    ),
  householdStatus: z.string().min(1, "Select a valid houshold status !"),
  maritalStatus: z.string().min(1, "Select a valid marital status !"),
  literacyLevel: z
    .string()
    .min(1, "Beneficiary litracy level should be at least one character !"),
  disabilityType: z.string().min(1, "Select a valid disability type !"),
});

export const MealToolFormSchema = z.object({
  beneficiary_id: z.coerce.number().min(1, "Beneficiary is required"),

  type: z.string().trim().min(1, "Type is required"),

  baselineDate: z.string().trim().min(1, "Baseline date is required"),

  endlineDate: z.string().trim().min(1, "Endline date is required"),

  baselineTotalScore: z
    .string()
    .trim()
    .min(1, "Baseline total score is required")
    .regex(/^\d+(\.\d+)?$/, "Baseline total score must be a number"),

  endlineTotalScore: z
    .string()
    .trim()
    .min(1, "Endline total score is required")
    .regex(/^\d+(\.\d+)?$/, "Endline total score must be a number"),

  improvementPercentage: z
    .string()
    .trim()
    .min(1, "Improvement percentage is required")
    .regex(/^\d+(\.\d+)?$/, "Improvement percentage must be a number"),

  isBaselineActive: z.boolean(),

  isEndlineActive: z.boolean(),

  evaluation: z.string().trim().min(1, "Evaluation is required"),

  baseline: z.string().trim().min(1, "Baseline assessment is required"),
  endline: z.string().trim().min(1, "Endline assessment is required"),
});

export const ChapterFormSchema = z
  .object({
    topic: z.string().trim().min(1, "Chapter topic is required !"),

    facilitatorName: z.string().trim().min(1, "Facilitator name is required !"),

    facilitatorJobTitle: z
      .string()
      .trim()
      .min(1, "Facilitator job title is required !"),

    startDate: z.string().trim().min(1, "Start date is required !"),

    endDate: z.string().trim().min(1, "End date is required !"),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date cannot be earlier than the start date !",
      });
    }
  });

export const KitDatabaseBeneficiaryFormSchema = z.object({
  program: z.number().min(1, {
    error: "Select a valid program !",
  }),

  indicators: z.array(z.number()).min(1, "Select at least one indicator !"),

  dateOfRegistration: z.string().min(1, "Date of registration is required !"),

  name: z.string().min(3, "Beneficiary name should be at least 3 characters !"),

  fatherHusbandName: z
    .string()
    .min(3, "Beneficiary father/husband name should be at least 3 characters"),

  gender: z.string().min(4, "Select a valid gender"),

  age: z
    .string()
    .min(1, "Beneficiary age should be greather then or equal to 1"),

  code: z
    .string()
    .min(
      1,
      "Beneficiary code should be at least one character or more then or equal to 1 digit !"
    ),

  childCode: z
    .string()
    .min(
      1,
      "Beneficiary child code should be at least one character or greater then or equal to 1 !"
    ),

  childAge: z.string().min(1, "Beneficiary child age should be at least 1 !"),

  phone: z
    .string()
    .min(
      10,
      "Beneficiary phone number should be at least 10 digits (Afganistan format) !"
    ),

  householdStatus: z.string().min(1, "Select a valid houshold status !"),

  maritalStatus: z.string().min(1, "Select a valid marital status !"),

  literacyLevel: z
    .string()
    .min(1, "Beneficiary litracy level should be at least one character !"),

  disabilityType: z.string().min(1, "Select a valid disability type !"),

  referredForProtection: z.boolean("Select a valid option !"),
});

export const CdDatabaseBenefciaryFormSchema = z.object({
  dateOfRegistration: z.string("Select a valid date"),
  name: z.string().min(3, "Beneficiary name should be at least 3 characters !"),
  fatherHusbandName: z
    .string()
    .min(3, "Beneficiary father/husband name should be at least 3 characters"),
  gender: z.string().min(4, "Select a valid gender"),
  age: z
    .string()
    .min(1, "Beneficiary age should be greather then or equal to 1"),
  phone: z
    .string()
    .min(
      10,
      "Beneficiary phone number should be at least 10 digits (Afganistan format) !"
    ),
  maritalStatus: z.string().min(1, "Select a valid marital status !"),
  nationalId: z
    .string()
    .min(3, "National id should be at least 3 characters or 3 digits !"),
  jobTitle: z
    .string("Job title is required !")
    .min(1, "Job title is required !"),
  code: z
    .string()
    .min(1, "Beneficiary code should be at least one character !"),
  incentiveReceived: z.boolean("Incentive received status is required !"),
  incentiveAmount: z
    .string("Incentive amount is required !")
    .min(1, "Incentive amount is required !"),
});

export const KitFormSchema = z.object({
  kitId: z.number().min(1, "Select a kit !"),

  destribution_date: z.string().min(1, "Distribution date is required !"),

  remark: z.string().min(1, "Remark is required !"),

  is_received: z.boolean({
    error: "Select a valid option !",
  }),
});

const CommunityDialogueSessionSchema = z.object({
  id: z.number().nullable().optional(),

  type: z.enum(["initial", "followUp"]),

  topic: z.string().trim(),

  date: z.string().trim(),
});

export const CdFormSchema = z.object({
  project_id: z.coerce.number().min(1, "Select a valid project !"),

  name: z
    .string()
    .trim()
    .min(3, "Program name should be at least 3 characters !"),

  province_id: z.coerce.number().min(1, "Select a valid province !"),

  district_id: z.coerce.number().min(1, "Select a valid district !"),

  indicator_id: z.coerce.number().min(1, "Select a valid indicator !"),

  village: z.string().trim().min(1, "Village name is required !"),

  focalPoint: z
    .string()
    .trim()
    .min(3, "Focal point should be at least 3 characters !"),

  cdName: z
    .string()
    .trim()
    .min(3, "Community dialogue name should be at least 3 characters !"),

  sessions: z
    .array(CommunityDialogueSessionSchema)
    .min(1, "Initial session is required !")
    .superRefine((sessions, ctx) => {
      /*
       * ============================================
       * INITIAL SESSION
       * ============================================
       */

      const initialSession = sessions[0];

      if (!initialSession || initialSession.type !== "initial") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [0],
          message: "Initial session is required !",
        });

        return;
      }

      // Initial session topic is required
      if (!initialSession.topic.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [0, "topic"],
          message: "Initial session topic is required !",
        });
      }

      // Initial session date is required
      if (!initialSession.date.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [0, "date"],
          message: "Initial session date is required !",
        });
      }

      /*
       * ============================================
       * FOLLOW-UP SESSIONS
       * ============================================
       *
       * If a follow-up session exists, BOTH
       * topic and date must be provided.
       */

      sessions.forEach((session, index) => {
        if (index === 0) return;

        if (session.type !== "followUp") return;

        // Follow-up topic
        if (!session.topic.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "topic"],
            message: `Follow up session ${index} topic is required !`,
          });
        }

        // Follow-up date
        if (!session.date.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "date"],
            message: `Follow up session ${index} date is required !`,
          });
        }
      });
    }),
});

/* -------------------------------------------------------------------------- */
/*                         Training Chapter Schema                             */
/* -------------------------------------------------------------------------- */

export const TrainingChapterSchema = z
  .object({
    id: z.coerce.number().nullable().optional(),

    topic: z.string().trim().min(1, "Chapter topic is required"),

    facilitatorName: z.string().trim().min(1, "Facilitator name is required"),

    facilitatorJobTitle: z
      .string()
      .trim()
      .min(1, "Facilitator job title is required"),

    startDate: z.string().trim().min(1, "Chapter start date is required"),

    endDate: z.string().trim().min(1, "Chapter end date is required"),
  })
  .superRefine((chapter, ctx) => {
    if (
      chapter.startDate &&
      chapter.endDate &&
      chapter.startDate > chapter.endDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date cannot be earlier than the start date.",
      });
    }
  });

/* -------------------------------------------------------------------------- */
/*                           Training Form Schema                              */
/* -------------------------------------------------------------------------- */

export const TrainingFormSchema = z.object({
  project_id: z.coerce.number().min(1, "Select a valid project!"),

  province_id: z.coerce.number().min(1, "Select a valid province!"),

  district_id: z.coerce.number().min(1, "Select a valid district!"),

  indicator_id: z.coerce.number().min(1, "Select a valid indicator!"),

  trainingLocation: z
    .string()
    .trim()
    .min(2, "Training location must be at least 2 characters"),

  name: z.string().trim().min(2, "Training name must be at least 2 characters"),

  participantCatagory: z.string().trim().min(1, "Select participant category"),

  aprIncluded: z.boolean(),

  trainingModality: z.string().trim().min(1, "Select training modality"),

  startDate: z.string().trim().min(1, "Start date is required"),

  endDate: z.string().trim().min(1, "End date is required"),

  chapters: z.array(TrainingChapterSchema),
});

export const TrainingDatabaseBenefeciaryFormSchema = z.object({
  dateOfRegistration: z
    .string()
    .trim()
    .min(1, "Date of registration is required !"),
  name: z
    .string()
    .trim()
    .min(3, "Beneficiary name should be at least 3 characters !"),
  fatherHusbandName: z
    .string()
    .trim()
    .min(
      3,
      "Beneficiary father/husband name should be at least 3 characters !"
    ),
  gender: z.string().trim().min(1, "Select a valid gender !"),
  age: z
    .string()
    .trim()
    .min(1, "Beneficiary age is required !")
    .regex(/^\d+$/, "Age must be a valid number !")
    .refine(
      (value) => Number(value) >= 1,
      "Beneficiary age should be greater than or equal to 1 !"
    ),
  phone: z
    .string()
    .trim()
    .min(
      10,
      "Beneficiary phone number should be at least 10 digits (Afghanistan format) !"
    )
    .regex(/^\d+$/, "Phone number must contain digits only !"),
  email: z
    .string()
    .trim()
    .min(1, "Email field is required !")
    .email("Please enter a valid email address !"),
  code: z.string().trim().min(1, "Beneficiary code is required !"),
  participantOrganization: z
    .string()
    .trim()
    .min(1, "Participant organization is required !"),
  jobTitle: z.string().trim().min(1, "Job title is required !"),
});

export const PsychoeducationFormSchema = z.object({
  programInformation: z.object({
    project_id: z.number("Select a valid project"),
    indicator_id: z.number("Select a valid indicator !"),
    name: z.string().min(3, "Program name should be at least 3 characters !"),
    focalPoint: z
      .string("Focal point must be at least 3 characters or 3 digits !")
      .min(3, "Focal point must be at least 3 characters or 3 digits !"),
    province_id: z.number("Select a valid province !"),
    district_id: z.number("Select a valid district !"),
    siteCode: z
      .string("Site code should be at least 1 character or 1 digit !")
      .min(1, "Site code should be at least 1 character or 1 digit !"),
    village: z
      .string("Village name should be at least 2 characters !")
      .min(2, "Village name should be at least 2 characters !"),
    healthFacilityName: z
      .string("Health facility name is required !")
      .min(1, "Health facility name is required !"),
    interventionModality: z
      .string("Intervention modality is required !")
      .min(1, "Intervention modality is required !"),
  }),
  psychoeducationInformation: z.object({
    awarenessTopic: z.string().min(1, "Awareness topic is required !"),
    awarenessDate: z.string().min(1, "Awareness date is required !"),
  }),
});

export const AssessmentFormSchema = z.object({
  project_id: z.coerce.number().min(1, "Select a valid project !"),

  indicator_id: z.coerce.number().min(1, "Select a valid indicator !"),

  province_id: z.coerce.number().min(1, "Select a valid province !"),

  councilorName: z
    .string()
    .trim()
    .min(3, "Councilor name should be at least 3 characters !"),

  raterName: z
    .string()
    .trim()
    .min(3, "Rater name should be at least 3 characters !"),

  type: z.string().trim().min(1, "Select a valid type !"),

  date: z.string().trim().min(1, "Date of assessment is required !"),

  aprIncluded: z.boolean(),
});

export const UserFormSchema = z.object({
  name: z
    .string("The name field should be at least 3 characters !")
    .trim()
    .min(3, "The name should be at least 3 characters !"),

  title: z
    .string("Title field should be at least 3 characters !")
    .trim()
    .min(3, "Title field should be at least 3 characters !"),

  email: z.email("Enter a valid email address !"),

  /*
   * Password is optional here because it is only required
   * when creating a user.
   *
   * When provided, it must contain at least 7 characters.
   */
  password: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || value.length >= 7,
      "Password must be at least 7 characters !"
    ),

  role: z
    .string("Select a valid role !")
    .trim()
    .min(1, "Select a valid role !"),

  status: z
    .string("Select a valid status !")
    .trim()
    .min(1, "Select a valid status !"),
});

export const SubmitNewDBSchema = z
  .object({
    project_id: z.number().min(1, "Project is required !"),

    database_id: z.number().min(1, "Database is required !"),

    province_id: z.number().min(1, "Province is required !"),

    manager_id: z.number().min(1, "Manager is required !"),

    fromDate: z.string().trim().min(1, "From date is required !"),

    toDate: z.string().trim().min(1, "To date is required !"),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toDate"],
        message: "To date cannot be earlier than the from date !",
      });
    }
  });

export const RoleFormSchema = z.object({
  name: z
    .string("The name field should be at least 3 characters !")
    .trim()
    .min(3, "The name should be at least 3 characters !"),
});

export const SubmittNewDatabaseFormSchema = z.object({
  project_id: z.number("Select a valid project"),
  database_id: z.number("Select a valid database !"),
  province_id: z.number("Select a valid province !"),
  fromMonth: z.string("Select a valid date"),
  fromYear: z.string("Select a valid date"),
  toMonth: z.string("Select a valid date"),
  toYear: z.string("Select a valid date"),
});

export const ProjectFormSchema = z.object({
  projectCode: z.string().min(1, "Project code is required!"),
  projectTitle: z.string().min(1, "Project title is required!"),
  projectGoal: z.string().min(1, "Project goal is required!"),
  projectDonor: z.string().min(1, "Project donor is required!"),
  startDate: z.string().min(1, "Start date is required!"),
  endDate: z.string().min(1, "End date is required!"),
  status: z.string().min(1, "Select a valid status!"),
  projectManager: z.string().min(1, "Project manager is required!"),
  provinces: z
    .array(z.string())
    .min(1, { message: "Select at least one valid province!" }),
  thematicSector: z
    .array(z.string())
    .min(1, { message: "Select at least one thematic sector!" }),
  reportingPeriod: z.string().min(1, "Reporting period is required!"),
  reportingDate: z.string().min(1, "Reporting date is required!"),
  aprStatus: z.string().min(1, "Select a valid APR status!"),
  description: z.string().min(1, "Description is required!"),
});

export const OutcomeFormSchema = z.object({
  outcome: z.string().min(1, "Outcome is requried !"),
  outcomeRef: z.string().min(1, "Outcome referance is required!"),
});

export const OutputFormSchema = z.object({
  outcomeId: z.number().min(1, "Outcome referance is required !"),
  output: z.string().min(1, "Output is requried !"),
  outputRef: z.string().min(1, "Output referance is required!"),
});

const ProvinceSchema = z.object({
  province: z.string().min(1, "Province name is required"),
  target: z.number().min(0, "Target must be non-negative"),
  councilorCount: z.number().min(0, "Councilor count must be non-negative"),
});

const SubIndicatorSchema = z.object({
  indicatorRef: z.string().min(1, "Indicator reference is required"),
  name: z.string().min(1, "SubIndicator name is required"),
  target: z.number().min(0, "Target must be non-negative"),
  dessaggregationType: z.enum(["session", "indevidual"]).or(z.string()),
  provinces: z
    .array(ProvinceSchema)
    .min(1, "At least one province is required"),
});

export const IndicatorFormSchema = z.object({
  id: z.string().nullable(),
  outputId: z.string().nullable(),
  outputRef: z.string().min(1, "Output reference is required!"),
  indicator: z.string().min(1, "Indicator name is required!"),
  indicatorRef: z.string().min(1, "Indicator reference is required!"),
  target: z.number().min(0, "Target must be a non-negative number!"),
  status: z.enum([
    "notStarted",
    "inProgress",
    "achived",
    "notAchived",
    "partiallyAchived",
  ]),
  database: z.string().min(1, "Database field is required!"),
  type: z.string().nullable(),
  provinces: z
    .array(ProvinceSchema)
    .min(1, "Select at least one valid province!"),
  dessaggregationType: z.enum(["session", "indevidual", "enact"]),
  description: z.string().min(1, "Description is required!"),
  subIndicator: SubIndicatorSchema.nullable(),
});

export const MainDatabaseProgramFormSchema = z.object({
  project_id: z.number().min(1, "Project code is required"),
  name: z.string().min(3, "Program name should be at least 3 characters !"),
  focalPoint: z
    .string()
    .min(3, "Focal point must be at least 3 characters or 3 digits"),
  province: z.string().min(1, "Select a valid province"),
  district: z.string().min(1, "Select a valid district"),
  village: z.string().min(1, "Village name should be at least 2 characters"),
  siteCode: z.string().min(1, "Site code should be at least 1 characters !"),
  healthFacilityName: z.string().min(3, "Health facility name is required"),
  interventionModality: z.string().min(1, "Intervention modality is required"),
});

export const KiteFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Kit name is required")
    .min(3, "Kit name must be at least 3 characters"),

  status: z
    .string()
    .trim()
    .min(1, "Kit status is required"),

  description: z
    .string()
    .trim()
    .min(1, "Kit description is required"),
});

export const KitDatabaseProgramFormSchema = z.object({
  project_id: z.number().min(1, "Project code is required"),
  name: z.string().min(3, "Program name should be at least 3 characters !"),
  focalPoint: z
    .string()
    .min(3, "Focal point must be at least 3 characters or 3 digits"),
  province: z.string().min(1, "Select a valid province"),
  district: z.string().min(1, "Select a valid district"),
  village: z.string().min(1, "Village name should be at least 2 characters"),
  siteCode: z.string().min(1, "Site code should be at least 1 characters !"),
  healthFacilityName: z.string().min(3, "Health facility name is required"),
  interventionModality: z.string().min(1, "Intervention modality is required"),
});

export const IndicatorSchema = z
  .object({
    outputId: z.number(),
    indicator: z.string().min(1, "Indicator name is required"),
    indicatorRef: z.string().min(1, "Indicator reference is required"),
    target: z.number().min(0, "Target must be non-negative"),
    status: z.string().min(1, "Status is required"),
    database: z.string().min(1, "Database name is required"),
    type: z.string().nullable(),
    provinces: z
      .array(ProvinceSchema)
      .min(1, "At least one province is required"),
    dessaggregationType: z
      .enum(["session", "indevidual", "enact"])
      .or(z.string()),
    subIndicator: SubIndicatorSchema.nullable(),
    parent_indicator: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.database === "main_database" &&
      (!data.type || data.type.trim() === "")
    ) {
      ctx.addIssue({
        path: ["type"],
        code: z.ZodIssueCode.custom,
        message: "Type is required when database is 'main_database'",
      });
    }
  });

// Dessaggregation Schema
export const DessaggregationSchema = z.object({
  id: z.string().nullable(),
  indicatorId: z.string().nullable(),
  indicatorRef: z.string().min(1, "Indicator reference is required"),
  dessaggration: z.string().min(1, "Dessaggregation type is required"),
  province: z.string().min(1, "Province name is required"),
  target: z.number().min(0, "Target must be non-negative"),
});

// Isp3 Schema
export const Isp3Schema = z.object({
  name: z.string().min(1, "Name is required"),
  indicators: z.array(z.string()).min(1, "At least one indicator is required"),
});
