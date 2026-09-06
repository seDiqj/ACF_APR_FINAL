"use client";

import React, { useEffect, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import {
  Check,
  Info,
  Loader2,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Skeleton } from "../ui/skeleton";

import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";
import { RoleFormSchema } from "@/schemas/FormsSchema";
import { RoleInterface } from "@/interfaces/Interfaces";

import {
  RoleCreationMessage,
  RoleEditionMessage,
} from "@/constants/ConfirmationModelsTexts";

import {
  IsCreateMode,
  IsEditMode,
  IsShowMode,
} from "@/constants/Constants";

import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { cn } from "@/lib/utils";

type Permission = {
  id: number;
  name: string;
  group_name: string;
};

type PermissionsGrouped = {
  [group: string]: Permission[];
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
      <Info className="h-3 w-3 shrink-0" />
      {message}
    </span>
  );
};

const RoleForm: React.FC<RoleInterface> = ({
  open,
  openStateSetter,
  mode,
  idFeildForEditStateSetter,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
    handleReload,
  } = useParentContext();

  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<string>("active");

  const [permissions, setPermissions] =
    useState<PermissionsGrouped | null>(null);

  const [rolePermissions, setRolePermissions] = useState<number[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<
    Record<string, string>
  >({});

  const isReadOnly = IsShowMode(mode);

  /*
   * ---------------------------------------------------------
   * Clear Field Error
   * ---------------------------------------------------------
   */

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };
      delete next[field];

      return next;
    });
  };

  /*
   * ---------------------------------------------------------
   * Load Permissions + Role
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setFormErrors({});

    /*
     * Reset state for Create mode
     */
    if (IsCreateMode(mode)) {
      setName("");
      setStatus("active");
      setRolePermissions([]);
    }

    const permissionsRequest =
      requestHandler().get("user_mng/permissions");

    const roleRequest =
      !IsCreateMode(mode) && idFeildForEditStateSetter
        ? requestHandler().get(
            `user_mng/role/${idFeildForEditStateSetter}`
          )
        : Promise.resolve({
            data: {
              data: null,
            },
          });

    Promise.all([permissionsRequest, roleRequest])
      .then(
        ([permRes, roleRes]: [
          AxiosResponse<any>,
          AxiosResponse<any>
        ]) => {
          /*
           * Permissions
           */
          setPermissions(permRes.data.data);

          /*
           * Existing role
           */
          if (roleRes.data.data) {
            const roleData = roleRes.data.data;

            setName(roleData.name || "");
            setStatus(roleData.status || "active");

            const rolePermIds =
              roleData.permissions?.map((permission: any) =>
                typeof permission === "number"
                  ? permission
                  : permission.id
              ) || [];

            setRolePermissions(rolePermIds);
          }
        }
      )
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "An error occurred while loading role data !",
          "error"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, mode, idFeildForEditStateSetter]);

  /*
   * ---------------------------------------------------------
   * Validation
   * ---------------------------------------------------------
   */

  const validateForm = () => {
    const result = RoleFormSchema.safeParse({
      name,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field && !errors[field as string]) {
          errors[field as string] = issue.message;
        }
      });

      setFormErrors(errors);

      reqForToastAndSetMessage(
        "Please fix validation errors before submitting.",
        "warning"
      );

      return false;
    }

    setFormErrors({});

    return true;
  };

  /*
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */

  const onSubmit = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const url = IsCreateMode(mode)
      ? "user_mng/role"
      : `user_mng/role/${idFeildForEditStateSetter}`;

    const method = IsCreateMode(mode) ? "post" : "put";

    requestHandler()
      .request(url, method, {
        name: name.trim(),
        status,
        permissions: rolePermissions,
      })
      .then((response: AxiosResponse<any>) => {
        openStateSetter(false);

        reqForToastAndSetMessage(
          response.data.message,
          "success"
        );

        handleReload();
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "An error occurred while saving the role !",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /*
   * ---------------------------------------------------------
   * Toggle Individual Permission
   * ---------------------------------------------------------
   */

  const handlePermissionToggle = (
    permissionId: number,
    checked: boolean
  ) => {
    if (isReadOnly) return;

    setRolePermissions((prev) => {
      if (checked) {
        return Array.from(
          new Set([...prev, permissionId])
        );
      }

      return prev.filter(
        (id) => id !== permissionId
      );
    });
  };

  /*
   * ---------------------------------------------------------
   * Toggle Permission Group
   * ---------------------------------------------------------
   */

  const handleGroupToggle = (perms: Permission[]) => {
    if (isReadOnly) return;

    const permissionIds = perms.map(
      (permission) => permission.id
    );

    const allSelected = permissionIds.every((id) =>
      rolePermissions.includes(id)
    );

    setRolePermissions((prev) => {
      if (allSelected) {
        return prev.filter(
          (id) => !permissionIds.includes(id)
        );
      }

      return Array.from(
        new Set([...prev, ...permissionIds])
      );
    });
  };

  /*
   * ---------------------------------------------------------
   * Group State
   * ---------------------------------------------------------
   */

  const isGroupFullySelected = (
    perms: Permission[]
  ) => {
    return (
      perms.length > 0 &&
      perms.every((permission) =>
        rolePermissions.includes(permission.id)
      )
    );
  };

  const isGroupPartiallySelected = (
    perms: Permission[]
  ) => {
    const selectedCount = perms.filter((permission) =>
      rolePermissions.includes(permission.id)
    ).length;

    return (
      selectedCount > 0 &&
      selectedCount < perms.length
    );
  };

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <Dialog
      open={open}
      onOpenChange={openStateSetter}
    >
      <DialogContent
        className="
          min-w-4xl
          w-[92vw]
          max-w-5xl
          max-h-[85vh]
          flex
          flex-col
          p-6
          bg-card
          border
          border-border
          text-card-foreground
          shadow-2xl
          rounded-lg
          overflow-hidden
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />

            {IsCreateMode(mode)
              ? "Create Role"
              : IsEditMode(mode)
              ? "Edit Role"
              : "View Role"}
          </DialogTitle>

          <DialogDescription className="text-[11px] text-muted-foreground">
            {IsCreateMode(mode)
              ? "Create a role and configure its permissions."
              : IsEditMode(mode)
              ? "Update the role information and permissions."
              : "View role information and assigned permissions."}
          </DialogDescription>
        </DialogHeader>

        {/* =====================================================
            BODY
        ===================================================== */}

        {loading ? (
          <div
            className="
              flex-1
              overflow-y-auto
              pr-1
              space-y-6
              py-4
              scrollbar-thin
              scrollbar-thumb-border
            "
          >
            {/* Role information skeleton */}

            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </section>

            {/* Permissions skeleton */}

            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>

              {[1, 2, 3].map((group) => (
                <div
                  key={group}
                  className="
                    rounded-lg
                    border
                    border-border/80
                    p-4
                    bg-muted/20
                    space-y-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(
                      (item) => (
                        <div
                          key={item}
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-md
                            border
                            border-border/60
                            bg-background
                            px-3
                            py-2.5
                          "
                        >
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-3 flex-1" />
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </section>
          </div>
        ) : (
          <div
            className="
              flex-1
              overflow-y-auto
              pr-1
              space-y-6
              py-4
              scrollbar-thin
              scrollbar-thumb-border
            "
          >
            {/* =================================================
                ROLE INFORMATION
            ================================================= */}

            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Role Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NAME */}

                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="role-name"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Role Name
                  </Label>

                  <Input
                    id="role-name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    disabled={isReadOnly || isLoading}
                    placeholder="Enter role name"
                    className={cn(
                      "bg-background",
                      "border-input",
                      "text-foreground",
                      "focus-visible:ring-ring",
                      "h-10",
                      "rounded-md",
                      "text-xs",
                      "transition-colors",
                      formErrors.name &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />

                  <FieldError
                    message={formErrors.name}
                  />
                </div>

                {/* STATUS */}

                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="role-status"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Status
                  </Label>

                  <select
                    id="role-status"
                    name="status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      clearFieldError("status");
                    }}
                    disabled={isReadOnly || isLoading}
                    className="
                      w-full
                      h-10
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-3
                      text-xs
                      text-foreground
                      outline-none
                      transition-colors
                      focus:ring-2
                      focus:ring-ring
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="deactive">
                      Deactive
                    </option>
                  </select>

                  <FieldError
                    message={formErrors.status}
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                PERMISSIONS
            ================================================= */}

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Permissions
                </h3>

                <span className="text-[10px] font-semibold text-muted-foreground">
                  {rolePermissions.length} selected
                </span>
              </div>

              {permissions &&
                Object.entries(permissions).map(
                  ([group, perms]) => {
                    const fullySelected =
                      isGroupFullySelected(perms);

                    const partiallySelected =
                      isGroupPartiallySelected(perms);

                    return (
                      <section
                        key={group}
                        className="
                          rounded-lg
                          border
                          border-border/80
                          bg-muted/20
                          overflow-hidden
                        "
                      >
                        {/* GROUP HEADER */}

                        <div
                          onClick={() =>
                            handleGroupToggle(perms)
                          }
                          className={cn(
                            "flex items-center gap-3",
                            "px-4 py-3",
                            "border-b border-border/60",
                            "select-none",
                            !isReadOnly &&
                              "cursor-pointer hover:bg-muted/40",
                            "transition-colors"
                          )}
                        >
                          <Checkbox
                            checked={
                              fullySelected
                                ? true
                                : partiallySelected
                                ? "indeterminate"
                                : false
                            }
                            disabled={
                              isReadOnly || isLoading
                            }
                            className="
                              h-4 w-4
                              rounded
                              border-input
                              data-[state=checked]:bg-primary
                              data-[state=checked]:border-primary
                            "
                          />

                          <div className="flex-1 min-w-0">
                            <h4
                              className={cn(
                                "text-xs font-bold",
                                fullySelected
                                  ? "text-primary"
                                  : "text-foreground"
                              )}
                            >
                              {group}
                            </h4>

                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {perms.length} permission
                              {perms.length !== 1
                                ? "s"
                                : ""}
                            </p>
                          </div>

                          {fullySelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        {/* PERMISSION ITEMS */}

                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {perms.map(
                            (permission) => {
                              const selected =
                                rolePermissions.includes(
                                  permission.id
                                );

                              return (
                                <div
                                  key={permission.id}
                                  className={cn(
                                    "flex items-start gap-3",
                                    "rounded-md",
                                    "border",
                                    "px-3 py-2.5",
                                    "transition-colors",
                                    selected
                                      ? "border-primary/30 bg-primary/5"
                                      : "border-border/60 bg-background",
                                    !isReadOnly &&
                                      "hover:bg-muted/30"
                                  )}
                                >
                                  <Checkbox
                                    id={`role-permission-${permission.id}`}
                                    checked={selected}
                                    onCheckedChange={(
                                      checked
                                    ) =>
                                      handlePermissionToggle(
                                        permission.id,
                                        checked === true
                                      )
                                    }
                                    disabled={
                                      isReadOnly ||
                                      isLoading
                                    }
                                    className="
                                      h-4 w-4
                                      shrink-0
                                      mt-0.5
                                      border-input
                                      data-[state=checked]:bg-primary
                                      data-[state=checked]:border-primary
                                    "
                                  />

                                  <Label
                                    htmlFor={`role-permission-${permission.id}`}
                                    className="
                                      text-[11px]
                                      font-medium
                                      leading-relaxed
                                      text-foreground
                                      cursor-pointer
                                      select-none
                                      break-words
                                    "
                                  >
                                    {permission.name}
                                  </Label>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </section>
                    );
                  }
                )}

              {/* EMPTY STATE */}

              {!permissions ||
                (Object.keys(permissions).length ===
                  0 && (
                    <div
                      className="
                        rounded-lg
                        border
                        border-dashed
                        border-border
                        p-8
                        text-center
                      "
                    >
                      <ShieldCheck className="h-7 w-7 mx-auto text-muted-foreground/50 mb-2" />

                      <p className="text-xs font-medium text-muted-foreground">
                        No permissions available.
                      </p>
                    </div>
                  ))}
            </section>
          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        {!isReadOnly && (
          <DialogFooter
            className="
              flex
              justify-end
              gap-3
              pt-4
              border-t
              border-border
              mt-auto
            "
          >
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() =>
                openStateSetter(false)
              }
              className="
                h-10
                px-4
                rounded-md
                text-xs
                bg-secondary/50
              "
            >
              Cancel
            </Button>

            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              type="button"
              disabled={isLoading || loading}
              onClick={() =>
                reqForConfirmationModelFunc(
                  IsCreateMode(mode)
                    ? RoleCreationMessage
                    : RoleEditionMessage,
                  onSubmit
                )
              }
              className="
                h-10
                min-w-[110px]
                px-5
                gap-2
                rounded-md
                text-xs
                bg-primary
                text-primary-foreground
                hover:bg-primary/95
                shadow-sm
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  {IsCreateMode(mode)
                    ? "Creating..."
                    : "Updating..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />

                  {IsCreateMode(mode)
                    ? "Create"
                    : "Update"}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoleForm;