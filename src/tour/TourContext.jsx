import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  getTourSteps,
  markTourCompleted,
  resolveContextTourId,
} from "./tours";

const TourContext = createContext(null);

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getTooltipStyle(targetRect) {
  if (typeof window === "undefined") {
    return {};
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(360, viewportWidth - 32);
  const estimatedHeight = 240;

  if (!targetRect) {
    return {
      width: cardWidth,
      left: clamp((viewportWidth - cardWidth) / 2, 16, viewportWidth - cardWidth - 16),
      top: clamp((viewportHeight - estimatedHeight) / 2, 16, viewportHeight - estimatedHeight - 16),
    };
  }

  const left = clamp(
    targetRect.left + targetRect.width / 2 - cardWidth / 2,
    16,
    viewportWidth - cardWidth - 16
  );
  const canPlaceBelow = targetRect.bottom + estimatedHeight + 24 <= viewportHeight;
  const top = canPlaceBelow
    ? clamp(targetRect.bottom + 16, 16, viewportHeight - estimatedHeight - 16)
    : clamp(targetRect.top - estimatedHeight - 16, 16, viewportHeight - estimatedHeight - 16);

  return {
    width: cardWidth,
    left,
    top,
  };
}

function TourOverlay({ activeStep, activeTourId, stepIndex, totalSteps, onBack, onClose, onNext, targetRect }) {
  if (typeof document === "undefined" || !activeStep) {
    return null;
  }

  const tooltipStyle = getTooltipStyle(targetRect);

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {targetRect ? (
        <div
          className="pointer-events-none fixed rounded-[28px] border-2 border-teal-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.58)] transition-all duration-200"
          style={{
            top: Math.max(targetRect.top - 8, 8),
            left: Math.max(targetRect.left - 8, 8),
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/60" />
      )}

      <section
        className="fixed glass w-[min(22.5rem,calc(100vw-2rem))] rounded-2xl border border-white/60 p-5 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
              {activeTourId.replace(/-/g, " ")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{activeStep.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition-all duration-200 hover:bg-white hover:text-slate-700"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">{activeStep.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-400">
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-700"
            >
              {stepIndex === totalSteps - 1 ? "Finish" : "Next"}
              {stepIndex < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}

export function TourProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTourId, setActiveTourId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const steps = activeTourId ? getTourSteps(activeTourId) : [];
  const activeStep = steps[stepIndex] || null;

  useEffect(() => {
    if (!activeStep?.route || activeStep.route === location.pathname) {
      return;
    }

    navigate(activeStep.route, activeStep.navState ? { state: activeStep.navState } : undefined);
  }, [activeTourId, stepIndex, location.pathname, navigate]);

  useEffect(() => {
    if (!activeStep || (activeStep.route && activeStep.route !== location.pathname)) {
      setTargetRect(null);
      return undefined;
    }

    // If the step requests a pre-click (e.g. switching a tab), fire it first
    if (activeStep.clickBeforeTarget) {
      const trigger = document.querySelector(
        `[data-tour-id="${activeStep.clickBeforeTarget}"]`
      );
      if (trigger) trigger.click();
    }

    let cancelled = false;
    let timeoutId;
    let targetElement = null;

    const selector = activeStep.targetId
      ? `[data-tour-id="${activeStep.targetId}"]`
      : null;

    const updateRect = () => {
      if (!targetElement) {
        setTargetRect(null);
        return;
      }

      const nextRect = targetElement.getBoundingClientRect();
      setTargetRect(
        nextRect.width > 0 && nextRect.height > 0 ? nextRect : null
      );
    };

    const findTarget = () => {
      if (!selector) {
        setTargetRect(null);
        return true;
      }

      targetElement = document.querySelector(selector);
      if (!targetElement) {
        setTargetRect(null);
        return false;
      }

      targetElement.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "smooth",
      });
      updateRect();
      return true;
    };

    let attempts = 0;
    const retryFindTarget = () => {
      if (cancelled) {
        return;
      }

      if (findTarget() || attempts >= 15) {
        return;
      }

      attempts += 1;
      timeoutId = window.setTimeout(retryFindTarget, 160);
    };

    retryFindTarget();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [activeTourId, stepIndex, location.pathname]);

  const closeTour = () => {
    setActiveTourId(null);
    setStepIndex(0);
    setTargetRect(null);
  };

  const startTour = (tourId) => {
    if (!getTourSteps(tourId).length) {
      return;
    }

    setActiveTourId(tourId);
    setStepIndex(0);
  };

  const startContextTour = (role) => {
    const tourId = resolveContextTourId(location.pathname, role);
    if (tourId) {
      startTour(tourId);
    }
  };

  const nextStep = () => {
    if (!activeTourId) {
      return;
    }

    if (stepIndex >= steps.length - 1) {
      markTourCompleted(activeTourId);
      closeTour();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const previousStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  return (
    <TourContext.Provider
      value={{
        activeTourId,
        startTour,
        startContextTour,
        closeTour,
      }}
    >
      {children}
      <TourOverlay
        activeStep={activeStep}
        activeTourId={activeTourId}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        onBack={previousStep}
        onClose={closeTour}
        onNext={nextStep}
        targetRect={targetRect}
      />
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}