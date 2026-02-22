import { forwardRef } from "react";

const InputField = forwardRef(function InputField(
  { label, type = "text", placeholder, error, ...rest },
  ref
) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>

      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        {...rest}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
});

export default InputField;