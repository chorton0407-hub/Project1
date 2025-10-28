import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sky-50 text-neutral-900">
        <header className="border-b border-sky-200 bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Bubble chat</h1> {/* ⬅ rename here */}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>
      </body>
    </html>
  );
}