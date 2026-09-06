import { AxiosError, AxiosResponse } from "axios";
import { createAxiosInstance } from "./axios";

const axiosInstance = createAxiosInstance();

export const GetIndicator = (
  id: number,
  onError?: (message?: string) => void,
) =>
  axiosInstance
    .get(`projects/indicator/${id}`)
    .then((response: AxiosResponse<any, any, object>) => response.data.data)
    .catch((error: AxiosError<any, any>) => {
      onError?.(error.response?.data.message);
    });
