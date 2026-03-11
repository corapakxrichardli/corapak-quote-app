import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Corapak Quote App</h1>
        <p className="mt-2 text-slate-600">Internal quote intake for bespoke packaging. Create and manage sales quotes.</p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/quotes/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New Quote
          </Link>
          <Link
            href="/quotes"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            View Quotes
          </Link>
        </div>
      </div>
    </main>
  );
}
