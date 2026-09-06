import { stringToCapital } from "./StringToCapital"

export const getStructuredProvinces = (provinces: string[]) => {
    return provinces.map((province) => ({label: stringToCapital(province),value:province}))
}