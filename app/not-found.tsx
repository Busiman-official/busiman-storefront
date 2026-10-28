export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-semibold text-sf-ink">Store not found</h1>
        <p className="text-sm text-sf-ink-soft">
          This store doesn&apos;t exist, or isn&apos;t published yet.
        </p>
      </div>
    </main>
  );
}
