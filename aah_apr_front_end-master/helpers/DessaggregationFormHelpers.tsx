import { enactDessaggregationOptions, indevidualDessaggregationOptions, sessionDessaggregationOptions } from "@/app/(main)/projects/utils/OptionLists";

export const getReliableDessaggregationOptionsAccordingToDessagregationType = (dessaggregationType: "session" | "indevidual" | "enact" | string) => {
    if (dessaggregationType == "session")
        return sessionDessaggregationOptions;
    else if (dessaggregationType == "indevidual")
        return indevidualDessaggregationOptions;
    else
        return enactDessaggregationOptions
}

export const getReliableDessaggregationOptionsForSubIndicatorAccordingToDessagregationType = (dessaggregationType: string) => {
    if (dessaggregationType == "session")
        return sessionDessaggregationOptions;
    else
        return indevidualDessaggregationOptions;
}