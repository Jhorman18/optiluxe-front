export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100 to-blue-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
              👁
            </div>
            <h1 className="text-2xl font-bold text-blue-700">OptiLuxe</h1>
          </div>
          <p className="text-sm text-gray-500">Visión Clara</p>
        </div>

        {children}
      </div>
    </div>
  );
}