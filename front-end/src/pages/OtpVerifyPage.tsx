import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { AuthLayout } from '../components/layout/AuthLayout'
import { verifyOtp, resendOtp, saveSession } from '../services/authService'

const OTP_LENGTH = 6

type VerifyStatus = {
  type: 'idle' | 'error' | 'success'
  text: string
}

function CheckIcon({ size = 16, strokeWidth = 3 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function OtpVerifyPage() {
  const navigate = useNavigate()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const otpGroupControls = useAnimationControls()

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [status, setStatus] = useState<VerifyStatus>({ type: 'idle', text: '' })
  const [countdown, setCountdown] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(true)

  const otpCode = otp.join('')
  const isSuccess = status.type === 'success'

  useEffect(() => {
    if (!isResendDisabled) return

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          setIsResendDisabled(false)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isResendDisabled])

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const triggerErrorAnimation = async (message: string) => {
    setStatus({ type: 'error', text: message })

    await otpGroupControls.start({
      x: [0, 8, -8, 8, -8, 0],
      transition: { duration: 0.35 },
    })
  }

  const updateOtp = (index: number, value: string) => {
    if (isSuccess) return

    const digit = value.replace(/[^0-9]/g, '').slice(-1)

    const next = [...otp]
    next[index] = digit
    setOtp(next)

    if (status.type === 'error') {
      setStatus({ type: 'idle', text: '' })
    }

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        focusInput(index - 1)
      }

      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusInput(index + 1)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()

    if (isSuccess) return

    const pastedValue = event.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, OTP_LENGTH)

    if (!pastedValue) return

    const next = Array(OTP_LENGTH).fill('')

    pastedValue.split('').forEach((digit, index) => {
      next[index] = digit
    })

    setOtp(next)
    setStatus({ type: 'idle', text: '' })

    const nextFocusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1)
    window.setTimeout(() => focusInput(nextFocusIndex), 0)
  }

  const handleVerify = async () => {
    if (otpCode.length < OTP_LENGTH) {
      await triggerErrorAnimation('Silakan lengkapi 6 digit kode OTP.')
      return
    }

    // Read the email of the pending user (stored during registration or login)
    let pendingEmail = ''
    let fromLogin = false
    try {
      const raw = localStorage.getItem('pending_user')
      if (raw) {
        const parsed = JSON.parse(raw) as { email?: string; fromLogin?: boolean }
        pendingEmail = parsed.email ?? ''
        fromLogin = parsed.fromLogin ?? false
      }
    } catch { /* ignore */ }

    const result = await verifyOtp({ email: pendingEmail, otp_code: otpCode })
    if (!result.success) {
      await triggerErrorAnimation(result.error ?? 'Kode OTP tidak valid. Coba masukkan 123456 untuk demo.')
      return
    }

    if (fromLogin && result.token && result.user) {
      saveSession(result.user, result.token)
      setStatus({ type: 'success', text: 'Verifikasi berhasil. Mengalihkan ke Dashboard...' })
      window.setTimeout(() => navigate('/dashboard'), 900)
    } else {
      setStatus({ type: 'success', text: 'Verifikasi berhasil. Mengalihkan ke Login...' })
      window.setTimeout(() => navigate('/login'), 900)
    }
  }

  const handleResend = async () => {
    let pendingEmail = ''
    try {
      const raw = localStorage.getItem('pending_user')
      if (raw) pendingEmail = (JSON.parse(raw) as { email?: string }).email ?? ''
    } catch { /* ignore */ }

    if (!pendingEmail) {
      setStatus({ type: 'error', text: 'Email tidak ditemukan. Silakan registrasi ulang.' })
      return
    }

    setOtp(Array(OTP_LENGTH).fill(''))
    setStatus({ type: 'idle', text: '' })

    const result = await resendOtp({ email: pendingEmail })
    if (!result.success) {
      await triggerErrorAnimation(result.error ?? 'Gagal mengirim ulang OTP.')
      return
    }

    setStatus({ type: 'success', text: 'OTP baru telah dikirim ke email kamu.' })
    window.setTimeout(() => {
      setStatus({ type: 'idle', text: '' })
    }, 3000)

    setCountdown(60)
    setIsResendDisabled(true)
    window.setTimeout(() => focusInput(0), 0)
  }

  return (
    <AuthLayout title="Verifikasi OTP" subtitle="Masukkan kode OTP yang telah dikirim ke email kamu.">
      <form className="flex flex-col gap-8" onSubmit={(event) => event.preventDefault()}>
        <div className="relative flex min-h-[96px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className="flex w-full items-center justify-center gap-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-md shadow-primary/20">
                  <CheckIcon size={32} strokeWidth={3} />
                </div>
                <p className="font-label-md text-label-md text-primary">OTP berhasil diverifikasi</p>
              </motion.div>
            ) : (
              <motion.div
                key="otp-input"
                animate={otpGroupControls}
                className="mx-auto flex w-fit max-w-full items-center justify-center gap-2 sm:gap-3"
              >
                {otp.map((digit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 28,
                      delay: index * 0.04,
                    }}
                    className="shrink-0"
                  >
                    <input
                      ref={(element) => {
                        inputRefs.current[index] = element
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => updateOtp(index, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={handlePaste}
                      disabled={isSuccess}
                      autoFocus={index === 0}
                      aria-label={`Digit OTP ${index + 1}`}
                      className={`h-14 w-11 rounded-2xl border bg-surface-container-low text-center font-headline-md text-headline-md text-primary outline-none transition-all duration-300 sm:h-16 sm:w-14 ${
                        status.type === 'error'
                          ? 'border-error text-error ring-2 ring-error/20'
                          : 'border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'
                      }`}
                      placeholder="•"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {status.type !== 'idle' ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                status.type === 'error'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {status.type === 'error' ? 'error' : 'check_circle'}
              </span>
              <span>{status.text}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handleVerify}
            disabled={isSuccess}
            className="w-full rounded-full bg-gradient-to-r from-primary to-surface-tint py-4 font-label-md text-label-md text-on-primary shadow-md shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Verifikasi
          </button>

          <div className="text-center mt-2">
            {isResendDisabled ? (
              <p className="font-label-md text-label-md text-on-surface-variant">
                Kirim ulang OTP dalam {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="cursor-pointer border-none bg-transparent font-label-md text-label-md text-primary transition-colors hover:text-surface-tint hover:underline"
              >
                Belum menerima kode? Kirim Ulang OTP
              </button>
            )}
          </div>
        </div>
      </form>

      <p className="mt-8 text-center font-label-sm text-label-sm text-on-surface-variant/70">
        Aman & terenkripsi oleh standar industri.
      </p>
    </AuthLayout>
  )
}