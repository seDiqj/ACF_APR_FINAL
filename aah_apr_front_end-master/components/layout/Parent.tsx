// BASE COMPONENT FOR SEEDING COMMON INFORMATIONS TROUGH ALL SYSTEM.

"use client";

import { ParentContext } from "@/contexts/ParentContext";
import { createAxiosInstance } from "@/lib/axios";
import { User } from "@/types/Types";
import { AxiosInstance } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmationAlertDialogue from "../global/ConfirmationDialog";
import ProfileModal from "../global/UserForm";
import { Folder, Clock, CheckCircle, XCircle } from "lucide-react";
import { ParentInterface } from "@/interfaces/Interfaces";
import RequestHandler from "@/axios/Axios";
import {
  defaultToastDuration,
  errorToastDuration,
  successToastDuration,
  warningToastDuration,
} from "@/config/ToastConfig";

const Parent: React.FC<ParentInterface> = ({ children }) => {
  const axiosInstance: AxiosInstance = createAxiosInstance();
  const requestHandler: () => RequestHandler = () => new RequestHandler();

  const reqForToastAndSetMessage = (
    message: string,
    type?: "error" | "success" | "warning",
    subMessage?: string,
    action?: {
      label: string;
      onClick: VoidFunction;
    },
  ) => {
    if (type === "error") {
      toast.error(message, {
        description: subMessage,
        action: action,
        duration: errorToastDuration,
      });
    } else if (type === "success") {
      toast.success(message, {
        description: subMessage,
        action: action,
        duration: successToastDuration,
      });
    } else if (type === "warning") {
      toast.warning(message, {
        description: subMessage,
        action: action,
        duration: warningToastDuration,
      });
    } else {
      toast(message, {
        description: subMessage,
        action: action,
        duration: defaultToastDuration,
      });
    }
  };

  const [notifications, setNotifications] = useState([]);

  const [reqForProfile, setReqForProfile] = useState<boolean>(false);

  const [globalLoading, setGloabalLoading] = useState<boolean>(false);

  const [reloadFlag, setReloadFlag] = useState<number>(0);

  const handleReload = () => {
    setReloadFlag((prev) => prev + 1);
  };

  const [reloadNotification, setReloadNotification] = useState<number>(0);

  const handleReloadNotification = () => {
    setReloadNotification((prev) => prev + 1);
  };

  const [aprReloadFlag, setAprReladFlag] = useState<number>(0);

  const handleAprReload = () => {
    setAprReladFlag((prev) => prev + 1);
  };

  const [myProfileDetails, setMyProfileDetails] = useState<User | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/user_mng/user/me")
      .then((response) => {
        setMyProfileDetails(response.data.data);
      })
      .catch((error) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error fetching profile details",
          "error",
        );
      });
  }, []);

  useEffect(() => {
    if (!myProfileDetails) return;
    axiosInstance
      .get(`/notification/my_notifications/${myProfileDetails.id}`)
      .then((response: any) => setNotifications(response.data.data))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  }, [myProfileDetails, reloadNotification]);

  const [aprsState, setAprsState] = useState<{
    submitted: number;
    approved: number;
    rejected: number;
    reviewed: number;
  }>({
    submitted: 0,
    approved: 0,
    rejected: 0,
    reviewed: 0,
  });

  const aprStats = [
    {
      title: "Submitted",
      value: aprsState.submitted,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Approved",
      value: aprsState.approved,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Rejected",
      value: aprsState.rejected,
      icon: XCircle,
      color: "text-red-500",
    },
    {
      title: "Reviewed",
      value: aprsState.reviewed,
      icon: Folder,
      color: "text-indigo-500",
    },
  ];

  const [reqForConfirmationModel, setReqForConfirmationModel] = useState(false);

  const [dialogConfig, setDialogConfig] = useState({
    details: "",
    onContinue: () => {},
  });

  const reqForConfirmationModelFunc = (
    details: string,
    onContinue: () => void,
  ) => {
    setDialogConfig({ details, onContinue });
    setReqForConfirmationModel(true);
  };

  useEffect(() => {
    axiosInstance
      .get("/apr_management/get_system_aprs_status")
      .then((response: any) => {
        setAprsState({
          submitted: response.data.data.submitted ?? 0,
          approved: response.data.data.approved ?? 0,
          rejected: response.data.data.rejected ?? 0,
          reviewed: response.data.data.reviewed ?? 0,
        });
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(error.response.data.message, "error");
      });
  }, [aprReloadFlag]);

  const changeBeneficairyAprIncludedStatus = (
    ids: string[],
    newStatus: "include" | "notInclude",
  ) => {
    axiosInstance
      .post(`/global/beneficiary/change_apr_included`, {
        ids: ids,
        newStatus: newStatus,
      })
      .then((response: any) =>
        reqForToastAndSetMessage(response.data.message, "success"),
      )
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  };

  return (
    <ParentContext.Provider
      value={{
        reqForToastAndSetMessage,
        axiosInstance,
        reloadFlag,
        handleReload,
        myProfileDetails,
        setReqForProfile,
        aprStats,
        changeBeneficairyAprIncludedStatus,
        reqForConfirmationModelFunc,
        notifications,
        setNotifications,
        setGloabalLoading,
        aprReloadFlag,
        handleAprReload,
        requestHandler,
        handleReloadNotification,
      }}
    >
      <div className="w-full h-full">{children}</div>

      {reqForProfile && (
        <ProfileModal
          open={reqForProfile}
          onOpenChange={setReqForProfile}
          userId={myProfileDetails?.id as unknown as number}
          mode="show"
        ></ProfileModal>
      )}

      <ConfirmationAlertDialogue
        open={reqForConfirmationModel}
        onOpenChange={setReqForConfirmationModel}
        details={dialogConfig.details}
        onContinue={() => {
          dialogConfig.onContinue();
          setReqForConfirmationModel(false);
        }}
      />
    </ParentContext.Provider>
  );
};

export default Parent;
