
export default function Card({
  children,
  className = "",
  title,
  description,
  action,
  padding = true,
}) {
  return (
    <section
      className={`bg-white rounded-2xl border border-[#E7EDF4] shadow-sm overflow-hidden ${className}`}
    >
      {(title || description || action) && (
        <div className="px-6 py-5 border-b border-[#E7EDF4] flex items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-bold text-[#142B46]">{title}</h2>
            )}

            {description && (
              <p className="text-sm text-slate-500 mt-1">
                {description}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={padding ? "p-6" : ""}>
        {children}
      </div>
    </section>
  );
}
