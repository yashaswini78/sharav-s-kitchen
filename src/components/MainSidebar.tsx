import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  CalendarDays, 
  Truck, 
  Calculator, 
  Settings, 
  LogOut,
  ChefHat,
  LogIn
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: UtensilsCrossed, label: 'Table Services', path: '/tables' },
  { icon: CalendarDays, label: 'Reservations', path: '/reservations' },
  { icon: Truck, label: 'Delivery', path: '/delivery' },
  { icon: Calculator, label: 'Accounting', path: '/accounting' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const MainSidebar = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <aside className="w-64 bg-sidebar h-screen flex flex-col border-r border-sidebar-border sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">Sharav's</h1>
            <p className="text-xs text-muted-foreground">Kitchen POS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Staff Quick Actions */}
      <div className="p-4 border-t border-sidebar-border">
        {isAdmin ? (
          <NavLink
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 mb-2"
          >
            <Settings className="w-5 h-5" />
            Admin Panel
          </NavLink>
        ) : (
          <NavLink
            to="/auth"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 mb-2"
          >
            <LogIn className="w-5 h-5" />
            Admin Login
          </NavLink>
        )}
        
        {/* User Avatar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'G'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email?.split('@')[0] || 'Guest'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user ? (isAdmin ? 'Admin' : 'User') : 'Not signed in'}
            </p>
          </div>
          {user && (
            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-destructive" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
