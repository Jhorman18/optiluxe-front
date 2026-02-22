export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}