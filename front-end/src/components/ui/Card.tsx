import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  className?: string
}>

export function Card({ className = '', children }: CardProps) {
  return <div className={`rounded-xl bg-surface-container-lowest border border-outline-variant/30 ${className}`}>{children}</div>
}

