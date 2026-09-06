import {
  Dessaggregation,
  Indicator,
  Outcome,
  Output,
  SubIndicator,
} from "@/app/(main)/projects/types/Types";
import {
  aprFinalizationSteps,
  projectAprStatusList,
} from "@/app/(main)/projects/utils/OptionLists";
import { RemoveIdFielsFromObj } from "@/helpers/GlobalHelpers";
import {
  NO_OUTCOME_DEFAULT_OUTCOME,
  NO_OUTCOME_DEFAULT_REFERANCE,
} from "../config/System";

export const IsValidAprStatus = (status: string) => {
  return projectAprStatusList.includes(status);
};

export const IsEnteredStatusLocaltedAtTheLowerLevelThenTheCurrentStatus = (
  projectAprStatus: string,
  status: string,
) => {
  const projectCurrentStatusValue: undefined | number =
    aprFinalizationSteps.find(
      (step) =>
        step.acceptStatusValue == projectAprStatus ||
        step.rejectStatusValue == projectAprStatus,
    )?.stepValue;

  const inputAcceptStatusValue: undefined | number = aprFinalizationSteps.find(
    (step) => step.acceptStatusValue == status,
  )?.stepValue;

  return (
    projectCurrentStatusValue &&
    inputAcceptStatusValue &&
    projectCurrentStatusValue > inputAcceptStatusValue!
  );
};

export const IsEnteredStatusCallsToRejectAtTheLevelAboveTheCurrentLimit = (
  projectAprStatus: string,
  status: string,
) => {
  const projectCurrentStatusValue: undefined | number =
    aprFinalizationSteps.find(
      (step) =>
        step.acceptStatusValue == projectAprStatus ||
        step.rejectStatusValue == projectAprStatus,
    )?.stepValue;

  const inputRejectStatusValue: undefined | number = aprFinalizationSteps.find(
    (step) => step.rejectStatusValue == status,
  )?.stepValue;

  return (
    projectCurrentStatusValue &&
    inputRejectStatusValue &&
    projectCurrentStatusValue < inputRejectStatusValue!
  );
};

export const IsEnteredStatusCallingToBeApproveAtLevelAboveTheAllowedLevel = (
  projectAprStatus: string,
  status: string,
) => {
  let isRejected: boolean = false;

  const projectCurrentStatusValue: undefined | number =
    aprFinalizationSteps.find((step) => {
      if (step.acceptStatusValue == projectAprStatus) return true;
      else if (step.rejectStatusValue == projectAprStatus) {
        isRejected = true;
        return true;
      }
      return false;
    })?.stepValue;

  const inputRejectStatusValue: undefined | number = aprFinalizationSteps.find(
    (step) =>
      step.rejectStatusValue == status || step.acceptStatusValue == status,
  )?.stepValue;

  return (
    projectCurrentStatusValue &&
    inputRejectStatusValue &&
    (projectCurrentStatusValue - inputRejectStatusValue) * -1 >=
      (isRejected ? 1 : 2)
  );
};

export const IsMainDatabaseNotAvailableForSelection = (
  indicators: Indicator[],
) => {
  return (
    indicators.find(
      (indicator) =>
        indicator.database == "main_database" &&
        indicator.type == "adult_psychosocial_support",
    ) &&
    indicators.find(
      (indicator) =>
        indicator.database == "main_database" &&
        indicator.type == "child_psychosocial_support",
    ) &&
    indicators.find(
      (indicator) =>
        indicator.database == "main_database" &&
        indicator.type == "parenting_skills",
    ) &&
    indicators.find(
      (indicator) =>
        indicator.database == "main_database" &&
        indicator.type == "child_care_practices",
    )
  );
};

export const IsMainDatabaseAvailableForMe = (
  indicators: Indicator[],
  indicator: Indicator,
) => {
  return !(
    indicators.find(
      (ind) =>
        ind.id != indicator.id &&
        ind.database == "main_database" &&
        ind.type == "adult_psychosocial_support",
    ) &&
    indicators.find(
      (ind) =>
        ind.id != indicator.id &&
        ind.database == "main_database" &&
        ind.type == "child_psychosocial_support",
    ) &&
    indicators.find(
      (ind) =>
        ind.id != indicator.id &&
        ind.database == "main_database" &&
        ind.type == "parenting_skills",
    ) &&
    indicators.find(
      (ind) =>
        ind.id != indicator.id &&
        ind.database == "main_database" &&
        ind.type == "child_care_practices",
    )
  );
};

export const IsMainDatabaseMealtoolTargetAvailableForMe = (
  Indicators: Indicator[],
  indicator: Indicator,
) => {
  return Indicators.find(
    (ind) =>
      ind.database == "main_database_meal_tool" && ind.id != indicator.id,
  );
};

export const IsCurrentTypeOptionAvailable = (
  indicators: Indicator[],
  option: { value: string; label: string },
  localIndicator: Indicator,
) => {
  return indicators.find(
    (indicator) =>
      indicator.database == "main_database" &&
      indicator.type == option.value &&
      indicator.id !== localIndicator.id,
  );
};

export const IsMainDatabase = (indicator: Indicator) => {
  return indicator.database == "main_database";
};

export const HasSubIndicator = (
  indicator: Indicator,
): indicator is Indicator => {
  return indicator.subIndicator !== null;
};

export const isTheTotalTargetOfDessaggregationsEqualToTotalTargetOfIndicator = (
  selectedIndicator: Indicator,
  dessaggregations: Dessaggregation[],
) => {
  const selectedIndicatorId = selectedIndicator.id;
  const subIndicatorId = selectedIndicator.subIndicator?.id ?? null;

  let mainTotal = 0;
  let subTotal = 0;

  dessaggregations.forEach((d) => {
    if (d.indicatorId == selectedIndicatorId) mainTotal += Number(d.target);
    if (subIndicatorId && d.indicatorId == subIndicatorId)
      subTotal += Number(d.target);
  });

  const mainTarget = Number(selectedIndicator.target ?? 0);
  const subTarget = Number(selectedIndicator.subIndicator?.target ?? 0);

  if (mainTarget === mainTotal && (!subIndicatorId || subTarget === subTotal)) {
    return false;
  }

  return true;
};

export const IsThereAnyOutputWithEnteredReferance = (
  outputs: Output[],
  enteredReferance: string,
) => {
  return outputs.some((output) => output.outputRef == enteredReferance);
};

export const IsThereAnyOutputWithEnteredReferanceAndDefferentId = (
  outputs: Output[],
  enteredOutput: Output,
) => {
  return outputs.some(
    (output) =>
      output.outputRef === enteredOutput.outputRef &&
      output.id !== enteredOutput.id,
  );
};

export const IsThereAnyOutcomeWithEnteredReferance = (
  outcomes: Outcome[],
  outcome: Outcome,
) => {
  return outcomes.some((o) => o.outcomeRef == outcome.outcomeRef);
};

export const IsThereAnyOutcomeWithEnteredReferanceAndDefferentId = (
  outcomes: Outcome[],
  outcome: Outcome,
) => {
  return outcomes.some(
    (o) => o.outcomeRef == outcome.outcomeRef && o.id != outcome.id,
  );
};

export const IsCreateMode = (
  mode: "create" | "edit" | "update" | "show" | "select",
): boolean => {
  return mode == "create";
};

export const IsEditMode = (
  mode: "create" | "edit" | "update" | "show" | "select",
): boolean => {
  return mode == "edit" || mode == "update";
};

export const IsShowMode = (
  mode: "create" | "edit" | "update" | "show" | "select",
): boolean => {
  return mode == "show";
};

export const IsNotCreateMode = (
  mode: "create" | "edit" | "update" | "show",
): boolean => {
  return mode != "create";
};

export const IsNotEditMode = (
  mode: "create" | "edit" | "update" | "show",
): boolean => {
  return mode != "edit" && mode != "update";
};

export const IsNotShowMode = (
  mode: "create" | "edit" | "update" | "show" | "select",
): boolean => {
  return mode != "show";
};

export const IsSelectMode = (
  mode: "create" | "edit" | "update" | "show" | "select",
): boolean => {
  return mode == "select";
};

export const IsCreateOrEditMode = (
  mode: "create" | "edit" | "update" | "show",
): boolean => {
  return mode == "create" || mode == "edit" || mode == "update";
};

export const IsEditOrShowMode = (
  mode: "create" | "edit" | "update" | "show" | "select",
): boolean => {
  return mode == "edit" || mode == "update" || mode == "show";
};

export const IsCreateOrShowMode = (
  mode: "create" | "edit" | "update" | "show",
): boolean => {
  return mode == "create" || mode == "show";
};

export const HasDessaggregationTheseFeature = (
  dessaggregation: Dessaggregation,
  description: string,
  province: string,
  indicatorRef: string,
) => {
  return (
    dessaggregation.dessaggration === description &&
    dessaggregation.province === province &&
    dessaggregation.indicatorRef === indicatorRef
  );
};

export const IsTotalOfDessaggregationsOfProvinceBiggerThenTotalOfProvince = (
  dessaggregationsTotal: number,
  provinceTotal: number,
): boolean => {
  return dessaggregationsTotal > provinceTotal;
};

export const IsTotalOfDessaggregationsOfProvinceLessThenTotalOfProvince = (
  dessaggregationsTotal: number,
  provinceTotal: number,
): boolean => {
  return dessaggregationsTotal < provinceTotal;
};

export const WasIndexFound = (index: number) => {
  return index !== -1;
};

export const IsTheDessaggregationOfThisIndicatorAndProvince = (
  dessaggration: Dessaggregation,
  province: string,
  indicatorRef: string,
): boolean => {
  return (
    dessaggration.province === province &&
    dessaggration.indicatorRef === indicatorRef
  );
};

export const IsIndicatorDatabaseMainDatabase = (indicator: Indicator) => {
  return indicator.database == "main_database";
};

export const IsIndicatorDatabaseEnactDatabase = (indicator: Indicator) => {
  return indicator.database == "enact_database";
};

export const IsNotIndicatorDatabaseEnactDatabase = (indicator: Indicator) => {
  return indicator.database != "enact_database";
};

export const AreDessaggregationsTheSame = (
  firstDessaggregation: Dessaggregation,
  secondDessaggregation: Dessaggregation,
): boolean => {
  return (
    firstDessaggregation.dessaggration == secondDessaggregation.dessaggration &&
    firstDessaggregation.indicatorRef == secondDessaggregation.indicatorRef &&
    firstDessaggregation.province == secondDessaggregation.province &&
    firstDessaggregation.target == secondDessaggregation.target
  );
};

export const AreDessaggregationsEdited = (
  dessaggrationsBeforeEdit: Dessaggregation[],
  dessaggrationsAfterEdit: Dessaggregation[],
): boolean => {
  let areEqual: boolean = true;

  if (dessaggrationsBeforeEdit.length != dessaggrationsAfterEdit.length)
    areEqual = false;

  if (areEqual)
    for (let dessaggration of dessaggrationsBeforeEdit)
      areEqual = !!dessaggrationsAfterEdit.find((d) =>
        AreDessaggregationsTheSame(d, dessaggration),
      );

  return !areEqual;
};

export const IsIdFeild = (feildName: string): boolean => {
  return feildName == "id" || feildName == "project_id";
};

export const IsCurrentTypeOptionIsTheCurrentIndicatorOption = (
  indicator: Indicator,
  typeOption: string,
): boolean => {
  return (indicator.type as unknown as string) === typeOption;
};

export const IsCurrentTypeOptionHasBeenTakenByOtherIndicators = (
  indicators: Indicator[],
  typeOption: string,
): boolean => {
  return !indicators.find(
    (indicator) =>
      indicator.database == "main_database" && indicator.type == typeOption,
  );
};

export const IsThereAnyIndicatorWithEnteredReferance = (
  indicators: Indicator[],
  enteredRef: string,
): boolean => {
  return indicators.some((indicator) => indicator.indicatorRef == enteredRef);
};

export const IsThereAndIndicatorWithEnteredReferanceAndDefferentId = (
  indicators: Indicator[],
  indicator: Indicator,
): boolean => {
  return indicators.some(
    (i) => i.indicatorRef == indicator.indicatorRef && i.id !== indicator.id,
  );
};

export const IsIndicatorRelatedToThisOutput = (
  outputId: number,
  indicatorOutputId: number,
): boolean => {
  return outputId === indicatorOutputId;
};

export const IsOutputRelatedToThisOutcome = (
  outcomeId: number,
  outputOutcomeId: number,
): boolean => {
  return outcomeId === outputOutcomeId;
};

export const IsNotMainDatabase = (database: string): boolean => {
  return database != "main_database";
};

export const IsOutputSaved = (output: Output): boolean => {
  return output.id !== null;
};

export const IsOutcomeSaved = (outcome: Outcome): boolean => {
  return outcome.id !== null;
};

export const IsNoOutcome = (outcome: Outcome | string): boolean => {
  if (typeof outcome == "string") {
    if (
      outcome == NO_OUTCOME_DEFAULT_REFERANCE ||
      outcome == NO_OUTCOME_DEFAULT_OUTCOME
    )
      return true;
    else return false;
  } else {
    return (
      outcome.outcomeRef == NO_OUTCOME_DEFAULT_REFERANCE ||
      outcome.outcome == NO_OUTCOME_DEFAULT_OUTCOME
    );
  }
};

export const IsANullValue = (value: any): value is null => {
  return value == null;
};

export const IsNotANullValue = (value: any): boolean => {
  return value != null;
};

export const IsCreatePage = (
  pageIdentifier: "create" | "edit" | "show",
): boolean => {
  return pageIdentifier == "create";
};

export const IsEditPage = (
  pageIdentifier: "create" | "edit" | "show",
): boolean => {
  return pageIdentifier == "edit";
};

export const IsShowPage = (
  pageIdentifier: "create" | "edit" | "show",
): boolean => {
  return pageIdentifier == "show";
};

export const IsIndicatorSaved = (indicator: Indicator): boolean => {
  return IsNotANullValue(indicator.id);
};

export const NotSavedYet = (value: any): boolean => {
  return value.id == null;
};

export const IsDessaggregationSaved = (
  dessaggration: Dessaggregation,
): boolean => {
  return IsNotANullValue(dessaggration.id);
};

export const isNotASubIndicator = (
  subIndicator: SubIndicator | null,
): subIndicator is null => {
  return subIndicator == null;
};

export const NoProvinceSelectedForIndicator = (
  indicator: Indicator,
): boolean => {
  return indicator.provinces.length == 0;
};

export const NoProvinceSelectedForSubIndicator = (
  subIndicator: SubIndicator,
): boolean => {
  return subIndicator.provinces.length == 0;
};

export const AtLeastOneProvinceSelectedForIndicator = (
  indicator: Indicator,
): boolean => {
  return indicator.provinces.length >= 1;
};

export const AreObjectsStructureBaseShallowEqual = (
  first: Object,
  second: Object,
): boolean => {
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);

  if (firstKeys.length !== secondKeys.length) return false;

  return firstKeys.every((key) => (first as any)[key] == (second as any)[key]);
};

export const AreObjectsStructureBaseDeepEqual = (
  first: any,
  second: any,
): boolean => {
  if (first === second) return true;

  if (
    typeof first !== "object" ||
    typeof second !== "object" ||
    first === null ||
    second === null
  )
    return false;

  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);

  for (const key of firstKeys) {
    if (!secondKeys.includes(key)) return false;
    if (!AreObjectsStructureBaseDeepEqual(first[key], second[key]))
      return false;
  }

  return true;
};

export const AreArraysShallowEqual = (first: any[], second: any[]): boolean => {
  if (first.length !== second.length) return false;

  const secondCopy = [...second];
  for (const itemFirst of first) {
    const index = secondCopy.findIndex((item) => IsEqual(item, itemFirst));
    if (index === -1) return false;
    secondCopy.splice(index, 1);
  }
  return true;
};

export const IsEqual = (first: any, second: any): boolean => {
  if (first === second) return true;

  if (
    IsTypeOfValuesSameAndPrimitive(first, second) &&
    IsValuesEqual(first, second)
  )
    return true;

  if (
    IsNonPrimitiveType(first) &&
    IsNonPrimitiveType(second) &&
    AreObjectsValueBaseDeepEqual(first, second)
  )
    return true;

  return false;
};

export const AreArraysDeepEqual = (first: any[], second: any[]): boolean => {
  if (first.length != second.length) return false;

  for (const index in first) if (first[index] !== second[index]) return false;

  return true;
};

export const IsTypeOfValuesEqual = (first: any, second: any): boolean => {
  return typeof first === typeof second;
};

export const IsValuesEqual = (first: any, second: any): boolean => {
  return first === second;
};

export const IsPrimitiveType = (value: any): boolean => {
  return (
    typeof value == "string" ||
    typeof value == "boolean" ||
    typeof value == "number" ||
    typeof value == null ||
    typeof value == undefined ||
    typeof value == "symbol" ||
    typeof value == "bigint"
  );
};

export const IsPrimitiveTypeAndNotNullOrUndefined = (value: any): boolean => {
  return IsNotANullOrUndefinedValue(value) && IsPrimitiveType(value);
};

export const IsNonPrimitiveType = (value: any): boolean => {
  return typeof value == "object";
};

export const IsNonePrimitiveTypeAndNotNullOrUndefined = (
  value: any,
): boolean => {
  return IsNotANullOrUndefinedValue(value) && IsNonPrimitiveType(value);
};

export const IsTypeOfValuesSameAndPrimitive = (
  first: any,
  second: any,
): boolean => {
  return (
    IsTypeOfValuesEqual(first, second) &&
    IsPrimitiveType(first) &&
    IsPrimitiveType(second)
  );
};

export const IsAUndefinedValue = (value: any): boolean => {
  return value === undefined;
};

export const IsANullOrUndefinedValue = (value: any): boolean => {
  return value === null || value == undefined;
};

export const AreObjectsValueBaseDeepEqual = (
  first: any,
  second: any,
): boolean => {
  const checkIfObjectsAreStructureBaseDeepEqual =
    AreObjectsStructureBaseDeepEqual(first, second);

  if (checkIfObjectsAreStructureBaseDeepEqual) {
    const firstKeys = Object.keys(first);

    for (const key of firstKeys) {
      if (!IsTypeOfValuesEqual(first[key], second[key])) {
        console.log(1);
        return false;
      } else if (
        IsTypeOfValuesSameAndPrimitive(first[key], second[key]) &&
        first[key] !== second[key]
      )
        return false;
      else if (
        Array.isArray(first[key]) &&
        Array.isArray(second[key]) &&
        !AreArraysShallowEqual(first[key], second[key])
      )
        return false;
      else if (
        IsNonePrimitiveTypeAndNotNullOrUndefined(first[key]) &&
        !AreObjectsValueBaseDeepEqual(first[key], second[key])
      )
        return false;
      else if (
        IsANullOrUndefinedValue(first[key]) &&
        IsANullOrUndefinedValue(second[key]) &&
        !(first[key] === second[key])
      )
        return false;
    }

    return true;
  }

  return false;
};

export const IsIndicatorEdited = (
  indicatorBeforeEdit: Indicator,
  indicatorAfterEdit: Indicator,
): boolean => {
  const indicatorBeforeEditCopy = { ...indicatorBeforeEdit };
  const indicatorAfterEditCopy = { ...indicatorAfterEdit };

  const indicatorBeforeEditCopyWithoutIdFeilds = RemoveIdFielsFromObj(
    indicatorBeforeEditCopy,
  );
  const indicatorAfterEditCopyWithoutIdFeilds = RemoveIdFielsFromObj(
    indicatorAfterEditCopy,
  );

  return !AreObjectsValueBaseDeepEqual(
    indicatorBeforeEditCopyWithoutIdFeilds,
    indicatorAfterEditCopyWithoutIdFeilds,
  );
};

export const IsOutcomeEdited = (
  outcomeBeforeEdit: Outcome,
  outcomeAfterEdit: Outcome,
): boolean => {
  const outcomeBeforeEditCopyWithoutIdFeilds =
    RemoveIdFielsFromObj(outcomeBeforeEdit);
  const outcomeAfterEditCopyWithoutIdFeilds =
    RemoveIdFielsFromObj(outcomeAfterEdit);

  return !AreObjectsValueBaseDeepEqual(
    outcomeBeforeEditCopyWithoutIdFeilds,
    outcomeAfterEditCopyWithoutIdFeilds,
  );
};

export const IsOutputEdited = (
  outputBeforeEdit: Output,
  outputAfterEdit: Output,
): boolean => {
  const outputBeforeEditCopyWithoutIdFeilds =
    RemoveIdFielsFromObj(outputBeforeEdit);
  const outputAfterEditCopyWithoutIdFeilds =
    RemoveIdFielsFromObj(outputAfterEdit);

  return !AreObjectsValueBaseDeepEqual(
    outputBeforeEditCopyWithoutIdFeilds,
    outputAfterEditCopyWithoutIdFeilds,
  );
};

export const IsNotANullOrUndefinedValue = (value: any): boolean => {
  return value !== null && value !== undefined;
};

export function IsDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export const IsEnterKey = (key: string): key is "Enter" => {
  return key === "Enter";
};

export const IsDeleteKey = (key: string): key is "Delete" => {
  return key === "Delete";
};

export const IsCtrlKeyPressed = (ctrlKey: boolean): ctrlKey is true => {
  return ctrlKey === true;
};

export const IsShiftKeyPressed = (shiftKey: boolean): shiftKey is true => {
  return shiftKey === true;
};

export const IsAltKeyPressed = (altKey: boolean): altKey is true => {
  return altKey === true;
};

export const IsMetaKeyPressed = (metaKey: boolean): metaKey is true => {
  return metaKey === true;
};

export const IsNotSubIndicator = (indicator: Indicator): boolean => {
  return IsANullOrUndefinedValue(indicator.parent_indicator);
};
