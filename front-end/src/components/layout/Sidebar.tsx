import { dashboardNavItems } from '../../data/navigation'

type SidebarProps = {
  currentPath: string
}

export function Sidebar({ currentPath }: SidebarProps) {
  return (
    <nav className="hidden md:flex flex-col h-screen w-64 bg-surface shadow-md shadow-primary/8 fixed left-0 top-0 py-base gap-base z-50">
      <div className="px-container-margin py-6 border-b border-surface-container">
        <h1 className="text-headline-md font-headline-md font-bold text-primary">BurnoutLens</h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Digital Sanctuary Anda</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {dashboardNavItems.map((item) => {
          const active = currentPath === item.href
          return (
            <a
              key={item.label}
              href={item.href}
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

