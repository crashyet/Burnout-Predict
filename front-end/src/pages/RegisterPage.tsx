import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { registerUser } from '../services/authService'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Semua data wajib diisi.')
      return
    }

    if (password.length < 8) {
      setError('Kata sandi minimal harus 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Kata sandi konfirmasi tidak cocok.')
      return
    }

    const result = await registerUser({ name: name.trim(), email: email.trim(), password })
    if (result.success) {
      navigate('/otp-verify')
    } else {
      setError(result.error ?? 'Registrasi gagal. Coba lagi.')
    }
  }

  return (
    <AuthLayout title="Buat Akun Baru" subtitle="Mulai pantau kondisi burnout dan mood harianmu.">
      {error && (
        <div className="bg-error-container text-on-error-container text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2 mb-4 animate-fade-in">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="reg-name">
            Nama Lengkap
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama Lengkap"
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="reg-email">
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="reg-password">
            Kata Sandi
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="reg-confirm-password">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock_reset</span>
            <input
              id="reg-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi kata sandi"
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <div className="bg-surface-container-low border border-surface-container-high rounded-lg p-4 flex gap-3 items-start">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            info
          </span>
          <p className="font-label-sm text-label-sm text-on-surface-variant pt-[2px]">Kode OTP akan dikirim ke email kamu untuk verifikasi akun.</p>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-md text-label-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 flex justify-center items-center gap-2 group mt-2"
        >
          Daftar
          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Sudah punya akun?
          <Link className="font-label-md text-label-md text-primary hover:text-on-primary-container hover:underline transition-colors ml-1" to="/login">
            Masuk
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
