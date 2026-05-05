export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin ${className}`}
    />
  );
}
