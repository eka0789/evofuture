export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
