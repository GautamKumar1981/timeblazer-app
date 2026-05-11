import React, { createContext, useContext, useState, useCallback } from 'react';

interface SidebarCtx { isOpen: boolean; toggle: () => void; close: () => void }
const SidebarContext = createContext<SidebarCtx>({ isOpen: false, toggle: () => {}, close: () => {} });

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen(p => !p), []);
  const close  = useCallback(() => setIsOpen(false), []);
  return <SidebarContext.Provider value={{ isOpen, toggle, close }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => useContext(SidebarContext);
