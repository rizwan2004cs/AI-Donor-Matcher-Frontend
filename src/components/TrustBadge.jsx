const TIER_STYLES = {
  New: "bg-slate-100 text-slate-600",
  Established: "bg-amber-100 text-amber-700",
  Trusted: "bg-emerald-100 text-emerald-700",
};

export default function TrustBadge({ score, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        TIER_STYLES[label] || TIER_STYLES.New
      }`}
    >
      ★ {label} {score}
    </span>
  );
}
