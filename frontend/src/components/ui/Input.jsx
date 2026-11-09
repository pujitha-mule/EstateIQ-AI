
import React from "react";

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}) {
  const inputId =
    id || `input-${label?.toLowerCase().replace(/\s+/g, "-") || "field"}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#142B46] mb-2"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#172B4D] outline-none transition focus:ring-2 focus:ring-blue-100 focus:border-[#1677C8] ${
          error ? "border-red-400" : "border-[#E7EDF4]"
        } ${className}`}
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
