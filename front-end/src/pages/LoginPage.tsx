import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { loginUser } from '../services/authService'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Semua data wajib diisi.')
      return
    }

    const res = await loginUser({ email: email.trim(), password })
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.error || 'Terjadi kesalahan saat masuk.')
    }
  }

  return (
    <AuthLayout title="Masuk ke Akun" subtitle="Lanjutkan perjalanan refleksi dan pemantauan burnout kamu.">
      {error && (
        <div className="bg-error-container text-on-error-container text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2 mb-4 animate-fade-in">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <form className="flex flex-col gap-gutter" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
            <input
              id="email"
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
          <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
            Kata Sandi
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-md text-label-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-300 flex justify-center items-center gap-2 mt-2"
        >
          Masuk
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Belum punya akun?
          <Link className="font-label-md text-label-md text-primary hover:text-on-primary-container hover:underline transition-colors ml-1" to="/register">
            Daftar
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
