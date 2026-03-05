export default function NeedProgressBar({ pledged, required }) {
  const pct = Math.min(100, Math.round((pledged / required) * 100));
  return (
    <div className="w-full bg-slate-200 rounded-full h-3">
      <div
        className="bg-teal-500 h-3 rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
