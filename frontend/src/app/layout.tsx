import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';

export const metadata: Metadata = {
  title: 'Corapak Quote App',
  description: 'Internal quote intake for bespoke packaging',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <header className="fixed top-0 right-0 left-0 z-10 flex items-center gap-6 border-b border-slate-200 bg-white px-6 py-3">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="/corapak-logo.png"
              alt="Corapak"
              width={280}
              height={90}
              className="h-16 w-auto object-contain md:h-20"
            />
          </Link>
          <Link
            href="/quotes"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Quotes
          </Link>
        </header>
        <main className="pt-28">{children}</main>
      </body>
    </html>
  );
}
