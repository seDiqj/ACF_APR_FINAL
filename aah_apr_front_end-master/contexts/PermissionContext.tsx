"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useParentContext } from "./ParentContext";

const PermissionContext = createContext<any>(null);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider = ({ children }: PermissionProviderProps) => {
  const { axiosInstance, reqForToastAndSetMessage } = useParentContext();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/user_mng/permissionsForAuth")
      .then((response: any) => {
        setPermissions([
          ...response.data.data,
          "ok",
        ]);
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(error?.response?.data?.message || "Error fetching permissions");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PermissionContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
