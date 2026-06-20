export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Menu Not Found</h2>
        <p className="text-gray-500">
          This menu link doesn&apos;t exist or has been removed.
        </p>
      </div>
    </div>
  );
}
