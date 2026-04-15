import { useAuth } from "../auth/AuthContext";
import { useTour } from "../tour/TourContext";
import { resolveFullTourId } from "../tour/tours";
import { Sparkles } from "lucide-react";

export default function TourFAB() {
  const { user } = useAuth();
  const { activeTourId, startTour } = useTour();

  if (activeTourId) return null;

  const tourId = user ? resolveFullTourId(user.role) : null;
  if (!tourId) return null;

  return (
    <button
      data-tour-id="tour-fab"
      onClick={() => startTour(tourId)}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-all duration-200"
      aria-label="Start guided tour"
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );
}
