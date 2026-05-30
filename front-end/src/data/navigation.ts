export type NavItem = {
  label: string
  href: string
  icon: string
}

export const dashboardNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Check-In Harian', href: '/daily-checkin', icon: 'assignment_turned_in' },
  { label: 'Jurnal Harian', href: '/journal', icon: 'edit_note' },
  { label: 'Pemetaan Mood', href: '/mood-map', icon: 'calendar_month' },
]

