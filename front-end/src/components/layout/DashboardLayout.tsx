import type { PropsWithChildren } from 'react'
import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

type DashboardLayoutProps = PropsWithChildren<{
  currentPath: string
  topbarTitle?: string
}>

export function DashboardLayout({ currentPath, topbarTitle, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  // Prevent background scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  // Automatically close sidebar drawer when screen is resized to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar currentPath={currentPath} isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full">
        <Topbar title={topbarTitle} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-container-margin pb-32 lg:pb-12 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}
