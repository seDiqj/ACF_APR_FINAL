import {
  IsIdFeild,
  IsNonePrimitiveTypeAndNotNullOrUndefined,
  IsNonPrimitiveType,
} from "@/constants/Constants";

export const RemoveIdFielsFromObj = (obj: {
  [key: string]: any;
}): { [key: string]: any } => {
  const objKeys: any[] = Object.keys(obj);

  for (const key of objKeys) {
    if (IsNonePrimitiveTypeAndNotNullOrUndefined(obj[key]))
      RemoveIdFielsFromObj(obj[key]);
    else if (IsIdFeild(key)) delete obj[key];
  }

  return obj;
};

// export const ChangeMultiLevelObjToOneLevelObj = (obj: {
//   [key: string]: any;
// }) => {
//   const objKeys: string[] = Object.keys(obj);
//   let newObj: { [key: string]: any } = {};

//   for (const key of objKeys) {
//     if (IsNonPrimitiveType(obj[key])) newObj = { ...newObj, ...obj[key] };
//     else newObj = { ...newObj, [key]: obj[key] };
//   }
// };
