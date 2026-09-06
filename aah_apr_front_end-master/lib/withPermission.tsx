import { usePermissions } from "@/contexts/PermissionContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ComponentType } from "react";

export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredPermission: string | string[],
) {
  const ComponentWithPermission = (props: P) => {
    const { permissions, loading } = usePermissions();
    const router = useRouter();

    useEffect(() => {
      if (
        !loading && permissions && Array.isArray(requiredPermission)
          ? !permissions.some((perm: string) =>
              requiredPermission.includes(perm),
            )
          : !permissions.includes(requiredPermission)
      ) {
        router.replace("/403");
      }
    }, [permissions, loading, router]);

    if (loading) return null;

    if (
      Array.isArray(requiredPermission)
        ? !permissions.some((perm: string) => requiredPermission.includes(perm))
        : !permissions.includes(requiredPermission)
    )
      return null;

    return <WrappedComponent {...props} />;
  };

  return ComponentWithPermission;
}
