import { forwardRef } from "react";

const InputField = forwardRef(function InputField(
  { label, type = "text", placeholder, error, required = false, ...rest },
  ref
) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        {...rest}
        className={`w-full rounded-lg px-3 py-2 border transition
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-400"
              : "border-gray-300 focus:ring-2 focus:ring-blue-500"
          }
          focus:outline-none`}
      />

      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

export default InputField;