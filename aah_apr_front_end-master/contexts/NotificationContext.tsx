"use client";

import useEcho from "@/hooks/echo";
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useParentContext } from "./ParentContext";

type NotificationProviderPropsType = {
  children: ReactNode;
};

const NotificationContext = createContext<any>({});

export const NotificationProvider = ({
  children,
}: NotificationProviderPropsType) => {
  const { handleReloadNotification, reqForToastAndSetMessage, myProfileDetails,  } =
    useParentContext();

  const echo = useEcho();

  useEffect(() => {
    if (!echo || !myProfileDetails) return;
    echo
      .private(`chat.${myProfileDetails.id}`)
      .listen(".MessageSent", (event: any) => {
        reqForToastAndSetMessage(event.message);
        handleReloadNotification();
      });
  }, [echo, myProfileDetails]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useEventProvider = () => useContext(NotificationContext);
