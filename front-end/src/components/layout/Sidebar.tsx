import { dashboardNavItems } from '../../data/navigation'

type SidebarProps = {
  currentPath: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ currentPath, isOpen = false, onClose }: SidebarProps) {
  return (
    <nav
      className={`fixed left-0 top-0 h-screen w-64 bg-surface shadow-md shadow-primary/8 py-base gap-base z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-container-margin py-6 border-b border-surface-container flex items-center justify-between">
        <div>
          <h1 className="text-headline-md font-headline-md font-bold text-primary">BurnoutLens</h1>
        </div>
        {/* Close Button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-primary/5 rounded-full transition-colors flex items-center justify-center"
          aria-label="Tutup menu sidebar"
          type="button"
        >
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {dashboardNavItems.map((item) => {
          const active = currentPath === item.href
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-label-md text-label-md ${
                active
                  ? 'text-primary font-bold border-r-4 border-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
