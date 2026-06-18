/**
 * DrawerContext – manages the side drawer open / close state
 * so that the Header and SideDrawer can communicate.
 */

import React, { createContext, useContext, useState, useCallback, type PropsWithChildren } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DrawerContextType {
  readonly isOpen: boolean;
  readonly openDrawer: () => void;
  readonly closeDrawer: () => void;
  readonly toggleDrawer: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function DrawerProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openDrawer = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const toggleDrawer = useCallback((): void => {
    setIsOpen((prev: boolean) => !prev);
  }, []);

  const value: DrawerContextType = {
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDrawer(): DrawerContextType {
  const context: DrawerContextType | undefined = useContext(DrawerContext);

  if (context === undefined) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }

  return context;
}
