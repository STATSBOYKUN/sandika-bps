"use client";

import ScrollNavigation from "@/components/ScrollNavigation";
import { TimedAlertProvider } from "@/contexts/TimedAlertContext";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TimedAlertProvider>
      <ScrollNavigation>{children}</ScrollNavigation>
    </TimedAlertProvider>
  );
}
