// This page is just a fallback - middleware will redirect to locale-specific routes
export default function RootPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p>You will be redirected to the appropriate language version.</p>
      </div>
    </div>
  );
}