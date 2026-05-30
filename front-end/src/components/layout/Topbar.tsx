import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../../services/authService'

type TopbarProps = {
  title?: string
}

export function Topbar({ title = 'Dashboard' }: TopbarProps) {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentUser = getCurrentUser()
  const userName = currentUser?.name || 'User'
  const userEmail = currentUser?.email || 'user@email.com'
  
  // Get initials
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <header className="flex justify-between items-center px-container-margin py-4 w-full bg-surface/80 backdrop-blur-md shadow-sm shadow-primary/5 sticky top-0 z-40 border-b border-surface-container">
      <h1 className="text-headline-md font-headline-md font-bold text-on-surface">{title}</h1>
      <div className="flex items-center gap-4 text-on-surface-variant relative" ref={dropdownRef}>
        <button className="p-2 hover:bg-primary/5 rounded-full transition-all active:scale-90 duration-100" type="button">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        
        {/* Profile Button */}
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold overflow-hidden cursor-pointer select-none shadow-sm hover:shadow transition-shadow"
        >
          {initials}
        </div>

        {/* Dropdown Card */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-64 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-xl z-50 animate-fade-in">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="font-label-md text-label-md text-on-surface truncate">{userName}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{userEmail}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-error hover:bg-error/5 transition-colors font-label-md text-label-md text-left"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Keluar / Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
