export default function card({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`bg-slate-700 rounded-lg p-4 mb-6 text-left mx-4 ${className}`}>{children}</div>;
}
