"use client";

import { useEffect, useState } from "react";
import { Tabs as ShadcnTabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";

import { useParentContext } from "@/contexts/ParentContext";

import { BeneficiaryForm } from "@/types/Types";
import { ReferralInterface } from "@/interfaces/Interfaces";

import ReferralForm from "@/components/global/ReferralForm";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import BreadcrumbWithCustomSeparator from "@/components/global/BreadCrumb";
import SubHeader from "@/components/global/SubHeader";

import { IsANullValue, IsIdFeild } from "@/constants/Constants";

import ChromeTabs from "@/app/(main)/projects/Components/ChromeTab";
import { withPermission } from "@/lib/withPermission";

// ==========================================
// Types
// ==========================================

type ReferralData = ReferralInterface["referralInfo"];

const BeneProfileTabs = () => {
  const { id } = useParams<{
    id: string;
  }>();

  const { reqForToastAndSetMessage, requestHandler } = useParentContext();

  // ==========================================
  // Tabs
  // ==========================================

  const tabs = ["Beneficiary Info", "Referral Form"];

  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  // ==========================================
  // States
  // ==========================================

  const [beneficiaryInfo, setBeneficiaryInfo] =
    useState<BeneficiaryForm | null>(null);

  const [referralInfo, setReferralInfo] = useState<ReferralData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ==========================================
  // Fetch Beneficiary + Referral Data
  // ==========================================

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchBeneficiaryData = async () => {
      try {
        setIsLoading(true);

        const response = await requestHandler().get(
          `/referral_db/beneficiary/${id}`
        );

        if (!isMounted) return;

        const responseData = response.data?.data;

        if (!responseData) {
          throw new Error("Beneficiary data was not found.");
        }

        const { referral, ...beneficiaryData } = responseData;

        // ==========================================
        // Normalize dates for frontend
        // ==========================================

        const formattedBeneficiaryData = {
          ...beneficiaryData,
          dateOfRegistration: beneficiaryData.dateOfRegistration
            ? beneficiaryData.dateOfRegistration.split("T")[0]
            : "",
        };

        const formattedReferral = referral
          ? {
              ...referral,
              dateOfReferral: referral.dateOfReferral
                ? referral.dateOfReferral.split("T")[0]
                : "",
            }
          : null;

        // ==========================================
        // Set states
        // ==========================================

        setBeneficiaryInfo(formattedBeneficiaryData as BeneficiaryForm);

        setReferralInfo(formattedReferral);
      } catch (error: any) {
        if (!isMounted) return;

        const errorMessage =
          error?.response?.data?.message ??
          error?.message ??
          "Failed to load beneficiary information.";

        reqForToastAndSetMessage(errorMessage, "error");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBeneficiaryData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="w-full h-full p-2">
      {/* Navbar */}
      <Navbar14 />

      {/* Breadcrumb */}
      <div className="flex flex-row items-center justify-start my-2">
        <BreadcrumbWithCustomSeparator />
      </div>

      {/* Header */}
      <SubHeader pageTitle="Benficiaries" />

      {/* Chrome Tabs */}
      <ChromeTabs
        currentTab={activeTab}
        onCurrentTabChange={setActiveTab}
        initialTabs={tabs.map((tab) => ({
          value: tab,
          title: tab,
        }))}
      />

      {/* Main Content */}
      <div className="w-full px-4 mt-2">
        <ShadcnTabs value={activeTab} onValueChange={setActiveTab}>
          {/* ===================================== */}
          {/* Beneficiary Information */}
          {/* ===================================== */}

          <TabsContent value={tabs[0]} className="w-full">
            <Card className="shadow-sm border border-border w-full bg-background">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Beneficiary Information
                </CardTitle>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <BeneficiarySkeleton />
                ) : (
                  structuredInfo(beneficiaryInfo)
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================================== */}
          {/* Referral Form */}
          {/* ===================================== */}

          <TabsContent value={tabs[1]} className="w-full">
            {isLoading ? (
              <ReferralFormSkeleton />
            ) : (
              <Card className="shadow-sm border border-border w-full bg-background">
                <CardContent>
                  <ReferralForm
                    beneficiaryInfo={beneficiaryInfo}
                    referralInfo={referralInfo}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </ShadcnTabs>
      </div>
    </div>
  );
};

// ==========================================
// Info Item Component
// ==========================================

export function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>

      <span className="text-base font-semibold text-foreground">{value}</span>
    </div>
  );
}

// ==========================================
// Format Value
// ==========================================

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  // Array
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  // Object
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "-";
    }
  }

  // Boolean
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

// ==========================================
// Format Label
// ==========================================

const formatLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
};

// ==========================================
// Structured Beneficiary Information
// ==========================================

const structuredInfo = (info: BeneficiaryForm | null) => {
  if (!info) {
    return (
      <div className="text-sm text-muted-foreground">
        No beneficiary information found.
      </div>
    );
  }

  const visibleEntries = Object.entries(info).filter(([key, value]) => {
    if (IsIdFeild(key)) {
      return false;
    }

    if (IsANullValue(value)) {
      return false;
    }

    return true;
  });

  if (visibleEntries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No beneficiary information available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {visibleEntries.map(([key, value]) => (
        <div
          key={key}
          className="
              flex
              flex-col
              rounded-xl
              border
              p-3
              transition-all
              hover:shadow-sm
            "
        >
          <span className="text-xs font-medium uppercase opacity-70 tracking-wide">
            {formatLabel(key)}
          </span>

          <span className="text-sm font-semibold break-words">
            {formatValue(value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// Beneficiary Skeleton
// ==========================================

const BeneficiarySkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({
        length: 10,
      }).map((_, index) => (
        <div
          key={index}
          className="
            h-[65px]
            w-full
            rounded-xl
            animate-pulse
            bg-muted/30
          "
        />
      ))}
    </div>
  );
};

// ==========================================
// Referral Form Skeleton
// ==========================================

const ReferralFormSkeleton = () => {
  return (
    <Card className="shadow-sm border border-border w-full bg-background">
      <CardContent className="space-y-6 p-6">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-[80px]
              w-full
              rounded-xl
              animate-pulse
              bg-muted/30
            "
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default withPermission(BeneProfileTabs, "Referral.view");
