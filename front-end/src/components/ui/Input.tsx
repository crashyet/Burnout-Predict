import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: string
}

export function Input({ icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {icon ? <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">{icon}</span> : null}
      <input
        className={`w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 ${icon ? 'pl-10' : 'pl-4'} pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md ${className}`}
        {...props}
      />
    </div>
  )
}

