"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  ChevronUp,
  Database,
  LogOut,
  User,
  User2,
  ChevronDown,
  BookOpenCheck,
  Boxes,
  FolderOpen,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  MessageSquareMore,
  Share2,
  UserCog,
  Users,
  ShieldCheck,
  UserRound,
  CheckCircle2,
  FileBarChart,
  FileCheck2,
  FileSearch,
  ServerCog,
  UploadCloud,
  Star,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useParentContext } from "@/contexts/ParentContext";
import { useRouter } from "next/navigation";
import { SignoutButtonMessage } from "@/constants/ConfirmationModelsTexts";
import { AxiosError, AxiosResponse } from "axios";
import { usePermissions } from "@/contexts/PermissionContext";
import { Skeleton } from "./ui/skeleton";

const AppSidebar = () => {
  const {
    myProfileDetails,
    setReqForProfile,
    reqForConfirmationModelFunc,
    requestHandler,
    reqForToastAndSetMessage,
  } = useParentContext();

  const { permissions, loading } = usePermissions();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      subOptions: null,
      permissions: ["Month Report Chart", "Project activities", "filtering"],
    },
    {
      title: "Grants Management",
      url: "/grants_mng",
      icon: HandCoins,
      subOptions: [
        {
          title: "Projects",
          url: "/projects",
          icon: FolderOpen,
          permissions: [
            "Project.create",
            "Project.view",
            "Project.edit",
            "Project.delete",
            "Project.submit",
            "Project.grantFinalize",
            "Project.HQFinalize",
          ],
        },
      ],
    },
    {
      title: "My Space",
      icon: FolderOpen,
      subOptions: [
        {
          title: "Main Database",
          url: "/main_database",
          icon: Database,
          permissions: [
            "Maindatabase.create",
            "Maindatabase.view",
            "Maindatabase.edit",
            "Maindatabase.delete",
          ],
        },
        {
          title: "Kit Distribution",
          url: "/kit_database",
          icon: Boxes,
          permissions: [
            "Kit.create",
            "Kit.view",
            "Kit.edit",
            "Kit.delete",
            "Kit.assign",
          ],
        },
        {
          title: "Psychoeducation",
          url: "/psychoeducation_database",
          icon: BookOpenCheck,
          permissions: [
            "Psychoeducation.create",
            "Psychoeducation.view",
            "Psychoeducation.edit",
            "Psychoeducation.delete",
          ],
        },
        {
          title: "Community Dialogue",
          url: "/community_dialogue_database",
          icon: MessageSquareMore,
          permissions: [
            "Dialogue.create",
            "Dialogue.view",
            "Dialogue.edit",
            "Dialogue.delete",
            "Dialogue.assign",
            "Dialogue.create_beneficiary",
          ],
        },
        {
          title: "Training",
          url: "/training_database",
          icon: GraduationCap,
          permissions: [
            "Training.create",
            "Training.edit",
            "Training.view",
            "Training.delete",
            "Training.assign_training",
          ],
        },
        {
          title: "Referral",
          url: "/referral_database",
          icon: Share2,
          permissions: [
            "Referral.create",
            "Referral.view",
            "Referral.edit",
            "Referral.delete",
          ],
        },
        {
          title: "Enact",
          url: "/enact_database",
          icon: Star,
          permissions: [
            "Enact.create",
            "Enact.edit",
            "Enact.delete",
            "Enact.view",
          ],
        },
      ],
    },
    {
      title: "User Management",
      url: "/user_mng",
      icon: UserCog,
      subOptions: [
        {
          title: "Users",
          url: "/users",
          icon: Users,
          permissions: [
            "List User",
            "Create User",
            "Edit User",
            "View User",
            "Delete User",
          ],
        },
        {
          title: "Roles",
          url: "/roles",
          icon: UserRound,
          permissions: [
            "List Role",
            "Create Role",
            "Edit Role",
            "View Role",
            "Delete Role",
          ],
        },
        {
          title: "Permissions",
          url: "/permissions",
          icon: ShieldCheck,
          permissions: [
            "List Role",
            "Create Role",
            "Edit Role",
            "View Role",
            "Delete Role",
          ],
        },
      ],
    },
    {
      title: "Database Management",
      icon: ServerCog,
      subOptions: [
        {
          title: "Submitted Databases",
          url: "/submitted_databases",
          icon: UploadCloud,
          permissions: [
            "Database_submission.create",
            "Database_submission.view",
            "Database_submission.edit",
            "Database_submission.delete",
            "Database_submission.approve",
          ],
        },
        {
          title: "Approved Databases",
          url: "/approved_databases",
          icon: CheckCircle2,
          permissions: ["Database_submission.generate_apr"],
        },
      ],
    },
    {
      title: "APR Management",
      url: "/apr_management",
      icon: FileBarChart,
      subOptions: [
        {
          title: "Review APR",
          url: "/review_aprs",
          icon: FileSearch,
          permissions: ["Apr.review", "Apr.view/list", "Apr.mark_as_reviewed"],
        },
        {
          title: "Approve APR",
          url: "/approve_aprs",
          icon: FileCheck2,
          permissions: ["Apr.validate"],
        },
      ],
    },
    {
      title: "Catagory Management",
      url: "/catagory_management",
      icon: FileBarChart,
      subOptions: [
        {
          title: "Kit Management",
          url: "/kit_management",
          icon: FileSearch,
          permissions: ["Apr.review", "Apr.view/list", "Apr.mark_as_reviewed"],
        },
      ],
    },
  ];

  const handleSignout = () => {
    requestHandler()
      .post("/authentication/logout")
      .then((response: AxiosResponse<any>) => {
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data.message || "Logout failed"
        );
      });
  };

  if (!mounted || loading) {
    return (
      <Sidebar
        collapsible="offcanvas"
        className="bg-[var(--sidebar-bg)] border-r border-border"
      >
        {/* Skeleton Header */}
        <SidebarHeader className="p-4 border-b border-border bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />

            {/* Brand */}
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator className="bg-border/60" />

        {/* Skeleton Navigation */}
        <SidebarContent className="bg-[var(--sidebar-bg)] px-2 py-3">
          <SidebarGroup>
            {/* Section Label */}
            <SidebarGroupLabel className="px-3 mb-2">
              <Skeleton className="h-2.5 w-28 rounded" />
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {/* Dashboard */}
                <SidebarMenuItem>
                  <Skeleton className="h-9 w-full rounded-md" />
                </SidebarMenuItem>

                {/* Expandable Group */}
                <SidebarMenuItem>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>

                    <Skeleton className="h-3 w-3 rounded" />
                  </div>

                  {/* Children */}
                  <div className="ml-5 pl-4 border-l border-border/60 space-y-1.5">
                    <Skeleton className="h-7 w-[82%] rounded-md" />
                  </div>
                </SidebarMenuItem>

                {/* Expandable Group */}
                <SidebarMenuItem>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>

                    <Skeleton className="h-3 w-3 rounded" />
                  </div>

                  <div className="ml-5 pl-4 border-l border-border/60 space-y-1.5">
                    <Skeleton className="h-7 w-[88%] rounded-md" />
                    <Skeleton className="h-7 w-[76%] rounded-md" />
                    <Skeleton className="h-7 w-[84%] rounded-md" />
                    <Skeleton className="h-7 w-[68%] rounded-md" />
                  </div>
                </SidebarMenuItem>

                {/* Expandable Group */}
                <SidebarMenuItem>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>

                    <Skeleton className="h-3 w-3 rounded" />
                  </div>

                  <div className="ml-5 pl-4 border-l border-border/60 space-y-1.5">
                    <Skeleton className="h-7 w-[72%] rounded-md" />
                    <Skeleton className="h-7 w-[64%] rounded-md" />
                    <Skeleton className="h-7 w-[78%] rounded-md" />
                  </div>
                </SidebarMenuItem>

                {/* Another Group */}
                <SidebarMenuItem>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-32 rounded" />
                    </div>

                    <Skeleton className="h-3 w-3 rounded" />
                  </div>
                </SidebarMenuItem>

                {/* Another Group */}
                <SidebarMenuItem>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>

                    <Skeleton className="h-3 w-3 rounded" />
                  </div>
                </SidebarMenuItem>

                {/* Final Group */}
                <SidebarMenuItem>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-36 rounded" />
                    </div>

                    <Skeleton className="h-3 w-3 rounded" />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Skeleton Footer */}
        <SidebarFooter className="p-3 border-t border-border bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-border/50">
            <Skeleton className="h-5 w-5 rounded-full shrink-0" />

            <Skeleton className="h-3 w-24 rounded" />

            <Skeleton className="h-3 w-3 rounded ml-auto" />
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-[var(--sidebar-bg)] border-r border-border"
    >
      {/* Brand Header Section */}
      <SidebarHeader className="p-4 border-b border-border bg-[var(--sidebar-bg)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-muted/50 rounded-lg transition-all"
            >
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/AAHLogo.png"
                  alt="Company Logo"
                  className="h-9 w-9 object-contain"
                />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-foreground uppercase tracking-tight">
                    Action Against Hunger
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    APR Workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="bg-border/60" />

      {/* Main Core Application Navigation Tree Layout */}
      <SidebarContent className="bg-[var(--sidebar-bg)] px-2 py-3 space-y-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-3 mb-2">
            Main Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items
                .filter(
                  (item) =>
                    item.subOptions?.some((op) =>
                      op.permissions?.some((per) => permissions.includes(per))
                    ) ??
                    item.permissions?.some((per) => permissions.includes(per))
                )
                .map((item, idx) => {
                  if (item.subOptions != null) {
                    return (
                      <Collapsible
                        key={`coll-${item.title}-${idx}`}
                        defaultOpen
                        className="group/collapsible w-full"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full justify-between font-medium text-xs text-foreground/90 hover:bg-muted/60 hover:text-foreground rounded-md px-3 py-2 transition-all">
                              <span className="flex items-center gap-2.5">
                                <item.icon className="h-4 w-4 text-muted-foreground group-hover/collapsible:text-foreground transition-colors" />
                                <span>{item.title}</span>
                              </span>
                              <ChevronDown className="h-3 w-3 opacity-60 ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="pl-4 mt-0.5 space-y-0.5 border-l border-border/60 ml-5">
                            {item.subOptions
                              .filter((subOption) =>
                                subOption.permissions?.some((per) =>
                                  permissions.includes(per)
                                )
                              )
                              .map((sub, subIdx) => (
                                <SidebarMenuItem
                                  key={`sub-${sub.title}-${subIdx}`}
                                >
                                  <SidebarMenuButton
                                    asChild
                                    className="text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground rounded-md px-3 py-1.5 transition-all"
                                  >
                                    <Link
                                      href={sub.url}
                                      className="flex items-center gap-2.5 w-full"
                                    >
                                      <sub.icon className="h-3.5 w-3.5 opacity-75" />
                                      <span>{sub.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={`item-${item.title}-${idx}`}>
                      <SidebarMenuButton
                        asChild
                        className="font-medium text-xs text-foreground/90 hover:bg-muted/60 hover:text-foreground rounded-md px-3 py-2 transition-all"
                      >
                        <Link
                          href={item.url!}
                          className="flex items-center gap-2.5 w-full"
                        >
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Identity Profile / Session Action Footer */}
      <SidebarFooter className="p-3 border-t border-border bg-[var(--sidebar-bg)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full flex items-center justify-between bg-muted/30 hover:bg-muted/70 text-foreground font-semibold text-xs rounded-md px-3 py-2.5 border border-border/50 shadow-sm transition-all">
                  <span className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-[var(--sidebar-option-bg)] flex items-center justify-center text-white">
                      <User2 className="h-3 w-3" />
                    </div>
                    <span className="truncate max-w-[120px]">
                      {myProfileDetails?.name || "Field Agent"}
                    </span>
                  </span>
                  <ChevronUp className="h-3 w-3 opacity-60" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border text-popover-foreground w-52 rounded-md shadow-lg p-1"
              >
                <DropdownMenuItem
                  onClick={() => setReqForProfile(true)}
                  className="flex items-center gap-2 text-xs font-medium py-2 rounded-md focus:bg-primary focus:text-primary-foreground cursor-pointer"
                >
                  <User className="h-4 w-4 opacity-75" />
                  <span>View Account Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    reqForConfirmationModelFunc(
                      SignoutButtonMessage,
                      handleSignout
                    )
                  }
                  className="flex items-center gap-2 text-xs font-medium py-2 rounded-md focus:bg-destructive focus:text-destructive-foreground cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4 opacity-75" />
                  <span>Secure Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
