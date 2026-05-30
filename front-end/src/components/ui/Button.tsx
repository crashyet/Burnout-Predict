import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-label-md text-label-md transition-all active:scale-95'
  const tone =
    variant === 'primary'
      ? 'bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20'
      : 'bg-surface-container-low text-primary hover:bg-surface-container'

  return (
    <button className={`${base} ${tone} ${className}`} {...props}>
      {children}
    </button>
  )
}

