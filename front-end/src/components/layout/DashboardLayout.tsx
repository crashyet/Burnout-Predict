import type { PropsWithChildren } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

type DashboardLayoutProps = PropsWithChildren<{
  currentPath: string
  topbarTitle?: string
}>

export function DashboardLayout({ currentPath, topbarTitle, children }: DashboardLayoutProps) {
  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      <Sidebar currentPath={currentPath} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full">
        <Topbar title={topbarTitle} />
        <main className="flex-1 p-container-margin pb-32 md:pb-12 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}
