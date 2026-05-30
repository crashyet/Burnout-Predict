export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Halaman Belum Dimigrasi</h1>
        <p className="text-on-surface-variant mb-6">Tahap ini fokus fondasi React. Coba buka /dashboard atau /login.</p>
        <a className="text-primary font-label-md" href="/dashboard">
          Buka Dashboard
        </a>
      </div>
    </div>
  )
}

