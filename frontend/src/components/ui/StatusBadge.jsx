
const statusStyles = {
  New: "bg-slate-100 text-slate-700",
  "AI qualified": "bg-purple-100 text-purple-700",
  "Visit booked": "bg-blue-100 text-blue-700",
  Visited: "bg-green-100 text-green-700",
  "Human follow-up": "bg-amber-100 text-amber-700",
  Lost: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
      {status || "Unknown"}
    </span>
  );
}
