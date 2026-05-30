import type { PropsWithChildren } from 'react'

type AuthLayoutProps = PropsWithChildren<{
  title: string
  subtitle: string
}>

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed opacity-40 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary-fixed opacity-40 blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-container-margin py-8">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <header className="w-full py-base flex justify-center">
            <span className="font-headline-md text-headline-md text-primary font-bold tracking-tight">BurnoutLens</span>
          </header>

          <main className="w-full">
            <div className="rounded-xl w-full p-8 md:p-10 border border-white/50 bg-white/85 backdrop-blur-[12px] shadow-ambient-1">
              <div className="text-center mb-section-gap">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">{title}</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

