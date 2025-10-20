export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-lg text-gray-700 mb-2">Page Not Found</p>
      <a href="/" className="text-blue-500 underline">back to home</a>
    </div>
  );
}
