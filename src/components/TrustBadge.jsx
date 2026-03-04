const TIER_STYLES = {
  New: "bg-gray-100 text-gray-600",
  Established: "bg-yellow-100 text-yellow-700",
  Trusted: "bg-green-100 text-green-700",
};

export default function TrustBadge({ score, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        TIER_STYLES[label] || TIER_STYLES.New
      }`}
    >
      ★ {label} {score}
    </span>
  );
}
