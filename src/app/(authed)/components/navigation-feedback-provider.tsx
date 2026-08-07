"use client";

import {
  createContext,
  ReactNode,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  getNavigationDestination,
  type NavigationDestination,
} from "@/lib/navigation-feedback";

type NavigationFeedbackContextValue = {
  beginNavigation: (href: string) => boolean;
  pendingDestination: NavigationDestination | null;
  showProgress: boolean;
};

const NavigationFeedbackContext = createContext<NavigationFeedbackContextValue>({
  beginNavigation: () => true,
  pendingDestination: null,
  showProgress: false,
});

export function useNavigationFeedback() {
  return useContext(NavigationFeedbackContext);
}

function NavigationRouteObserver({ onRouteChange }: { onRouteChange: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    onRouteChange();
  }, [onRouteChange, routeKey]);

  return null;
}

export function NavigationFeedbackProvider({ children }: { children: ReactNode }) {
  const [pendingNavigation, setPendingNavigation] =
    useState<NavigationDestination | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const pendingDestination = pendingNavigation;

  const handleRouteChange = useCallback(() => {
    setPendingNavigation(null);
    setShowProgress(false);
  }, []);

  const beginNavigation = useCallback(
    (href: string) => {
      const destination = getNavigationDestination(
        href,
        window.location.href,
        window.location.origin,
      );

      if (!destination) {
        return true;
      }

      if (pendingDestination?.href === destination.href) {
        return false;
      }

      setShowProgress(false);
      setPendingNavigation(destination);
      return true;
    },
    [pendingDestination],
  );

  useEffect(() => {
    if (!pendingDestination) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShowProgress(true), 300);
    return () => window.clearTimeout(timeoutId);
  }, [pendingDestination]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      if (!beginNavigation(anchor.href)) {
        event.preventDefault();
      }
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [beginNavigation]);

  const contextValue = useMemo(
    () => ({ beginNavigation, pendingDestination, showProgress }),
    [beginNavigation, pendingDestination, showProgress],
  );

  return (
    <NavigationFeedbackContext.Provider value={contextValue}>
      <Suspense fallback={null}>
        <NavigationRouteObserver onRouteChange={handleRouteChange} />
      </Suspense>
      {children}
      {showProgress && pendingDestination ? (
        <>
          <div
            className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-blue-50"
            aria-hidden="true"
          >
            <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            Opening {pendingDestination.label}…
          </p>
        </>
      ) : null}
    </NavigationFeedbackContext.Provider>
  );
}
