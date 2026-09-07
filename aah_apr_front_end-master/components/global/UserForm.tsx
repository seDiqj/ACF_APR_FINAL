"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  ChevronRight,
  ChevronLeft,
  Save,
  Info,
  Loader2,
  ShieldCheck,
  UserRound,
  Check,
  ImagePlus,
} from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useParentContext } from "@/contexts/ParentContext";
import { SingleSelect } from "../single-select";
import { UserFormSchema } from "@/schemas/FormsSchema";
import { UserInterface } from "@/interfaces/Interfaces";
import { steps } from "@/constants/SingleAndMultiSelectOptionsList";
import {
  UserCreationMessage,
  UserEditionMessage,
} from "@/constants/ConfirmationModelsTexts";
import {
  IsCreateMode,
  IsEditMode,
  IsEditOrShowMode,
  IsNotCreateMode,
  IsShowMode,
} from "@/constants/Constants";
import { UserFormDefault } from "@/constants/FormsDefaultValues";
import { UserType } from "@/types/Types";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { AxiosError, AxiosResponse } from "axios";
import { cn } from "@/lib/utils";

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
      <Info className="h-3 w-3 shrink-0" />
      {message}
    </span>
  );
};

const ProfileModal: React.FC<UserInterface> = ({
  open,
  onOpenChange,
  mode = "create",
  userId,
}) => {
  const {
    requestHandler,
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    handleReload,
  } = useParentContext();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<UserType>(UserFormDefault());

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [allPermissions, setAllPermissions] = useState<{
    [key: string]: Record<string, string>[];
  }>({});

  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [allRoles, setAllRoles] = useState<
    { id: string; name: string; permissions?: any[] }[]
  >([]);

  const [userRole, setUserRole] = useState<string>("");

  const isReadOnly = IsShowMode(mode);

  /*
   * ---------------------------------------------------------
   * Helpers
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

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearFieldError(name);
  };

  /*
   * ---------------------------------------------------------
   * Photo
   * ---------------------------------------------------------
   */

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    setSelectedFile(file);

    const url = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      photo_path: url,
    }));
  };

  /*
   * ---------------------------------------------------------
   * Permissions
   * ---------------------------------------------------------
   */

  const handlePermissionToggle = (permissionId: string) => {
    if (isReadOnly) return;

    setUserPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectRole = (role: any) => {
    if (isReadOnly || !role || !role.permissions) return;

    setUserPermissions(role.permissions.map((p: any) => p.id));
  };

  const getGroupPermissionIds = (perms: any[]) => perms.map((p) => p.id);

  const isGroupFullySelected = (perms: any[]) =>
    perms.length > 0 && perms.every((p) => userPermissions.includes(p.id));

  const isGroupPartiallySelected = (perms: any[]) =>
    perms.some((p) => userPermissions.includes(p.id)) &&
    !isGroupFullySelected(perms);

  const handleTogglePermissionGroup = (perms: any[]) => {
    if (isReadOnly) return;

    const groupPermissionIds = getGroupPermissionIds(perms);

    const allSelected = groupPermissionIds.every((id) =>
      userPermissions.includes(id)
    );

    setUserPermissions((prev) => {
      if (allSelected) {
        return prev.filter((id) => !groupPermissionIds.includes(id));
      }

      return Array.from(new Set([...prev, ...groupPermissionIds]));
    });
  };

  /*
   * ---------------------------------------------------------
   * Validation
   * ---------------------------------------------------------
   */

  const validateForm = () => {
    const result = UserFormSchema.safeParse(form);

    const errors: Record<string, string> = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field && !errors[field as string]) {
          errors[field as string] = issue.message;
        }
      });
    }

    /*
     * Password:
     *
     * The unified schema validates the password when it exists.
     * It is required only during Create mode.
     */
    if (IsCreateMode(mode) && !form.password?.trim()) {
      errors.password = "Password must be at least 7 characters !";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      reqForToastAndSetMessage(
        "Please fix validation errors before submitting.",
        "error"
      );

      return false;
    }

    return true;
  };

  /*
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("title", form.title);
    formData.append("email", form.email);

    if (IsCreateMode(mode) && form.password) {
      formData.append("password", form.password);
    }

    formData.append("status", form.status);

    if (selectedFile) {
      formData.append("photo_path", selectedFile);
    }

    formData.append("permissions", JSON.stringify(userPermissions));

    formData.append("role", userRole);

    setIsLoading(true);

    const request = IsCreateMode(mode)
      ? requestHandler().post("/user_mng/user", formData)
      : requestHandler().post(`/user_mng/edit_user/${userId}`, formData);

    request
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");

        onOpenChange(false);
        handleReload();
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "An error occurred !",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /*
   * ---------------------------------------------------------
   * Load Data
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setFormErrors({});
    setSelectedFile(null);
    setLoading(true);

    if (IsEditOrShowMode(mode)) {
      Promise.all([
        requestHandler().get(`/user_mng/user/${userId}`),
        requestHandler().get(`/user_mng/permissions_&_roles`),
      ])
        .then(
          ([userRes, rolePermRes]: [
            AxiosResponse<any>,
            AxiosResponse<any>
          ]) => {
            const userData = userRes.data.data;

            const { permissions, direct_permissions, role, roles, ...rest } =
              userData;

            /*
             * ---------------------------------------------------------
             * ROLE
             * ---------------------------------------------------------
             */

            const selectedRole = roles?.length > 0 ? roles[0] : role || "";

            setUserRole(selectedRole);

            /*
             * IMPORTANT:
             * UserFormSchema validates form.role,
             * therefore form.role must also be populated.
             */
            setForm((prev) => ({
              ...prev,
              ...rest,
              role: selectedRole,
            }));

            /*
             * ---------------------------------------------------------
             * ALL PERMISSIONS
             * ---------------------------------------------------------
             */

            setAllPermissions(rolePermRes.data.data.permissions || {});

            /*
             * ---------------------------------------------------------
             * ALL ROLES
             * ---------------------------------------------------------
             */

            setAllRoles(rolePermRes.data.data.roles || []);

            /*
             * ---------------------------------------------------------
             * USER PERMISSIONS
             * ---------------------------------------------------------
             *
             * These are the effective permissions:
             *
             * Role permissions
             * +
             * Direct permissions
             *
             * Normalize IDs to string because backend IDs
             * are normally numeric.
             */

            setUserPermissions(
              permissions?.map((p: any) => String(p.id)) || []
            );
          }
        )
        .catch((error: AxiosError<any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message ||
              "An error occurred fetching user data !",
            "error"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      requestHandler()
        .get("/user_mng/permissions_&_roles")
        .then((response: AxiosResponse<any>) => {
          setAllPermissions(response.data.data.permissions);

          setAllRoles(response.data.data.roles);

          setUserPermissions([]);
          setUserRole("");
          setForm(UserFormDefault());
        })
        .catch((error: AxiosError<any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message ||
              "An error occurred fetching permissions!",
            "error"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mode, userId, open]);

  /*
   * ---------------------------------------------------------
   * Dialog
   * ---------------------------------------------------------
   */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          min-w-5xl
          w-[95vw]
          md:w-[90vw]
          max-w-6xl
          max-h-[90vh]
          flex
          flex-col
          md:flex-row
          p-0
          bg-card
          border
          border-border
          text-card-foreground
          shadow-2xl
          rounded-xl
          overflow-hidden
        "
      >
        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className="
            w-full
            md:w-[230px]
            shrink-0
            bg-muted/20
            border-b
            md:border-b-0
            md:border-r
            border-border
            p-5
            flex
            flex-col
          "
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <UserRound className="h-5 w-5 text-primary" />

              <h2 className="text-sm font-bold text-foreground">
                {IsShowMode(mode)
                  ? "View User"
                  : IsEditMode(mode)
                  ? "Edit User"
                  : "Create User"}
              </h2>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Manage user profile and permissions.
            </p>
          </div>

          <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
            {steps
              .filter((s) => s.label !== "Summary" || !IsShowMode(mode))
              .map((s) => {
                const isActive = step === s.id;

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={loading && IsNotCreateMode(mode)}
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                      "text-xs font-semibold transition-colors",
                      "text-left whitespace-nowrap",
                      "disabled:pointer-events-none disabled:opacity-50",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "h-7 w-7 shrink-0 rounded-full",
                        "flex items-center justify-center",
                        "text-[10px] font-bold border",
                        isActive
                          ? "border-primary-foreground/30 bg-primary-foreground/10"
                          : "border-border bg-background"
                      )}
                    >
                      {s.id}
                    </span>

                    <span className="hidden sm:inline md:inline">
                      {s.label}
                    </span>
                  </button>
                );
              })}
          </div>
        </aside>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {loading && IsNotCreateMode(mode) ? (
            <div className="flex-1 p-6 md:p-7 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[35%]" />
                <Skeleton className="h-3 w-[55%]" />
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />

                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[30%]" />
                    <Skeleton className="h-3 w-[20%]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* =================================================
                  HEADER
              ================================================= */}

              <DialogHeader className="px-6 md:px-7 pt-6 pb-3 border-b border-border shrink-0">
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  {step === 1 ? (
                    <UserRound className="h-5 w-5 text-primary" />
                  ) : step === 2 ? (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Check className="h-5 w-5 text-primary" />
                  )}

                  {steps.find((s) => s.id === step)?.label}
                </DialogTitle>

                <DialogDescription className="text-[11px] text-muted-foreground">
                  {step === 1
                    ? "Provide the user's personal and account information."
                    : step === 2
                    ? "Configure the permissions and authorization levels for this user."
                    : "Review the user information and granted permissions before saving."}
                </DialogDescription>
              </DialogHeader>

              {/* =================================================
                  SCROLLABLE BODY
              ================================================= */}

              <div
                className="
                  flex-1
                  min-h-0
                  overflow-y-auto
                  px-6
                  md:px-7
                  py-5
                  space-y-6
                  scrollbar-thin
                  scrollbar-thumb-border
                "
              >
                {/* =================================================
                    STEP 1
                ================================================= */}

                {step === 1 && (
                  <div className="space-y-6">
                    {/* PROFILE PHOTO */}

                    <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
                      <div className="flex items-center gap-2">
                        <ImagePlus className="h-4 w-4 text-primary" />

                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Profile
                        </h3>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "relative h-16 w-16 rounded-full",
                            "border border-border bg-background",
                            "overflow-hidden shrink-0",
                            "shadow-sm",
                            !isReadOnly &&
                              "cursor-pointer hover:border-primary transition-colors"
                          )}
                          onClick={() => {
                            if (!isReadOnly) {
                              fileInputRef.current?.click();
                            }
                          }}
                        >
                          {form.photo_path ? (
                            <Image
                              src={
                                "http://127.0.0.1:8000/storage/" +
                                form.photo_path
                              }
                              alt="User avatar"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <User className="h-7 w-7" />
                            </div>
                          )}
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handlePhotoChange}
                          disabled={isReadOnly}
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {form.name || "New User"}
                          </p>

                          <p className="text-[11px] text-muted-foreground truncate">
                            {form.title || "No title specified"}
                          </p>

                          {!isReadOnly && (
                            <p className="text-[10px] text-primary mt-1">
                              Click the image to change profile photo.
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* ACCOUNT INFORMATION */}

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                        <UserRound className="h-4 w-4 text-primary" />

                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Account Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* NAME */}

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Name
                          </Label>

                          <Input
                            name="name"
                            value={form.name || ""}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Enter user name"
                            className={cn(
                              "bg-background border-input",
                              "text-foreground",
                              "focus-visible:ring-ring",
                              "h-10 rounded-md text-xs",
                              "transition-colors",
                              formErrors.name &&
                                "border-destructive focus-visible:ring-destructive"
                            )}
                          />

                          <FieldError message={formErrors.name} />
                        </div>

                        {/* TITLE */}

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Title
                          </Label>

                          <Input
                            name="title"
                            value={form.title || ""}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Enter user title"
                            className={cn(
                              "bg-background border-input",
                              "text-foreground",
                              "focus-visible:ring-ring",
                              "h-10 rounded-md text-xs",
                              "transition-colors",
                              formErrors.title &&
                                "border-destructive focus-visible:ring-destructive"
                            )}
                          />

                          <FieldError message={formErrors.title} />
                        </div>

                        {/* EMAIL */}

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Email
                          </Label>

                          <Input
                            name="email"
                            type="email"
                            value={form.email || ""}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            placeholder="Enter email address"
                            className={cn(
                              "bg-background border-input",
                              "text-foreground",
                              "focus-visible:ring-ring",
                              "h-10 rounded-md text-xs",
                              "transition-colors",
                              formErrors.email &&
                                "border-destructive focus-visible:ring-destructive"
                            )}
                          />

                          <FieldError message={formErrors.email} />
                        </div>

                        {/* PASSWORD */}

                        {IsCreateMode(mode) && (
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs font-semibold text-muted-foreground">
                              Password
                            </Label>

                            <Input
                              name="password"
                              type="password"
                              value={form.password || ""}
                              onChange={handleChange}
                              disabled={isReadOnly}
                              placeholder="Enter password"
                              className={cn(
                                "bg-background border-input",
                                "text-foreground",
                                "focus-visible:ring-ring",
                                "h-10 rounded-md text-xs",
                                "transition-colors",
                                formErrors.password &&
                                  "border-destructive focus-visible:ring-destructive"
                              )}
                            />

                            <FieldError message={formErrors.password} />
                          </div>
                        )}

                        {/* STATUS */}

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Status
                          </Label>

                          <SingleSelect
                            options={[
                              {
                                value: "active",
                                label: "Active",
                              },
                              {
                                value: "deactive",
                                label: "De-active",
                              },
                              {
                                value: "blocked",
                                label: "Blocked",
                              },
                            ]}
                            value={form.status || ""}
                            onValueChange={(val) => {
                              handleChange({
                                target: {
                                  name: "status",
                                  value: val,
                                },
                              });
                            }}
                            disabled={isReadOnly}
                            placeholder="Select status"
                            className={
                              formErrors.status ? "border-destructive" : ""
                            }
                          />

                          <FieldError message={formErrors.status} />
                        </div>

                        {/* ROLE */}

                        <div className="flex flex-col gap-1">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Role
                          </Label>

                          <SingleSelect
                            options={allRoles.map((r) => ({
                              value: r.name,
                              label: r.name,
                            }))}
                            value={userRole || ""}
                            onValueChange={(val) => {
                              setUserRole(val);

                              handleSelectRole(
                                allRoles.find((r) => r.name === val)
                              );

                              setForm((prev) => ({
                                ...prev,
                                role: val,
                              }));

                              clearFieldError("role");
                            }}
                            disabled={isReadOnly}
                            placeholder="Select role"
                            className={
                              formErrors.role ? "border-destructive" : ""
                            }
                          />

                          <FieldError message={formErrors.role} />
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {/* =================================================
                    STEP 2
                ================================================= */}

                {step === 2 && (
                  <div className="space-y-5">
                    <section className="rounded-lg border border-border/80 p-4 bg-muted/20">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />

                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                              Permissions
                            </h3>

                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Select the permissions granted to this user.
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {userPermissions.length} selected
                        </span>
                      </div>
                    </section>

                    {Object.entries(allPermissions).map(([group, perms]) => {
                      const fullySelected = isGroupFullySelected(perms);

                      const partiallySelected = isGroupPartiallySelected(perms);

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
                            className={cn(
                              "flex items-center gap-3",
                              "px-4 py-3",
                              "border-b border-border/60",
                              !isReadOnly && "cursor-pointer hover:bg-muted/40",
                              "transition-colors"
                            )}
                            onClick={() => handleTogglePermissionGroup(perms)}
                          >
                            <Checkbox
                              checked={
                                fullySelected
                                  ? true
                                  : partiallySelected
                                  ? "indeterminate"
                                  : false
                              }
                              disabled={isReadOnly}
                              className="
                                  h-4 w-4
                                  border-input
                                  data-[state=checked]:bg-primary
                                  data-[state=checked]:border-primary
                                "
                            />

                            <div className="flex-1 min-w-0">
                              <h3
                                className={cn(
                                  "text-xs font-bold",
                                  fullySelected
                                    ? "text-primary"
                                    : "text-foreground"
                                )}
                              >
                                {group}
                              </h3>

                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {perms.length} permission
                                {perms.length !== 1 ? "s" : ""}
                              </p>
                            </div>

                            {fullySelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>

                          {/* PERMISSIONS */}

                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {perms.map((perm: any) => {
                              const selected = userPermissions.includes(
                                perm.id
                              );

                              return (
                                <div
                                  key={perm.id}
                                  className={cn(
                                    "flex items-center gap-3",
                                    "rounded-md border",
                                    "px-3 py-2.5",
                                    "transition-colors",
                                    selected
                                      ? "border-primary/30 bg-primary/5"
                                      : "border-border/60 bg-background",
                                    !isReadOnly && "hover:bg-muted/30"
                                  )}
                                >
                                  <Checkbox
                                    checked={selected}
                                    onCheckedChange={() =>
                                      handlePermissionToggle(perm.id)
                                    }
                                    disabled={isReadOnly}
                                    className="
                                          h-4 w-4
                                          border-input
                                          data-[state=checked]:bg-primary
                                          data-[state=checked]:border-primary
                                        "
                                  />

                                  <span
                                    className={cn(
                                      "text-[11px] font-medium",
                                      "select-none",
                                      selected
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {perm.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}

                    {Object.keys(allPermissions).length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-8 text-center">
                        <ShieldCheck className="h-7 w-7 mx-auto text-muted-foreground/50 mb-2" />

                        <p className="text-xs font-medium text-muted-foreground">
                          No permissions available.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* =================================================
                    STEP 3 - SUMMARY
                ================================================= */}

                {step === 3 && !isReadOnly && (
                  <div className="space-y-6">
                    <section className="rounded-lg border border-border/80 p-4 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />

                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                            Review Information
                          </h3>

                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Review the information before saving the user.
                          </p>
                        </div>
                      </div>
                    </section>

                    <Card className="border-border bg-background shadow-none rounded-lg">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          {Object.entries(form)
                            .filter(
                              ([key]) =>
                                key !== "photo_path" && key !== "password"
                            )
                            .map(([key, value]) => (
                              <div
                                key={key}
                                className="
                                  border-b
                                  border-border/60
                                  pb-2
                                  min-w-0
                                "
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                  {key.replaceAll("_", " ")}
                                </span>

                                <span className="text-xs font-medium text-foreground break-words">
                                  {String(value || "—")}
                                </span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* PERMISSIONS SUMMARY */}

                    <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Granted Permissions
                        </h3>

                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {userPermissions.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto p-2 border border-border rounded-md bg-background scrollbar-thin scrollbar-thumb-border">
                        {Object.values(allPermissions)
                          .flatMap((gp) => gp)
                          .filter((perm: any) =>
                            userPermissions.includes(perm.id)
                          )
                          .map((perm: any) => (
                            <span
                              key={perm.id}
                              className="
                                text-[10px]
                                font-medium
                                px-2
                                py-1
                                rounded-md
                                bg-secondary
                                text-secondary-foreground
                                border
                                border-border
                              "
                            >
                              {perm.name}
                            </span>
                          ))}

                        {userPermissions.length === 0 && (
                          <span className="text-[10px] text-muted-foreground py-1">
                            No permissions selected.
                          </span>
                        )}
                      </div>
                    </section>
                  </div>
                )}
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              {!isReadOnly && (
                <div
                  className="
                    flex
                    justify-between
                    items-center
                    gap-3
                    px-6
                    md:px-7
                    py-4
                    border-t
                    border-border
                    mt-auto
                    shrink-0
                  "
                >
                  {/* BACK */}

                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep((prev) => prev - 1)}
                      disabled={isLoading}
                      className="
                        h-10
                        px-4
                        gap-2
                        rounded-md
                        text-xs
                        bg-secondary/50
                      "
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isLoading}
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
                  )}

                  {/* NEXT / SAVE */}

                  {step < (IsShowMode(mode) ? 2 : 3) ? (
                    <Button
                      type="button"
                      onClick={() => setStep((prev) => prev + 1)}
                      className="
                        h-10
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
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      id={SUBMIT_BUTTON_PROVIDER_ID}
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        reqForConfirmationModelFunc(
                          IsCreateMode(mode)
                            ? UserCreationMessage
                            : UserEditionMessage,
                          handleSubmit
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
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {IsCreateMode(mode) ? "Save" : "Update"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
