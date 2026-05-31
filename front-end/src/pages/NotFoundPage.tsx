export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-on-surface-variant mb-6">Halaman yang kamu cari tidak ada atau mungkin sudah dipindahkan. Coba cek kembali URL atau navigasi ke halaman lain.</p>
        <a className="text-primary font-label-md" href="/">
          Kembali ke beranda
        </a>
      </div>
    </div>
  )
}

