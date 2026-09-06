"use client";

import KeyboardManager from "@/core/KeyboardManager";
import { ShourtcutifyEvents } from "@/enums/Enums";
import React, { createContext, useContext, ReactNode, useEffect, useMemo } from "react";

type EventContextType = {
  KeyboardManager: KeyboardManager | null;
  Events: typeof ShourtcutifyEvents;
};

const defaultValue: EventContextType = {
  KeyboardManager: null,
  Events: ShourtcutifyEvents,
};

const EventContext = createContext<EventContextType>(defaultValue);

type EventProviderPropsType = {
  children: ReactNode;
};

export const EventProvider = ({ children }: EventProviderPropsType) => {
  const keyboardManager = useMemo(
    () => (typeof window === "undefined" ? null : new KeyboardManager()),
    []
  );

  useEffect(() => {
    return () => keyboardManager?.destroy();
  }, [keyboardManager]);

  return (
    <EventContext.Provider
      value={{ KeyboardManager: keyboardManager, Events: ShourtcutifyEvents }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventProvider = () => useContext(EventContext);
