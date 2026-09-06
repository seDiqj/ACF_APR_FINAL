import { usePermissions } from "@/contexts/PermissionContext";
import { ReactNode } from "react";

interface CanProps {
  permission: string;
  children: ReactNode;
}

export const Can = ({ permission, children }: CanProps) => {
  const {permissions} = usePermissions();
  if (!permissions.includes(permission)) return null;
  return <>{children}</>;
};
