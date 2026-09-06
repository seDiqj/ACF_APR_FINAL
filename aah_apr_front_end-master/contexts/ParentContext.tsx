"use client";

import {createContext, useContext} from "react";

export const ParentContext = createContext<any>({});

export const useParentContext = () => useContext(ParentContext);