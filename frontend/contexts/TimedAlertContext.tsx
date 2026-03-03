"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type TimedAlertVariant = "info" | "success" | "warning" | "error";

export interface TimedAlertAction {
  label: string;
  onClick: () => void;
}

export interface TimedAlert {
  id: string;
  variant: TimedAlertVariant;
  title?: string;
  description: string;
  durationMs: number;
  action?: TimedAlertAction;
}

interface TimedAlertContextValue {
  showAlert: (options: {
    variant: TimedAlertVariant;
    title?: string;
    description: string;
    durationMs?: number;
    action?: TimedAlertAction;
  }) => void;
  dismissAlert: (id: string) => void;
}

const DEFAULT_DURATIONS: Record<TimedAlertVariant, number> = {
  info: 3500,
  success: 3500,
  warning: 4500,
  error: 6000,
};

const TimedAlertContext = createContext<TimedAlertContextValue | undefined>(undefined);

export function TimedAlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<TimedAlert[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showAlert = useCallback(
    (options: {
      variant: TimedAlertVariant;
      title?: string;
      description: string;
      durationMs?: number;
      action?: TimedAlertAction;
    }) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const durationMs = options.durationMs ?? DEFAULT_DURATIONS[options.variant];

      const newAlert: TimedAlert = {
        id,
        variant: options.variant,
        title: options.title,
        description: options.description,
        durationMs,
        action: options.action,
      };

      setAlerts((prev) => [...prev, newAlert]);

      const timer = setTimeout(() => {
        dismissAlert(id);
      }, durationMs);
      timersRef.current.set(id, timer);
    },
    [dismissAlert],
  );

  return (
    <TimedAlertContext.Provider value={{ showAlert, dismissAlert }}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 w-[min(92vw,420px)] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {alerts.map((alert) => (
          <TimedAlertItem key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
        ))}
      </div>
    </TimedAlertContext.Provider>
  );
}

function TimedAlertItem({ alert, onDismiss }: { alert: TimedAlert; onDismiss: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isHovered && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    } else if (!isHovered) {
      timerRef.current = setTimeout(onDismiss, alert.durationMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [alert.durationMs, isHovered, onDismiss]);

  const variantStyles: Record<TimedAlertVariant, string> = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-error",
  };

  const defaultTitles: Record<TimedAlertVariant, string | undefined> = {
    info: undefined,
    success: "Berhasil",
    warning: undefined,
    error: "Terjadi kesalahan",
  };

  return (
    <div
      role="alert"
      className={`alert alert-soft ${variantStyles[alert.variant]} pointer-events-auto shadow-lg`.trim()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="min-w-0 flex-1">
        {(alert.title ?? defaultTitles[alert.variant]) && (
          <p className="font-semibold">{alert.title ?? defaultTitles[alert.variant]}</p>
        )}
        <p className="text-base-content/80">{alert.description}</p>
        {alert.action && (
          <div className="mt-3">
            <button type="button" className="btn btn-xs btn-primary" onClick={alert.action.onClick}>
              {alert.action.label}
            </button>
          </div>
        )}
      </div>
      <button type="button" className="btn btn-xs btn-ghost btn-square" onClick={onDismiss} aria-label="Tutup">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useTimedAlert() {
  const context = useContext(TimedAlertContext);
  if (context === undefined) {
    throw new Error("useTimedAlert must be used within TimedAlertProvider");
  }
  return context;
}
