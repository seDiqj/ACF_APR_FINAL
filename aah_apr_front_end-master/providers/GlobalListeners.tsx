// The component will only create a single instance of class KeyboardManager and one instance of class KeyboardEventHundler.
// and register some keyboard events on window for appling shortcuts on entire system.
// It will automatically remove all the registered listeners from window .

"use client";

import { useEventProvider } from "@/contexts/EventContext";
import KeyboardEventHundler from "@/core/KeyboardEventHundlers";
import { useEffect, useRef } from "react";

const GlobaleListenersRegisterer = () => {
  const { KeyboardManager } = useEventProvider();

  const hasRef = useRef(false);

  useEffect(() => {
    if (!KeyboardManager) return;
    if (hasRef.current) return;
    hasRef.current = true;

    const KEH = new KeyboardEventHundler();

    KeyboardManager.registerKey("enter", KEH.onEnterPressed);
    KeyboardManager.registerKey("delete", KEH.onDeletePressed);
    KeyboardManager.registerKey("control->a", KEH.onCtrlPlusAPressed);
  }, [KeyboardManager]);

  return null;
};

export default GlobaleListenersRegisterer;
